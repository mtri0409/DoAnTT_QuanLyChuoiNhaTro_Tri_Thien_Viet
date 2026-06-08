import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUsers } from 'react-icons/fa';
import GuestRegistration from '../../components/GuestRegistration/GuestRegistration';
import GuestList from '../../components/GuestRegistration/GuestList';
import GuestDetail from '../../components/GuestRegistration/GuestDetail';
import './GuestRegistrationPage.css';

const GuestRegistrationPage = () => {
  const navigate = useNavigate();

  const [view, setView] = useState('list'); // 'list', 'register', 'detail'
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRegisterNew = () => {
    setView('register');
  };

  const handleBackToList = () => {
    setView('list');
    setRefreshKey(prev => prev + 1);
  };

  const handleRegistrationSuccess = () => {
    handleBackToList();
  };

  const handleViewDetail = (memberId) => {
    setSelectedMemberId(memberId);
    setView('detail');
  };

  const handleBackFromDetail = () => {
    setView('list');
    setRefreshKey(prev => prev + 1);
  };

  const getHeaderInfo = () => {
    if (view === 'register') {
      return {
        title: 'Đăng Ký Người Thân Mới',
        icon: <FaUsers className="text-primary" />,
        onBack: handleBackToList
      };
    }
    if (view === 'detail') {
      return {
        title: 'Chi Tiết Đơn Đăng Ký',
        icon: <FaUsers className="text-primary" />,
        onBack: handleBackFromDetail
      };
    }
    return {
      title: 'Quản Lý Người Thân',
      icon: <FaUsers className="text-primary" />,
      onBack: () => navigate(-1)
    };
  };

  const headerInfo = getHeaderInfo();

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div className="d-flex align-items-center gap-2">
          <button className="btn btn-outline-secondary btn-sm rounded-3 shadow-sm d-flex align-items-center gap-1" onClick={headerInfo.onBack} type="button">
            <FaArrowLeft /> Quay lại
          </button>
          <h4 className="fw-bold text-dark mb-0 ms-2 d-flex align-items-center gap-2">
            {headerInfo.icon} {headerInfo.title}
          </h4>
        </div>
        {view === 'list' && (
          <button className="btn btn-primary btn-sm rounded-3 shadow-sm px-3 py-2 fw-semibold" onClick={handleRegisterNew} type="button">
            Đăng ký Người Thân Mới
          </button>
        )}
      </div>

      <div className="page-content">
        {view === 'list' && (
          <GuestList
            key={refreshKey}
            onViewDetail={handleViewDetail}
          />
        )}

        {view === 'register' && (
          <GuestRegistration
            onBack={handleBackToList}
            onSuccess={handleRegistrationSuccess}
          />
        )}

        {view === 'detail' && selectedMemberId && (
          <GuestDetail
            memberId={selectedMemberId}
            onBack={handleBackFromDetail}
          />
        )}
      </div>
    </div>
  );
};

export default GuestRegistrationPage;
