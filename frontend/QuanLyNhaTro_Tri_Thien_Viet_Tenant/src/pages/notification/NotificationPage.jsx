import React, { useEffect, useState } from 'react';
import { FaBell, FaEnvelopeOpen, FaFileInvoiceDollar, FaUserCheck, FaTrashAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import apiNotification from '../../api/apiNotification';


const NotificationPage = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedNoti, setSelectedNoti] = useState(null);

    useEffect(() => {
        fetchNotifications();
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const response = await apiNotification.getNotificationById(user.userId);
            setNotifications(response);
        } catch (error) {
            console.error("Error fetching notifications", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (noti) => {
        setSelectedNoti(noti);
        if (!noti.isRead) {
            try {
                await apiNotification.markAsRead(noti.notificationId);
                setNotifications(prev => 
                    prev.map(n => n.notificationId === noti.notificationId ? { ...n, isRead: true } : n)
                );
            } catch (error) {
                console.error("Error marking as read", error);
            }
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'BILL': case 'Over BILL': return <FaFileInvoiceDollar className="text-danger" />;
            case 'PROFILE_UPDATE': return <FaUserCheck className="text-warning" />;
            default: return <FaBell className="text-primary" />;
        }
    };

    return (
        <div className="container py-4 animate__animated animate__fadeIn">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold text-uppercase"><FaBell className="me-2"/> Trung tâm thông báo</h4>
                <button className="btn btn-outline-primary btn-sm rounded-pill">Đánh dấu tất cả đã đọc</button>
            </div>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="list-group list-group-flush">
                    {notifications.length > 0 ? (
                        notifications.map((noti) => (
                            <div 
                                key={noti.notificationId}
                                onClick={() => handleMarkAsRead(noti)}
                                className={`list-group-item list-group-item-action p-3 border-0 border-bottom d-flex align-items-center gap-3 ${!noti.isRead ? 'bg-light' : ''}`}
                                style={{ cursor: 'pointer', transition: '0.3s' }}
                            >
                                <div className={`p-3 rounded-circle ${!noti.isRead ? 'bg-white shadow-sm' : 'bg-light text-muted'}`}>
                                    {getIcon(noti.type)}
                                </div>
                                <div className="flex-grow-1">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h6 className={`mb-1 ${!noti.isRead ? 'fw-bold' : 'text-secondary'}`}>{noti.title}</h6>
                                        <small className="text-muted">{new Date(noti.createdAt).toLocaleDateString('vi-VN')}</small>
                                    </div>
                                    <p className="mb-0 text-muted small text-truncate" style={{ maxWidth: '500px' }}>{noti.content}</p>
                                </div>
                                {!noti.isRead && <div className="bg-primary rounded-circle" style={{ width: '8px', height: '8px' }}></div>}
                            </div>
                        ))
                    ) : (
                        <div className="p-5 text-center text-muted">Bạn không có thông báo nào.</div>
                    )}
                </div>
            </div>

            {/* Popup Detail Modal (Giống code cũ Tri đã có) */}
            {/* --- MODAL CHI TIẾT THÔNG BÁO --- */}
        {selectedNoti && (
            <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 shadow-lg rounded-4 animate__animated animate__zoomIn animate__faster">
                        <div className="modal-header border-bottom-0 pb-0">
                            <h5 className="modal-title fw-bold text-primary d-flex align-items-center gap-2">
                                {getIcon(selectedNoti.type)} Nội dung thông báo
                            </h5>
                            <button type="button" className="btn-close" onClick={() => setSelectedNoti(null)}></button>
                        </div>
                        
                        <div className="modal-body py-4">
                            <div className="mb-3">
                                <h5 className="fw-bold text-dark mb-1">{selectedNoti.title}</h5>
                                <div className="d-flex align-items-center gap-2 text-muted small">
                                    {/* <FaCalendarAlt size={12} /> */}
                                    <span>{new Date(selectedNoti.createdAt).toLocaleString('vi-VN')}</span>
                                    <span className="badge bg-light text-dark border ms-2 text-uppercase">
                                        {selectedNoti.type}
                                    </span>
                                </div>
                            </div>

                            <div className="p-4 bg-light rounded-4 border-start border-4 border-primary shadow-sm" 
                                style={{ whiteSpace: 'pre-line', fontSize: '0.95rem', lineHeight: '1.6' }}>
                                {selectedNoti.content}
                            </div>
                        </div>

                        <div className="modal-footer border-top-0 pt-0 d-flex justify-content-between">
                            <button 
                                className="btn btn-outline-secondary rounded-pill px-3 btn-sm"
                                onClick={() => setSelectedNoti(null)}
                            >
                                Đóng
                            </button>
                            <button 
                                className="btn btn-primary rounded-pill px-4 shadow-sm" 
                                onClick={() => setSelectedNoti(null)}
                            >
                                Đã hiểu
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
        </div>
    );
};

export default NotificationPage;