import React, { useEffect, useState } from 'react';
import { 
  FaMotorcycle, FaEdit, FaTrash, FaUser, FaDoorOpen, FaPlus, FaIdCard 
} from 'react-icons/fa';
import { Link, useNavigate, useParams } from 'react-router-dom';
import apiProfile from '../../api/apiProfile';
import apiVehicle from '../../api/apiVehicle';

const VehicleGridLayout = () => {
  const navigate = useNavigate();
  const {id} = useParams();
  const [profile,setProfile] =  useState({});
  // Giả sử lấy dữ liệu từ profile hoặc một state listVehicles riêng
  // const vehicles = profile?.vehicles || [];
  // const totalVehicles = profile.vehicles?.length;

  useEffect(()=>{
    if(!id) return;
   
  const fetchVehicleByOwner = async (id)=>{
    try {
      if(!id) return;
      const response = await apiProfile.getProfileById(id);
      console.log("response",response);
      setProfile(response);

    } catch (error) {
      console.log(error);
    }
  }
  fetchVehicleByOwner(id);
  },[id])
 const onDeleteVehicle = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa thông tin xe này?")) {
      try {
        // setLoading(true);
        await apiVehicle.deleteVehicle(id);
        alert("Xóa xe thành công!");
        // if (data.content.length === 1 && currentPage > 1) {
        //   setCurrentPage(currentPage - 1);
        // } else {
        //   fetchVehicles();
        // }
      } catch (err) {
        console.log("error from serve :",err.response)
        alert(err.response?.data?.message || "Không thể xóa xe này!");
      } finally {
        // setLoading(false);
      }
    }
  };
  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      
      {/* HEADER & ACTION CHÍNH */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1 text-uppercase">Hồ sơ phương tiện</h4>
          <p className="text-muted small mb-0">Quản lý danh sách xe gửi của khách thuê</p>
        </div>
        <Link to={`/user/vehicle/${id}/create`} className="btn btn-primary shadow-sm d-flex align-items-center gap-2">
          <FaPlus /> Đăng ký xe mới
        </Link>
      </div>

      <div className="row g-4">
        
        {/* CỘT TRÁI: THỐNG KÊ & THÔNG TIN CHỦ (Optional) */}
        <div className="col-lg-3">
          <div className="row g-4">
            {/* 1. Ô TỔNG SỐ LƯỢNG XE (Yêu cầu của bạn) */}
            <div className="col-12">
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-primary text-white">
                <div className="d-flex align-items-center gap-3">
                  <div className="p-3 bg-white bg-opacity-20 rounded-circle">
                    <FaMotorcycle size={28} />
                  </div>
                  <div>
                    <h6 className="mb-1 opacity-75 text-uppercase small fw-bold">Tổng số xe</h6>
                    <h1 className="mb-0 fw-extrabold">{profile?.vehicles?.length}</h1>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. THÔNG TIN CHỦ XE TẠM THỜI (Để giao diện cân đối) */}
            {profile && (
              <div className="col-12">
                <div className="card border-0 shadow-sm rounded-4 p-4">
                  <h6 className="fw-bold mb-3 text-muted small text-uppercase">Thông tin chủ xe</h6>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <img src={`https://ui-avatars.com/api/?name=${profile.fullName}&background=random`} alt="avatar" className="rounded-circle" width="50"/>
                    <div>
                      <h6 className="fw-bold mb-0">{profile.fullName}</h6>
                      <small className="text-muted">Phòng {profile.roomName || 'N/A'}</small>
                    </div>
                  </div>
                  <div className="text-muted small">
                    <div className="mb-1"><FaIdCard className="me-2"/> {profile.identityNumber || 'Chưa có CCCD'}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CỘT PHẢI: LƯỚI DANH SÁCH XE (Yêu cầu của bạn) */}
        <div className="col-lg-9">
          <div className="card border-0 shadow-sm rounded-4 p-4 min-vh-50">
            <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
              <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
                <FaMotorcycle className="text-warning"/> Danh sách chi tiết
              </h6>
            </div>

            {profile.vehicles  ? (
              <div className="row g-3">
                {profile.vehicles.map((v, index) => (
                  <div key={v.vehicleId || index} className="col-md-6 col-xl-4">
                    {/* THẺ XE CHI TIẾT */}
                    <div className="card h-100 border border-secondary-subtle rounded-3 p-3 hover-shadow transition-all">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="d-flex align-items-center gap-2">
                          <div className="p-2 bg-light rounded text-primary">
                            <FaMotorcycle size={18} />
                          </div>
                          <div>
                            {/* BIỂN SỐ XE (Nổi bật nhất) */}
                            <h6 className="fw-bold mb-0 text-uppercase tracking-wider">{v.licensePlate}</h6>
                            {/* HÃNG XE */}
                            <small className="text-muted text-uppercase x-small fw-semibold">{v.brand || 'Không rõ hãng'}</small>
                          </div>
                        </div>
                        
                        {/* 2 ACTION: EDIT & DELETE (Yêu cầu của bạn) */}
                        <div className="d-flex gap-1">
                          <button 
                            onClick={() => navigate(`/user/vehicle/${v.vehicleId}/update`)}
                            className="btn btn-sm btn-light text-primary rounded-circle p-0 d-flex align-items-center justify-content-center"
                            title="Chỉnh sửa"
                            style={{width: '30px', height: '30px'}}
                          >
                            <FaEdit size={14} />
                          </button>
                          <button 
                            onClick={() => onDeleteVehicle(v.vehicleId)}
                            className="btn btn-sm btn-light text-danger rounded-circle p-0 d-flex align-items-center justify-content-center"
                            title="Xóa xe"
                            style={{width: '30px', height: '30px'}}
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </div>

                      {/* THÔNG TIN PHỤ TRÊN THẺ */}
                      <div className="bg-light rounded-3 p-2 mt-auto">
                        <div className="d-flex justify-content-between x-small text-muted mb-1">
                          <span><FaUser className="me-1"/> Chủ xe:</span>
                          <span className="fw-bold text-dark">{v.ownerName || profile?.fullName}</span>
                        </div>
                        {/* <div className="d-flex justify-content-between x-small text-muted">
                          <span><FaDoorOpen className="me-1"/> Phòng:</span>
                          <span className="badge bg-info-subtle text-info fw-bold">
                            {v.roomName || profile?.roomName || 'N/A'}
                          </span>
                        </div> */}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
            //   {/* TRẠNG THÁI TRỐNG */}
              <div className="text-center py-5 text-muted bg-light rounded-4">
                <FaMotorcycle size={40} className="mb-3 opacity-25"/>
                <h5>Chưa có xe nào được đăng ký</h5>
                <p className="small mb-0">Nhấn nút "Đăng ký xe mới" để thêm phương tiện.</p>
              </div>
            )
            }
          </div>
        </div>

      </div>
    </div>
  );
};

export default VehicleGridLayout;