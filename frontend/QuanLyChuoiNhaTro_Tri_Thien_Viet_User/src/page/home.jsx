import { useState, useEffect, useCallback, useMemo } from 'react';
import RoomCard from '../components/RoomCard';
import BuildingView from '../components/buildingview';
import userService from '../services/userService';

const MAX_PRICE = 20;
const PAGE_SIZE = 5;
const FETCH_SIZE = 100;

const getRoomStatus = room => (room.status ?? room.Status ?? '').toUpperCase();

const isAvailableRoom = room => getRoomStatus(room) === 'AVAILABLE';

const isBuildingRoomVisible = room => {
  const status = getRoomStatus(room);

  if (status === 'AVAILABLE') return true;

  if (status === 'SHARED') {
    return (room.currentPeople ?? 0) < (room.maxPeople ?? 1);
  }

  return false;
};

const hasAmenities = (room, activeAmenities) =>
  activeAmenities.every(id =>
    room.amenities?.some(a => (a.amenityId ?? a.id) === id),
  );

const getRoomTag = room => {
  if (getRoomStatus(room) === 'AVAILABLE') {
    return { label: 'Còn phòng', bg: '#eaf7ea', color: '#287a35' };
  }

  return null;
};

export default function Home() {
  const [homeRooms, setHomeRooms] = useState([]);
  const [buildingRooms, setBuildingRooms] = useState([]);

  const [branches, setBranches] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [floors, setFloors] = useState([]);

  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingBuildingRooms, setLoadingBuildingRooms] = useState(true);
  const [error, setError] = useState(null);

  const [activeBranchId, setActiveBranchId] = useState(null);
  const [viewMode, setViewMode] = useState('list');

  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [activeAmenities, setActiveAmenities] = useState([]);
  const [page, setPage] = useState(0);
  const [selectedFloor, setSelectedFloor] = useState(null);

  useEffect(() => {
    userService.getAllBranches(1, 50)
      .then(res => setBranches(Array.isArray(res.content) ? res.content : []))
      .catch(() => setBranches([]));

    userService.getAllAmenities(0, 100)
      .then(res => setAmenities(Array.isArray(res.content) ? res.content : []))
      .catch(() => setAmenities([]));

    userService.getAllFloors()
      .then(res => {
        const data = res.data || res;
        setFloors(Array.isArray(data) ? data : []);
      })
      .catch(() => setFloors([]));
  }, []);

  const loadHomeRooms = useCallback((branchId, isActive = () => true) => {
    userService.getAllRooms(0, FETCH_SIZE, 'roomName', 'asc', null, branchId, '', 'AVAILABLE')
      .then(res => {
        if (!isActive()) return;

        const rooms = Array.isArray(res.content) ? res.content : [];
        setHomeRooms(rooms.filter(isAvailableRoom));
        setError(null);
      })
      .catch(err => {
        if (!isActive()) return;

        console.error('Fetch rooms error:', err);
        setError('Không thể tải danh sách phòng. Vui lòng thử lại.');
        setHomeRooms([]);
      })
      .finally(() => {
        if (!isActive()) return;
        setLoadingRooms(false);
      });
  }, []);

  const loadBuildingRooms = useCallback((isActive = () => true) => {
    Promise.all([
      userService.getAllRooms(0, FETCH_SIZE, 'roomName', 'asc', null, null, '', 'AVAILABLE'),
      userService.getAllRooms(0, FETCH_SIZE, 'roomName', 'asc', null, null, '', 'SHARED'),
    ])
      .then(([availableRes, sharedRes]) => {
        if (!isActive()) return;

        const available = Array.isArray(availableRes.content) ? availableRes.content : [];
        const shared = Array.isArray(sharedRes.content) ? sharedRes.content : [];

        const merged = [...available, ...shared].filter(
          (room, index, self) => index === self.findIndex(item => item.roomId === room.roomId),
        );

        setBuildingRooms(merged.filter(isBuildingRoomVisible));
      })
      .catch(err => {
        if (!isActive()) return;

        console.error('Fetch building rooms error:', err);
        setBuildingRooms([]);
      })
      .finally(() => {
        if (!isActive()) return;
        setLoadingBuildingRooms(false);
      });
  }, []);

  useEffect(() => {
    let active = true;

    loadHomeRooms(activeBranchId, () => active);

    return () => {
      active = false;
    };
  }, [activeBranchId, loadHomeRooms]);

  useEffect(() => {
    let active = true;

    loadBuildingRooms(() => active);

    return () => {
      active = false;
    };
  }, [loadBuildingRooms]);

  const filteredFloors = useMemo(() => {
    if (!activeBranchId) return floors;

    return floors.filter(floor => {
      const floorBranchId = floor.branchId ?? floor.branch?.branchId;
      return String(floorBranchId) === String(activeBranchId);
    });
  }, [floors, activeBranchId]);

  const defaultFloorId = useMemo(() => {
    if (filteredFloors.length === 0) return null;

    const sortedFloors = [...filteredFloors].sort(
      (a, b) => (a.floorNumber ?? 0) - (b.floorNumber ?? 0),
    );

    const firstFloorId = sortedFloors[0]?.floorId ?? sortedFloors[0]?.id;
    return firstFloorId ? String(firstFloorId) : null;
  }, [filteredFloors]);

  const effectiveSelectedFloor = useMemo(() => {
    if (!selectedFloor) return defaultFloorId;

    const stillExists = filteredFloors.some(floor => {
      const floorId = floor.floorId ?? floor.id;
      return String(floorId) === String(selectedFloor);
    });

    return stillExists ? selectedFloor : defaultFloorId;
  }, [filteredFloors, selectedFloor, defaultFloorId]);

  const handleRetry = () => {
    setLoadingRooms(true);
    setError(null);
    setPage(0);
    loadHomeRooms(activeBranchId);
  };

  const handleBranchChange = branchId => {
    setActiveBranchId(branchId);
    setSelectedFloor(null);
    setLoadingRooms(true);
    setError(null);
    setPage(0);
  };

  const toggleAmenity = id => {
    setActiveAmenities(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id],
    );
    setPage(0);
  };

  const filteredRooms = useMemo(() => homeRooms.filter(room => {
    if (!isAvailableRoom(room)) return false;
    if ((room.price ?? 0) / 1_000_000 > maxPrice) return false;
    if (!hasAmenities(room, activeAmenities)) return false;

    return true;
  }), [homeRooms, maxPrice, activeAmenities]);

  const filteredBuildingRooms = useMemo(() => buildingRooms.filter(room => {
    if (!isBuildingRoomVisible(room)) return false;
    if ((room.price ?? 0) / 1_000_000 > maxPrice) return false;
    if (!hasAmenities(room, activeAmenities)) return false;

    return true;
  }), [buildingRooms, maxPrice, activeAmenities]);

  const totalPages = Math.max(1, Math.ceil(filteredRooms.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const pageRooms = filteredRooms.slice(
    currentPage * PAGE_SIZE,
    (currentPage + 1) * PAGE_SIZE,
  );

  const sliderPercent = (maxPrice / MAX_PRICE) * 100;

  return (
    <div className="home-page">
      <style>{`
        .home-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
          font-family: "Times New Roman", Times, serif;
          color: #2f241d;
        }

        .home-toggle {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-bottom: 18px;
          flex-wrap: wrap;
        }

        .home-toggle button,
        .home-chip,
        .home-page-btn,
        .home-clear-btn,
        .home-solid-btn {
          font-family: inherit;
          cursor: pointer;
        }

        .home-toggle button {
          border: 1px solid #eadfd4;
          background: #fff;
          color: #6f5f52;
          border-radius: 6px;
          padding: 9px 14px;
          font-size: 15px;
          font-weight: 700;
        }

        .home-toggle button.active {
          background: #df7a35;
          border-color: #df7a35;
          color: #fff;
        }

        .home-branch-bar,
        .home-filter-card {
          background: #fff;
          border: 1px solid #eadfd4;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(102,64,35,.05);
        }

        .home-branch-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          padding: 14px;
          margin-bottom: 18px;
        }

        .home-label {
          color: #6f5f52;
          font-size: 14px;
          font-weight: 800;
        }

        .home-chip {
          border: 1px solid #eadfd4;
          background: #fff;
          color: #6f5f52;
          border-radius: 6px;
          padding: 7px 12px;
          font-size: 14px;
          font-weight: 700;
        }

        .home-chip.active {
          background: #fff0dc;
          border-color: #df7a35;
          color: #b85618;
        }

        .home-grid {
          display: grid;
          grid-template-columns: 1fr 280px;
          gap: 18px;
          align-items: start;
        }

        .home-section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 14px;
          font-size: 20px;
          font-weight: 800;
        }

        .home-count {
          background: #fff0dc;
          color: #b85618;
          border: 1px solid #f0d8bd;
          border-radius: 5px;
          padding: 2px 8px;
          font-size: 13px;
          font-weight: 800;
        }

        .home-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .home-sidebar {
          position: sticky;
          top: 106px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .home-filter-card {
          padding: 16px;
        }

        .home-filter-title {
          font-size: 16px;
          font-weight: 800;
          margin-bottom: 12px;
        }

        .home-muted-row {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 12px;
          color: #8b7665;
          font-size: 14px;
        }

        .home-price {
          color: #d86622;
          font-weight: 900;
        }

        .home-slider {
          position: relative;
          height: 22px;
          display: flex;
          align-items: center;
          margin-bottom: 12px;
        }

        .home-slider-track,
        .home-slider-fill {
          position: absolute;
          left: 0;
          height: 5px;
          border-radius: 3px;
        }

        .home-slider-track {
          right: 0;
          background: #f0e4d8;
        }

        .home-slider-fill {
          background: #df7a35;
        }

        .home-slider input {
          position: absolute;
          width: 100%;
          height: 22px;
          opacity: 0;
          cursor: pointer;
          z-index: 2;
          margin: 0;
        }

        .home-slider-thumb {
          position: absolute;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #df7a35;
          border: 3px solid #fff;
          box-shadow: 0 2px 7px rgba(102,64,35,.25);
          pointer-events: none;
        }

        .home-price-options {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .home-price-options button {
          border: 1px solid #eadfd4;
          border-radius: 5px;
          background: #fff;
          color: #6f5f52;
          padding: 5px 8px;
          font-family: inherit;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .home-price-options button.active {
          background: #fff0dc;
          border-color: #df7a35;
          color: #b85618;
        }

        .home-amenity {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 9px 0;
          border-bottom: 1px solid #f0e4d8;
          color: #6f5f52;
          cursor: pointer;
          user-select: none;
          font-size: 15px;
          font-weight: 600;
        }

        .home-checkbox {
          width: 17px;
          height: 17px;
          border-radius: 4px;
          border: 1.5px solid #d8c7b7;
          background: #fff;
          flex-shrink: 0;
        }

        .home-checkbox.active {
          background: #df7a35;
          border-color: #df7a35;
          box-shadow: inset 0 0 0 4px #fff;
        }

        .home-clear-btn,
        .home-page-btn {
          border: 1px solid #eadfd4;
          border-radius: 6px;
          background: #fff;
          color: #6f5f52;
          font-size: 14px;
          font-weight: 700;
        }

        .home-clear-btn {
          width: 100%;
          margin-top: 12px;
          padding: 9px;
        }

        .home-empty,
        .home-error {
          background: #fff;
          border: 1px solid #eadfd4;
          border-radius: 8px;
          padding: 42px 20px;
          text-align: center;
          color: #6f5f52;
          font-size: 16px;
        }

        .home-solid-btn {
          border: 0;
          border-radius: 6px;
          background: #df7a35;
          color: #fff;
          padding: 10px 18px;
          font-size: 15px;
          font-weight: 800;
        }

        .home-pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          margin-top: 24px;
        }

        .home-page-btn {
          padding: 7px 12px;
        }

        .home-page-btn.active {
          background: #df7a35;
          border-color: #df7a35;
          color: #fff;
        }

        .home-skeleton {
          height: 190px;
          border-radius: 8px;
          background: linear-gradient(90deg,#f8f1ea 25%,#efe3d8 50%,#f8f1ea 75%);
          background-size: 200% 100%;
          animation: home-shimmer 1.4s infinite;
          border: 1px solid #eadfd4;
        }

        @keyframes home-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @media (max-width: 980px) {
          .home-grid {
            grid-template-columns: 1fr;
          }

          .home-sidebar {
            position: static;
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .home-page {
            padding: 18px 14px 34px;
          }

          .home-toggle {
            justify-content: stretch;
          }

          .home-toggle button {
            flex: 1;
          }

          .home-sidebar {
            grid-template-columns: 1fr;
          }

          .home-chip {
            flex: 1 1 auto;
          }
        }
      `}</style>

      <div className="home-toggle">
        {[
          { mode: 'list', label: 'Danh sách' },
          { mode: 'building', label: 'Sơ đồ tòa nhà' },
        ].map(({ mode, label }) => (
          <button
            key={mode}
            type="button"
            className={viewMode === mode ? 'active' : ''}
            onClick={() => setViewMode(mode)}
          >
            {label}
          </button>
        ))}
      </div>

      {viewMode === 'building' && (
        <BuildingView
          branches={branches}
          activeBranchId={activeBranchId}
          onBranchChange={handleBranchChange}
          allRooms={filteredBuildingRooms}
          floors={floors}
          selectedFloor={effectiveSelectedFloor}
          onFloorChange={setSelectedFloor}
          amenities={amenities}
          loadingRooms={loadingBuildingRooms}
        />
      )}

      {viewMode === 'list' && (
        <>
          <div className="home-branch-bar">
            <span className="home-label">Chi nhánh</span>

            <BranchChip
              label="Tất cả"
              active={activeBranchId === null}
              onClick={() => handleBranchChange(null)}
            />

            {branches.map(branch => (
              <BranchChip
                key={branch.branchId}
                label={branch.branchName}
                active={activeBranchId === branch.branchId}
                onClick={() => handleBranchChange(branch.branchId)}
              />
            ))}
          </div>

          <div className="home-grid">
            <div>
              <div className="home-section-title">
                Danh sách phòng trọ
                <span className="home-count">{filteredRooms.length} phòng</span>
              </div>

              {loadingRooms && (
                <div className="home-list">
                  {[1, 2, 3].map(i => <div key={i} className="home-skeleton" />)}
                </div>
              )}

              {!loadingRooms && error && (
                <div className="home-error">
                  <p>{error}</p>
                  <button type="button" onClick={handleRetry} className="home-solid-btn">
                    Thử lại
                  </button>
                </div>
              )}

              {!loadingRooms && !error && filteredRooms.length === 0 && (
                <div className="home-empty">
                  <p style={{ margin: 0, fontWeight: 700 }}>
                    Không tìm thấy phòng phù hợp. Hãy thử điều chỉnh bộ lọc.
                  </p>
                </div>
              )}

              {!loadingRooms && !error && pageRooms.length > 0 && (
                <div className="home-list">
                  {pageRooms.map(room => (
                    <RoomCard key={room.roomId} room={room} tag={getRoomTag(room)} />
                  ))}
                </div>
              )}

              {!loadingRooms && !error && totalPages > 1 && (
                <div className="home-pagination">
                  <button
                    type="button"
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                    className="home-page-btn"
                    style={{ opacity: currentPage === 0 ? 0.45 : 1 }}
                  >
                    Trước
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPage(i)}
                      className={`home-page-btn ${currentPage === i ? 'active' : ''}`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={currentPage === totalPages - 1}
                    className="home-page-btn"
                    style={{ opacity: currentPage === totalPages - 1 ? 0.45 : 1 }}
                  >
                    Tiếp
                  </button>
                </div>
              )}
            </div>

            <aside className="home-sidebar">
              <div className="home-filter-card">
                <div className="home-filter-title">Lọc theo giá</div>

                <div className="home-muted-row">
                  <span>0đ</span>
                  <span className="home-price">
                    {maxPrice >= MAX_PRICE ? `${MAX_PRICE}tr+` : `Tối đa ${maxPrice} triệu`}
                  </span>
                </div>

                <div className="home-slider">
                  <div className="home-slider-track" />
                  <div className="home-slider-fill" style={{ width: `${sliderPercent}%` }} />
                  <input
                    type="range"
                    min={1}
                    max={MAX_PRICE}
                    step={1}
                    value={maxPrice}
                    onChange={e => {
                      setMaxPrice(Number(e.target.value));
                      setPage(0);
                    }}
                  />
                  <div className="home-slider-thumb" style={{ left: `calc(${sliderPercent}% - 9px)` }} />
                </div>

                <div className="home-price-options">
                  {[2, 4, 6, 8, 10, MAX_PRICE].map(value => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setMaxPrice(value);
                        setPage(0);
                      }}
                      className={maxPrice === value ? 'active' : ''}
                    >
                      {value >= MAX_PRICE ? `${MAX_PRICE}tr+` : `${value}tr`}
                    </button>
                  ))}
                </div>

                {maxPrice < MAX_PRICE && (
                  <button
                    type="button"
                    onClick={() => {
                      setMaxPrice(MAX_PRICE);
                      setPage(0);
                    }}
                    className="home-clear-btn"
                  >
                    Bỏ lọc giá
                  </button>
                )}
              </div>

              <div className="home-filter-card">
                <div className="home-filter-title">Lọc theo tiện ích</div>

                {amenities.length === 0 ? (
                  <p style={{ fontSize: 14, color: '#9a8776', margin: 0 }}>Đang tải...</p>
                ) : amenities.map(amenity => {
                  const id = amenity.amenityId ?? amenity.id;
                  const checked = activeAmenities.includes(id);

                  return (
                    <div
                      key={id}
                      onClick={() => toggleAmenity(id)}
                      className="home-amenity"
                    >
                      <span className={`home-checkbox ${checked ? 'active' : ''}`} />
                      <span>{amenity.amenityName}</span>
                    </div>
                  );
                })}

                {activeAmenities.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveAmenities([]);
                      setPage(0);
                    }}
                    className="home-clear-btn"
                  >
                    Bỏ lọc tiện ích
                  </button>
                )}
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}

function BranchChip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`home-chip ${active ? 'active' : ''}`}
    >
      {label}
    </button>
  );
}
