import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import apiUser from '../../api/apiUser';
import "../auth/login.css";

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
      
      const token = response.token;
      login(response.username, token); 
      navigate('/');
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Sai tài khoản hoặc mật khẩu!';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container d-flex align-items-center justify-content-center bg-light">
      <div className="login-card card shadow-lg border-0 p-4">
        
        <div className="login-header text-center mb-4">
          <div className="login-icon-wrapper bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2">
            {/* Icon placeholder */}
          </div>
          <h4 className="fw-bold text-dark">Hệ Thống Quản Lý</h4>
          <p className="text-muted small">Chào bạn, đăng nhập để quản lý nhà trọ nhé!</p>
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
                className="login-input form-control border-start-0 ps-0"
                placeholder="Username..."
                value={form.userName}
                onChange={handleChange}
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
                className="login-input form-control border-start-0 ps-0"
                placeholder="Mật khẩu..."
                value={form.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="login-button btn btn-primary w-100 py-2 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
                <span>Đang kiểm tra...</span>
              </>
            ) : (
              <>
                <FaSignInAlt />
                <span>Đăng Nhập Ngay</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <small className="text-muted">HỆ THỐNG QUẢN LÝ PHÒNG TRỌ</small>
        </div>
      </div>
    </div>
  );
};

export default Login;