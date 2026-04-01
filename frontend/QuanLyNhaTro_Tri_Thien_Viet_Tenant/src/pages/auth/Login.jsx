import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';
// Giả sử bạn để axiosInstance trong file api.js hoặc tương đương
import { useAuth } from '../../context/AuthContext';
import apiUser from '../../api/apiUser';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); 
  const [form, setForm] = useState({ userName: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
 
    const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!form.userName || !form.password) {
        setError('Vui lòng điền đầy đủ thông tin.');
        return;
    }

    setLoading(true);
    try {
        const response = await apiUser.loginUser(form);
        console.log("res: ",response);
        // const username = response.userName; 
        const token = response.token;
        
        login(response.username,token); 

        navigate('/'); // Hoặc '/' tùy vào cấu trúc route của bạn
        
    } catch (err) {
        console.error(err);
        const msg = err.response?.data?.message || 'Sai tài khoản hoặc mật khẩu!';
        setError(msg);
    } finally {
        setLoading(false);
    }
    };

  return (
    <div className="d-flex align-items-center justify-content-center bg-light" style={{ minHeight: '100vh' }}>
      <div className="card shadow-lg border-0 p-4" style={{ width: '100%', maxWidth: '400px', borderRadius: '15px' }}>
        
        <div className="text-center mb-4">
          <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: '60px', height: '60px', fontSize: '24px' }}>
            
          </div>
          <h4 className="fw-bold text-dark">Hệ Thống Quản Lý</h4>
          <p className="text-muted small">Chào Tri, đăng nhập để quản lý nhà trọ nhé!</p>
        </div>

        {error && (
          <div className="alert alert-danger py-2 small text-center" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-bold">Tên đăng nhập</label>
            <div className="input-group shadow-sm">
              <span className="input-group-text bg-white border-end-0">
                <FaUser className="text-muted" />
              </span>
              <input
                type="text"
                name="userName"
                className="form-control border-start-0 ps-0"
                placeholder="Username..."
                value={form.userName}
                onChange={handleChange}
                style={{ boxShadow: 'none' }}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label small fw-bold">Mật khẩu</label>
            <div className="input-group shadow-sm">
              <span className="input-group-text bg-white border-end-0">
                <FaLock className="text-muted" />
              </span>
              <input
                type="password"
                name="password"
                className="form-control border-start-0 ps-0"
                placeholder="Mật khẩu..."
                value={form.password}
                onChange={handleChange}
                style={{ boxShadow: 'none' }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary w-100 py-2 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 transition-all"
            style={{ borderRadius: '8px' }}
          >
            {loading ? (
              <><span className="spinner-border spinner-border-sm" /> Đang kiểm tra...</>
            ) : (
              <><FaSignInAlt /> Đăng Nhập Ngay</>
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <small className="text-muted">Đồ án tốt nghiệp - IT Student 2026</small>
        </div>
      </div>
    </div>
  );
};

export default Login;