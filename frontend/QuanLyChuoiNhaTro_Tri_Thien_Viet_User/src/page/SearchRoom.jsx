import { useState, useEffect, useCallback, useMemo } from "react";
import RoomCard from "../components/RoomCard";
import userService from "../services/userService";

const MAX_PRICE = 20;
const PAGE_SIZE = 5;
const FETCH_SIZE = 100;

const isRoomVisible = (room) => {
  const s = (room.status ?? room.Status ?? "").toUpperCase();
  if (s === "MAINTENANCE" || s === "DEPOSITED") return false;
  if (s === "SHARED") return (room.currentPeople ?? 0) < (room.maxPeople ?? 1);
  return true;
};

const getRoomTag = (room) => {
  const s = (room.status ?? room.Status ?? '').toUpperCase();
  if (s === 'AVAILABLE') return { label: 'Còn phòng', bg: '#eaf7ea', color: '#287a35' };
  if (s === 'SHARED') return { label: 'Ở ghép', bg: '#fff0dc', color: '#a95a13' };
  return null;
};

export default function SearchRoom() {
  const [allRooms, setAllRooms] = useState([]);
  const [branches, setBranches] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [activeBranchId, setActiveBranchId] = useState(null);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [activeAmenities, setActiveAmenities] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(0);

  useEffect(() => {
    userService
      .getAllBranches(1, 50)
      .then((res) => setBranches(Array.isArray(res.content) ? res.content : []))
      .catch(() => setBranches([]));

    userService.getAllAmenities(0, 100)
      .then(res => setAmenities(Array.isArray(res.content) ? res.content : []))
      .catch(() => setAmenities([]));
  }, []);

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setPage(0);

      const [availRes, shareRes] = await Promise.all([
        userService.getAllRooms(0, FETCH_SIZE, 'roomName', 'asc', null, activeBranchId, '', 'AVAILABLE'),
        userService.getAllRooms(0, FETCH_SIZE, 'roomName', 'asc', null, activeBranchId, '', 'SHARED'),
      ]);

      const available = availRes.content || [];
      const shared = shareRes.content || [];

      const merged = [...available, ...shared].filter(
        (room, index, self) => index === self.findIndex((t) => t.roomId === room.roomId),
      );

      setAllRooms(merged);
    } catch (err) {
      console.error("Fetch rooms error:", err);
      setError("Không thể tải danh sách phòng.");
      setAllRooms([]);
    } finally {
      setLoading(false);
    }
  }, [activeBranchId]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const filtered = useMemo(() => {
    return allRooms.filter((room) => {
      if (!isRoomVisible(room)) return false;
      if ((room.price ?? 0) / 1_000_000 > maxPrice) return false;
      if (activeAmenities.length > 0) {
        const hasAllAmenities = activeAmenities.every(id =>
          room.amenities?.some(a => (a.amenityId ?? a.id) === id),
        );
        if (!hasAllAmenities) return false;
      }
      const keyword = searchText.toLowerCase().trim();
      if (keyword) {
        const nameMatch = (room.roomName ?? "").toLowerCase().includes(keyword);
        const descMatch = (room.description ?? "")
          .toLowerCase()
          .includes(keyword);
        if (!nameMatch && !descMatch) return false;
      }
      const tag = getRoomTag(room);
      if (statusFilter === "AVAILABLE" && tag?.label !== "Còn phòng")
        return false;
      if (statusFilter === "SHARED" && tag?.label !== "Ở ghép") return false;
      return true;
    });
  }, [allRooms, maxPrice, activeAmenities, searchText, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const pageRooms = filtered.slice(
    currentPage * PAGE_SIZE,
    (currentPage + 1) * PAGE_SIZE,
  );

  const setFilter = (fn) => { fn(); setPage(0); };
  const handleBranch = (id) => { setActiveBranchId(id); };

  const toggleAmenity = (id) => setFilter(() =>
    setActiveAmenities(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]),
  );

  const resetAll = () => {
    setActiveBranchId(null);
    setMaxPrice(MAX_PRICE);
    setActiveAmenities([]);
    setSearchText("");
    setStatusFilter("ALL");
  };

  const hasFilter =
    activeBranchId !== null ||
    maxPrice < MAX_PRICE ||
    activeAmenities.length > 0 ||
    searchText ||
    statusFilter !== "ALL";
  const sliderPct = (maxPrice / MAX_PRICE) * 100;

  return (
    <main className="sr-page">
      <style>{`
        .sr-page {
          min-height: 100vh;
          background: #fffaf5;
          color: #2f241d;
          font-family: "Times New Roman", Times, serif;
        }

        .sr-wrap {
          max-width: 1200px;
          margin: 0 auto;
          padding: 30px 24px 56px;
        }

        .sr-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 14px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }

        .sr-title {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          color: #2f241d;
        }

        .sr-subtitle {
          margin: 5px 0 0;
          color: #8b7665;
          font-size: 16px;
        }

        .sr-reset {
          border: 1px solid #eadfd4;
          background: #fff;
          color: #6f5f52;
          border-radius: 6px;
          padding: 8px 14px;
          font-family: inherit;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
        }

        .sr-reset:hover {
          background: #fff4ea;
          color: #b85618;
        }

        .sr-search-bar {
          background: #fff;
          border: 1.5px solid #eadfd4;
          border-radius: 8px;
          display: grid;
          grid-template-columns: 1fr auto auto;
          gap: 8px;
          padding: 6px;
          box-shadow: 0 2px 10px rgba(102,64,35,.05);
          margin-bottom: 14px;
        }

        .sr-search-bar:focus-within {
          border-color: #df7a35;
          box-shadow: 0 0 0 3px rgba(223,122,53,.12);
        }

        .sr-search-bar input {
          min-width: 0;
          border: 0;
          outline: 0;
          background: transparent;
          padding: 9px 10px;
          color: #2f241d;
          font-family: inherit;
          font-size: 16px;
        }

        .sr-search-bar input::placeholder {
          color: #a39183;
        }

        .sr-btn {
          border: 0;
          background: #df7a35;
          color: #fff;
          border-radius: 6px;
          padding: 9px 16px;
          font-family: inherit;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
        }

        .sr-btn:hover {
          background: #c96523;
        }

        .sr-clear {
          border: 0;
          background: transparent;
          color: #8b7665;
          font-family: inherit;
          font-size: 16px;
          cursor: pointer;
          padding: 0 6px;
        }

        .sr-chip-row,
        .sr-branch-bar {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .sr-chip-row {
          margin-bottom: 18px;
        }

        .sr-chip {
          border: 1px solid #eadfd4;
          background: #fff;
          color: #6f5f52;
          border-radius: 6px;
          padding: 7px 13px;
          font-family: inherit;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
        }

        .sr-chip.active {
          background: #df7a35;
          border-color: #df7a35;
          color: #fff;
        }

        .sr-chip.green.active {
          background: #eaf7ea;
          border-color: #9fd6a4;
          color: #287a35;
        }

        .sr-chip.amber.active {
          background: #fff0dc;
          border-color: #efc38e;
          color: #a95a13;
        }

        .sr-branch-bar {
          background: #fff;
          border: 1px solid #eadfd4;
          border-radius: 8px;
          padding: 14px;
          margin-bottom: 22px;
          box-shadow: 0 2px 10px rgba(102,64,35,.05);
          align-items: center;
        }

        .sr-label {
          color: #6f5f52;
          font-size: 15px;
          font-weight: 700;
          margin-right: 2px;
        }

        .sr-grid {
          display: grid;
          grid-template-columns: 1fr 268px;
          gap: 22px;
          align-items: start;
        }

        .sr-result-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .sr-result-title {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #2f241d;
          font-size: 20px;
          font-weight: 700;
        }

        .sr-count {
          background: #fff0dc;
          color: #b85618;
          border: 1px solid #f0d8bd;
          border-radius: 5px;
          padding: 2px 8px;
          font-size: 14px;
          font-weight: 700;
        }

        .sr-page-note {
          color: #8b7665;
          font-size: 14px;
        }

        .sr-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .sr-card {
          background: #fff;
          border: 1px solid #eadfd4;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 2px 10px rgba(102,64,35,.05);
        }

        .sr-card-title {
          color: #2f241d;
          font-size: 17px;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .sr-muted-row {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          color: #8b7665;
          font-size: 15px;
          margin-bottom: 12px;
        }

        .sr-price {
          color: #d86622;
          font-weight: 800;
        }

        .sr-slider {
          position: relative;
          height: 22px;
          display: flex;
          align-items: center;
          margin-bottom: 12px;
        }

        .sr-track,
        .sr-fill {
          position: absolute;
          left: 0;
          height: 5px;
          border-radius: 3px;
        }

        .sr-track {
          right: 0;
          background: #f0e4d8;
        }

        .sr-fill {
          background: #df7a35;
        }

        .sr-slider input {
          position: absolute;
          width: 100%;
          height: 22px;
          opacity: 0;
          cursor: pointer;
          z-index: 2;
          margin: 0;
        }

        .sr-thumb {
          position: absolute;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #df7a35;
          border: 3px solid #fff;
          box-shadow: 0 2px 7px rgba(102,64,35,.25);
          pointer-events: none;
        }

        .sr-price-options {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .sr-price-options button,
        .sr-clear-filter,
        .sr-pg {
          font-family: inherit;
          cursor: pointer;
        }

        .sr-price-options button {
          border: 1px solid #eadfd4;
          border-radius: 5px;
          background: #fff;
          color: #6f5f52;
          padding: 5px 8px;
          font-size: 14px;
          font-weight: 700;
        }

        .sr-price-options button.active {
          background: #fff0dc;
          border-color: #df7a35;
          color: #b85618;
        }

        .sr-clear-filter {
          width: 100%;
          margin-top: 12px;
          padding: 9px;
          border: 1px solid #eadfd4;
          border-radius: 6px;
          background: #fff;
          color: #6f5f52;
          font-size: 14px;
          font-weight: 700;
        }

        .sr-clear-filter:hover {
          background: #fff4ea;
          color: #b85618;
        }

        .sr-amenity-row {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 9px 0;
          border-bottom: 1px solid #f0e4d8;
          color: #6f5f52;
          cursor: pointer;
          font-size: 15px;
          font-weight: 600;
          user-select: none;
        }

        .sr-amenity-row:last-child {
          border-bottom: 0;
        }

        .sr-checkbox {
          width: 17px;
          height: 17px;
          border-radius: 4px;
          border: 1.5px solid #d8c7b7;
          background: #fff;
          flex-shrink: 0;
        }

        .sr-checkbox.on {
          background: #df7a35;
          border-color: #df7a35;
          box-shadow: inset 0 0 0 4px #fff;
        }

        .sr-empty,
        .sr-error {
          background: #fff;
          border: 1px solid #eadfd4;
          border-radius: 8px;
          padding: 42px 20px;
          text-align: center;
          color: #6f5f52;
          box-shadow: 0 2px 10px rgba(102,64,35,.05);
        }

        .sr-error p {
          color: #9b3026;
          font-weight: 700;
        }

        .sr-skeleton {
          border-radius: 8px;
          background: linear-gradient(90deg,#f8f1ea 25%,#efe3d8 50%,#f8f1ea 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
          border: 1px solid #eadfd4;
        }

        .sr-pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          margin-top: 26px;
        }

        .sr-pg {
          border: 1px solid #eadfd4;
          border-radius: 6px;
          background: #fff;
          color: #6f5f52;
          padding: 7px 12px;
          font-size: 14px;
          font-weight: 700;
        }

        .sr-pg.active {
          background: #df7a35;
          border-color: #df7a35;
          color: #fff;
        }

        .sr-pg:disabled {
          opacity: .45;
          cursor: not-allowed;
        }

        .sr-sidebar {
          position: sticky;
          top: 104px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .sr-legend-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .sr-legend-row {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #6f5f52;
          font-size: 14px;
        }

        .sr-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .sr-contact {
          background: #fff0dc;
          border: 1px solid #f0d8bd;
          border-radius: 8px;
          padding: 16px;
          color: #6f5f52;
        }

        .sr-contact strong {
          color: #2f241d;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @media (max-width: 980px) {
          .sr-grid {
            grid-template-columns: 1fr;
          }

          .sr-sidebar {
            position: static;
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .sr-wrap {
            padding: 22px 14px 42px;
          }

          .sr-search-bar {
            grid-template-columns: 1fr;
          }

          .sr-btn {
            width: 100%;
          }

          .sr-sidebar {
            grid-template-columns: 1fr;
          }

          .sr-chip {
            flex: 1 1 auto;
          }

          .sr-result-head {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>

      <div className="sr-wrap">
        <div className="sr-header">
          <div>
            <h2 className="sr-title">Tìm phòng trọ</h2>
            <p className="sr-subtitle">Hiển thị phòng còn trống và phòng ghép còn chỗ</p>
          </div>

          {hasFilter && (
            <button type="button" onClick={resetAll} className="sr-reset">
              Xóa bộ lọc
            </button>
          )}
        </div>

        <div className="sr-search-bar">
          <input
            type="text"
            placeholder="Tìm theo tên phòng, mô tả..."
            value={searchText}
            onChange={e => setFilter(() => setSearchText(e.target.value))}
          />
          {searchText && (
            <button type="button" onClick={() => setFilter(() => setSearchText(''))} className="sr-clear">
              Xóa
            </button>
          )}
          <button type="button" className="sr-btn">Tìm kiếm</button>
        </div>

        <div className="sr-chip-row">
          <button className={`sr-chip ${statusFilter === 'ALL' ? 'active' : ''}`} onClick={() => setFilter(() => setStatusFilter('ALL'))}>Tất cả</button>
          <button className={`sr-chip green ${statusFilter === 'AVAILABLE' ? 'active' : ''}`} onClick={() => setFilter(() => setStatusFilter('AVAILABLE'))}>Còn phòng</button>
          <button className={`sr-chip amber ${statusFilter === 'SHARED' ? 'active' : ''}`} onClick={() => setFilter(() => setStatusFilter('SHARED'))}>Ở ghép</button>
        </div>

        <div className="sr-branch-bar">
          <span className="sr-label">Chi nhánh</span>
          <button className={`sr-chip ${activeBranchId === null ? 'active' : ''}`} onClick={() => handleBranch(null)}>Tất cả</button>
          {branches.map(b => (
            <button key={b.branchId} className={`sr-chip ${activeBranchId === b.branchId ? 'active' : ''}`} onClick={() => handleBranch(b.branchId)}>
              {b.branchName}
            </button>
          ))}
        </div>

        <div className="sr-grid">
          <div>
            <div className="sr-result-head">
              <div className="sr-result-title">
                Kết quả
                <span className="sr-count">{filtered.length} phòng</span>
              </div>
              {totalPages > 1 && (
                <span className="sr-page-note">Trang {currentPage + 1} / {totalPages}</span>
              )}
            </div>

            {loading && (
              <div className="sr-list">
                {[1, 2, 3].map(i => <div key={i} className="sr-skeleton" style={{ height: 200 }} />)}
              </div>
            )}

            {!loading && error && (
              <div className="sr-error">
                <p>{error}</p>
                <button className="sr-btn" onClick={fetchRooms}>Thử lại</button>
              </div>
            )}

            {!loading && !error && filtered.length === 0 && (
              <div className="sr-empty">
                <p style={{ fontSize: 18, fontWeight: 700, color: '#2f241d', margin: '0 0 6px' }}>
                  Không tìm thấy phòng phù hợp
                </p>
                <p style={{ fontSize: 15, color: '#8b7665', margin: '0 0 18px' }}>
                  Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                </p>
                <button className="sr-btn" onClick={resetAll}>Xóa bộ lọc</button>
              </div>
            )}

            {!loading && !error && pageRooms.length > 0 && (
              <div className="sr-list">
                {pageRooms.map(room => <RoomCard key={room.roomId} room={room} tag={getRoomTag(room)} />)}
              </div>
            )}

            {!loading && !error && totalPages > 1 && (
              <div className="sr-pagination">
                <button className="sr-pg" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={currentPage === 0}>Trước</button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    className={`sr-pg ${currentPage === i ? "active" : ""}`}
                    onClick={() => setPage(i)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button className="sr-pg" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage === totalPages - 1}>Tiếp</button>
              </div>
            )}
          </div>

          <aside className="sr-sidebar">
            <div className="sr-card">
              <div className="sr-card-title">Giá thuê</div>
              <div className="sr-muted-row">
                <span>0đ</span>
                <span className="sr-price">{maxPrice >= MAX_PRICE ? `${MAX_PRICE}tr+` : `Tối đa ${maxPrice} triệu`}</span>
              </div>

              <div className="sr-slider">
                <div className="sr-track" />
                <div className="sr-fill" style={{ width: `${sliderPct}%` }} />
                <input
                  type="range"
                  min={1}
                  max={MAX_PRICE}
                  step={1}
                  value={maxPrice}
                  onChange={e => setFilter(() => setMaxPrice(Number(e.target.value)))}
                />
                <div className="sr-thumb" style={{ left: `calc(${sliderPct}% - 9px)` }} />
              </div>

              <div className="sr-price-options">
                {[2, 4, 6, 8, 10, MAX_PRICE].map(v => (
                  <button key={v} onClick={() => setFilter(() => setMaxPrice(v))} className={maxPrice === v ? 'active' : ''}>
                    {v >= MAX_PRICE ? `${MAX_PRICE}tr+` : `${v}tr`}
                  </button>
                ))}
              </div>

              {maxPrice < MAX_PRICE && (
                <button onClick={() => setFilter(() => setMaxPrice(MAX_PRICE))} className="sr-clear-filter">
                  Bỏ lọc giá
                </button>
              )}
            </div>

            <div className="sr-card">
              <div className="sr-card-title">Tiện ích</div>
              {amenities.length === 0 ? (
                <p style={{ fontSize: 14, color: '#9a8776', margin: 0 }}>Đang tải...</p>
              ) : amenities.map(a => {
                const id = a.amenityId ?? a.id;
                const on = activeAmenities.includes(id);

                return (
                  <div key={id} className="sr-amenity-row" onClick={() => toggleAmenity(id)}>
                    <div className={`sr-checkbox ${on ? 'on' : ''}`} />
                    <span>{a.amenityName}</span>
                  </div>
                );
              })}

              {activeAmenities.length > 0 && (
                <button onClick={() => setFilter(() => setActiveAmenities([]))} className="sr-clear-filter">
                  Bỏ lọc tiện ích
                </button>
              )}
            </div>

            <div className="sr-card">
              <div className="sr-card-title">Chú thích</div>
              <div className="sr-legend-list">
                <div className="sr-legend-row">
                  <span className="sr-dot" style={{ background: '#287a35' }} />
                  <div>
                    <div style={{ fontWeight: 700, color: '#2f241d' }}>Còn phòng</div>
                    <div style={{ fontSize: 13, color: '#8b7665' }}>Chưa có ai thuê</div>
                  </div>
                </div>
                <div className="sr-legend-row">
                  <span className="sr-dot" style={{ background: '#a95a13' }} />
                  <div>
                    <div style={{ fontWeight: 700, color: '#2f241d' }}>Ở ghép</div>
                    <div style={{ fontSize: 13, color: '#8b7665' }}>Còn chỗ, đang có người thuê</div>
                  </div>
                </div>
                <div style={{ paddingTop: 10, borderTop: '1px solid #f0e4d8', fontSize: 13, color: '#8b7665', lineHeight: 1.5 }}>
                  Phòng bảo trì và đã đặt cọc không hiển thị ở đây.
                </div>
              </div>
            </div>

            <div className="sr-contact">
              <div style={{ fontSize: 17, fontWeight: 700, color: '#2f241d', marginBottom: 10 }}>
                Tư vấn miễn phí
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 15 }}>
                <span>Hotline: <strong>0901 234 567</strong></span>
                <span>Zalo: <strong>0901 234 567</strong></span>
                <span>Thời gian: <strong>7:00 - 22:00 mỗi ngày</strong></span>
              </div>
              <button className="sr-btn" style={{ width: '100%', marginTop: 14 }}>
                Liên hệ ngay
              </button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
