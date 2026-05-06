import React from 'react';
import { FaUserCircle, FaBed, FaHistory, FaTools, FaFileContract, FaPowerOff } from 'react-icons/fa';
import { Link, useNavigate } from "react-router-dom";

const QuickActions = ({profile}) => {
  const navigate = useNavigate();
  const actions = [
    { icon: <FaUserCircle />, label: 'Thông tin cá nhân', color: 'primary',onClick:() =>navigate(`user/profile/${profile.profileId}`) },
    { icon: <FaBed />, label: 'Thông tin phòng', color: 'success'},
    { icon: <FaHistory />, label: 'Lịch sử hóa đơn', color: 'info',onClick:() =>navigate(`user/bills`)  },
    { icon: <FaFileContract />, label: 'Xem hợp đồng', color: 'warning', onClick:() =>navigate(`user/contract/${profile.activeContractId}`) },
    { icon: <FaTools />, label: 'Báo sự cố/Hỏng', color: 'danger' },
    { icon: <FaPowerOff />, label: 'Đăng xuất', color: 'secondary', onClick: () => alert('Đăng xuất!') },
  ];

  return (
    <div className="row g-3">
      {actions.map((action, index) => (
        <div className="col-md-4 col-lg-2" key={index}>
          <div 
            className={`card border-0 shadow-sm rounded-4 h-100 p-3 text-center cursor-pointer hover-shadow action-card border-bottom border-4 border-${action.color}`}
            onClick={action.onClick}
            style={{ cursor: 'pointer' }}
          >
            <div className={`bg-${action.color}-subtle p-3 rounded-circle d-inline-block text-${action.color} mb-3`} style={{width: '60px', height: '60px', margin: '0 auto'}}>
              {React.cloneElement(action.icon, { size: 24 })}
            </div>
            <h6 className="small fw-bold text-dark mb-0">{action.label}</h6>
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuickActions;