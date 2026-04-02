import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaBars, FaBell, FaUserCircle, FaSignOutAlt, FaUserEdit,
  FaSearch, FaTimes, FaBed, FaUsers, FaDollarSign, 
  FaBuilding, FaLayerGroup, FaSpinner
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import apiRoom from '../api/apiRoom';
import apiFloor from '../api/apiFloor';
import apiBranches from '../api/apiBranches';

const Header = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const { logout } = useAuth();

  // ========== SEARCH STATE ==========
  const [searchText, setSearchText] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [allRooms, setAllRooms] = useState([]);
  const [floors, setFloors] = useState([]);
  const [branches, setBranches] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  // ========== CLICK OUTSIDE ==========
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfile(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ========== LOAD DATA LẦN ĐẦU KHI FOCUS VÀO SEARCH ==========
  const loadData = useCallback(async () => {
    if (dataLoaded) return;
    try {
      // Load tất cả phòng (page lớn để lấy hết)
      const roomRes = await apiRoom.getAllRooms(0, 500);
      const roomData = roomRes.data || roomRes;
      const roomList = roomData?.content || [];
      setAllRooms(roomList);

      // Load floors
      const floorRes = await apiFloor.getAllFloors();
      const floorData = floorRes.data || floorRes;
      setFloors(Array.isArray(floorData) ? floorData : []);

      // Load branches
      const branchRes = await apiBranches.getAllBranches(1, 100);
      const branchData = branchRes.data || branchRes;
      setBranches(branchData?.content || []);

      setDataLoaded(true);
    } catch (err) {
      console.error('Load search data error:', err);
    }
  }, [dataLoaded]);

  // ========== FILTER KHI GÕ ==========
  useEffect(() => {
    if (!searchText.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchResults([]);
      setShowSearch(false);
      return;
    }

    setSearching(true);
    const keyword = searchText.toLowerCase().trim();

    const filtered = allRooms.filter(room => {
      const name = (room.roomName || '').toLowerCase();
      return name.includes(keyword);
    });

    // Lấy tối đa 8 kết quả
    setSearchResults(filtered.slice(0, 8));
    setShowSearch(true);
    setSearching(false);
  }, [searchText, allRooms]);

  // ========== HELPER: Lấy tên tầng ==========
  const getFloorNumber = (floorId) => {
    if (!floorId || !Array.isArray(floors)) return '—';
    const floor = floors.find(f => f.floorId === floorId);
    return floor ? `Tầng ${floor.floorNumber}` : '—';
  };

  // ========== HELPER: Lấy tên chi nhánh ==========
  const getBranchName = (floorId) => {
    if (!floorId || !Array.isArray(floors)) return '—';
    const floor = floors.find(f => f.floorId === floorId);
    if (!floor || !floor.branchId) return '—';
    const branch = branches.find(b => b.branchId === floor.branchId);
    return branch ? branch.branchName : '—';
  };

  // ========== HELPER: Format giá ==========
  const formatPrice = (price) => {
    if (!price && price !== 0) return '—';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // ========== HELPER: Status badge ==========
  const getStatusBadge = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return <span className="badge bg-success rounded-pill" style={{ fontSize: '10px' }}>Có sẵn</span>;
      case 'OCCUPIED':
        return <span className="badge bg-warning rounded-pill" style={{ fontSize: '10px' }}>Đã thuê</span>;
      case 'MAINTENANCE':
        return <span className="badge bg-danger rounded-pill" style={{ fontSize: '10px' }}>Bảo trì</span>;
      default:
        return <span className="badge bg-secondary rounded-pill" style={{ fontSize: '10px' }}>{status}</span>;
    }
  };

  // ========== HIGHLIGHT TEXT ==========
  const highlightText = (text, keyword) => {
    if (!keyword.trim() || !text) return text;
    const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) 
        ? <mark key={i} className="bg-warning-subtle text-dark px-0 rounded">{part}</mark> 
        : part
    );
  };

  // ========== NAVIGATE TO DETAIL ==========
  const handleSelectRoom = (roomId) => {
    setSearchText('');
    setShowSearch(false);
    navigate(`/rooms/${roomId}/detail`);
  };

  // ========== HANDLE KEYBOARD ==========
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const handleKeyDown = (e) => {
    if (!showSearch || searchResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelectRoom(searchResults[selectedIndex].roomId);
    } else if (e.key === 'Escape') {
      setShowSearch(false);
      setSearchText('');
    }
  };

  // Reset selected index khi kết quả thay đổi
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedIndex(-1);
  }, [searchResults]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand navbar-light bg-white border-bottom px-4 shadow-sm position-relative">
      {/* Nút Toggle Sidebar */}
      <button className="btn btn-light border" onClick={toggleSidebar}>
        <FaBars />
      </button>

      {/* ========== THANH TÌM KIẾM ========== */}
      <div className="position-relative mx-3 flex-grow-1" ref={searchRef} style={{ maxWidth: '480px' }}>
        <div className="input-group">
          <span className="input-group-text bg-light border-end-0 border-0">
            {searching 
              ? <FaSpinner className="text-muted spin-animation" size={14} /> 
              : <FaSearch className="text-muted" size={14} />
            }
          </span>
          <input
            type="text"
            className="form-control bg-light border-start-0 border-0 py-2"
            placeholder="Tìm phòng theo tên... (VD: A1, P101)"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onFocus={() => {
              loadData();
              if (searchText.trim()) setShowSearch(true);
            }}
            onKeyDown={handleKeyDown}
            style={{ boxShadow: 'none' }}
          />
          {searchText && (
            <button 
              className="btn bg-light border-0 px-3"
              onClick={() => { setSearchText(''); setShowSearch(false); }}
            >
              <FaTimes className="text-muted" size={12} />
            </button>
          )}
        </div>

        {/* ========== DROPDOWN KẾT QUẢ ========== */}
        {showSearch && (
          <div 
            className="position-absolute top-100 start-0 w-100 bg-white shadow-lg border rounded-3 mt-1 overflow-hidden"
            style={{ zIndex: 1050, maxHeight: '420px', overflowY: 'auto' }}
          >
            {searchResults.length > 0 ? (
              <>
                <div className="px-3 py-2 bg-light border-bottom">
                  <small className="text-muted fw-bold">
                    Tìm thấy {searchResults.length} phòng
                    {allRooms.filter(r => (r.roomName || '').toLowerCase().includes(searchText.toLowerCase().trim())).length > 8 && (
                      <span className="text-primary"> (hiển thị 8 đầu tiên)</span>
                    )}
                  </small>
                </div>

                {searchResults.map((room, idx) => (
                  <div
                    key={room.roomId}
                    className={`px-3 py-3 border-bottom d-flex align-items-center gap-3 ${
                      idx === selectedIndex ? 'bg-primary-subtle' : ''
                    }`}
                    style={{ 
                      cursor: 'pointer', 
                      transition: 'background 0.15s'
                    }}
                    onClick={() => handleSelectRoom(room.roomId)}
                    onMouseEnter={(e) => {
                      if (idx !== selectedIndex) e.currentTarget.style.background = '#f8f9fa';
                      setSelectedIndex(idx);
                    }}
                    onMouseLeave={(e) => {
                      if (idx !== selectedIndex) e.currentTarget.style.background = '';
                    }}
                  >
                    {/* Icon phòng */}
                    <div 
                      className="bg-primary-subtle rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: '44px', height: '44px' }}
                    >
                      <FaBed className="text-primary" size={18} />
                    </div>

                    {/* Thông tin phòng */}
                    <div className="flex-grow-1 min-width-0">
                      {/* Dòng 1: Tên + Status */}
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="fw-bold text-dark">
                          {highlightText(room.roomName, searchText)}
                        </span>
                        {getStatusBadge(room.Status || room.status)}
                      </div>

                      {/* Dòng 2: Chi nhánh + Tầng */}
                      <div className="d-flex align-items-center gap-3 small text-muted">
                        <span className="d-flex align-items-center gap-1">
                          <FaBuilding size={10} />
                          {getBranchName(room.floorId)}
                        </span>
                        <span className="d-flex align-items-center gap-1">
                          <FaLayerGroup size={10} />
                          {getFloorNumber(room.floorId)}
                        </span>
                      </div>

                      {/* Dòng 3: Người + Giá */}
                      <div className="d-flex align-items-center gap-3 small mt-1">
                        <span className="d-flex align-items-center gap-1 text-muted">
                          <FaUsers size={10} className="text-info" />
                          {room.currentPeople ?? 0}/{room.maxPeople ?? 1} người
                        </span>
                        <span className="d-flex align-items-center gap-1 fw-semibold text-success">
                          <FaDollarSign size={10} />
                          {formatPrice(room.price)}
                        </span>
                      </div>
                    </div>

                    {/* Mũi tên */}
                    <div className="text-muted flex-shrink-0">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                      </svg>
                    </div>
                  </div>
                ))}

                {/* Footer hint */}
                <div className="px-3 py-2 bg-light text-center">
                  <small className="text-muted">
                    <kbd className="bg-secondary-subtle border px-1 rounded">↑↓</kbd> di chuyển 
                    <kbd className="bg-secondary-subtle border px-1 rounded ms-2">Enter</kbd> chọn 
                    <kbd className="bg-secondary-subtle border px-1 rounded ms-2">Esc</kbd> đóng
                  </small>
                </div>
              </>
            ) : searchText.trim() ? (
              <div className="px-4 py-4 text-center">
                <FaSearch className="text-muted mb-2 opacity-25" size={24} />
                <p className="text-muted small mb-0">
                  Không tìm thấy phòng nào với "<strong>{searchText}</strong>"
                </p>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="ms-auto d-flex align-items-center">
        {/* Thông báo (Bell) */}
        <div className="position-relative me-4" style={{ cursor: 'pointer' }}>
          <FaBell className="text-secondary fs-5" />
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '10px' }}>
            3
          </span>
        </div>

        {/* PROFILE DROPDOWN */}
        <div className="position-relative" ref={dropdownRef}>
          <div 
            className="d-flex align-items-center" 
            style={{ cursor: 'pointer' }}
            onClick={() => setShowProfile(!showProfile)}
          >
            <span className="me-2 fw-bold text-dark d-none d-md-inline">Admin Tri</span>
            <FaUserCircle className="fs-3 text-secondary" />
          </div>

          {showProfile && (
            <div 
              className="position-absolute end-0 mt-2 bg-white shadow-lg border rounded-3 py-2" 
              style={{ width: '180px', zIndex: 1000 }}
            >
              <button className="dropdown-item d-flex align-items-center px-3 py-2 border-0 bg-transparent w-100">
                <FaUserEdit className="me-2 text-primary" /> 
                <Link to="/login" className="small fw-semibold">Đăng nhập</Link>
              </button>
              
              <div className="dropdown-divider mx-2"></div>
              
              <button 
                className="dropdown-item d-flex align-items-center px-3 py-2 border-0 bg-transparent w-100 text-danger"
                onClick={handleLogout}
              >
                <FaSignOutAlt className="me-2" /> 
                <span className="small fw-semibold">Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CSS cho spinner animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin-animation {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </nav>
  );
};

export default Header;