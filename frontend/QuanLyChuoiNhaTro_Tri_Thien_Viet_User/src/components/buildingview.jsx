import { useMemo } from 'react';
import { Link } from 'react-router-dom';

const getStatus = room => (room.status ?? room.Status ?? '').toUpperCase();

const isRoomVisible = room => {
  const status = getStatus(room);

  if (status === 'AVAILABLE') return true;

  if (status === 'SHARED') {
    return (room.currentPeople ?? 0) < (room.maxPeople ?? 1);
  }

  return false;
};

const formatVND = amount =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount ?? 0);

const STATUS_CFG = {
  AVAILABLE: {
    bg: '#eaf7ea',
    border: '#9fd6a4',
    dot: '#287a35',
    label: 'Còn phòng',
    tagBg: '#eaf7ea',
    tagColor: '#287a35',
  },
  SHARED: {
    bg: '#fff0dc',
    border: '#efc38e',
    dot: '#a95a13',
    label: 'Ở ghép',
    tagBg: '#fff0dc',
    tagColor: '#a95a13',
  },
};

const getCfg = room => STATUS_CFG[getStatus(room)] ?? STATUS_CFG.AVAILABLE;

const getFloorId = floor => floor.floorId ?? floor.id;
const getBranchIdFromFloor = floor => floor.branchId ?? floor.branch?.branchId;
const getBranchIdFromRoom = (room, floorBranchById) =>
  room.branchId ?? room.branch?.branchId ?? floorBranchById[String(room.floorId)] ?? null;

const RoomFloorCard = ({ room }) => {
  const cfg = getCfg(room);

  return (
    <Link to={`/phong/${room.roomId}/chi-tiet`} className="bv-room-link">
      <div className="bv-room-card" style={{ background: cfg.bg, borderColor: cfg.border }}>
        <div className="bv-room-stripe" style={{ background: cfg.dot }} />

        <div className="bv-room-head">
          <span className="bv-room-name">{room.roomName}</span>
          <span className="bv-room-dot" style={{ background: cfg.dot }} />
        </div>

        <div className="bv-room-price">
          {formatVND(room.price)}
          <span>/tháng</span>
        </div>

        <div className="bv-room-line">
          {room.currentPeople ?? 0}/{room.maxPeople ?? 1} người
        </div>

        {room.depositAmount > 0 && (
          <div className="bv-room-deposit">
            Cọc: {formatVND(room.depositAmount)}
          </div>
        )}

        {room.description && (
          <div className="bv-room-desc" title={room.description}>
            {room.description}
          </div>
        )}

        <div className="bv-room-tag" style={{ background: cfg.tagBg, color: cfg.tagColor }}>
          {cfg.label} · chi tiết
        </div>
      </div>
    </Link>
  );
};

const MiniBuildingIcon = ({ floors = 1, active = false }) => {
  const rows = Math.max(Number(floors) || 1, 1);

  return (
    <div className={`bv-mini-building ${active ? 'active' : ''}`}>
      <div className="bv-mini-roof" />
      <div className="bv-mini-body">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="bv-mini-row">
            <span />
            <span />
            <span />
          </div>
        ))}
      </div>
      <div className="bv-mini-ground" />
    </div>
  );
};

export default function BuildingView({
  branches,
  activeBranchId,
  onBranchChange,
  allRooms,
  floors,
  selectedFloor,
  onFloorChange,
  amenities,
  loadingRooms,
}) {
  const floorBranchById = useMemo(() => {
    const map = {};

    floors.forEach(floor => {
      const floorId = getFloorId(floor);
      const branchId = getBranchIdFromFloor(floor);

      if (floorId != null && branchId != null) {
        map[String(floorId)] = branchId;
      }
    });

    return map;
  }, [floors]);

  const visibleRooms = useMemo(
    () => allRooms.filter(isRoomVisible),
    [allRooms],
  );

  const filteredFloors = useMemo(() => {
    if (!activeBranchId) return floors;

    return floors.filter(floor => {
      const branchId = getBranchIdFromFloor(floor);
      return String(branchId) === String(activeBranchId);
    });
  }, [floors, activeBranchId]);

  const roomsInCurrentBranch = useMemo(() => {
    if (!activeBranchId) return visibleRooms;

    return visibleRooms.filter(room => {
      const branchId = getBranchIdFromRoom(room, floorBranchById);
      return String(branchId) === String(activeBranchId);
    });
  }, [visibleRooms, activeBranchId, floorBranchById]);

  const sortedFloorsDesc = useMemo(
    () => [...filteredFloors].sort((a, b) => (b.floorNumber ?? 0) - (a.floorNumber ?? 0)),
    [filteredFloors],
  );

  const roomsOnFloor = useMemo(() => {
    if (!selectedFloor) return roomsInCurrentBranch;

    return roomsInCurrentBranch.filter(room => String(room.floorId) === String(selectedFloor));
  }, [roomsInCurrentBranch, selectedFloor]);

  const roomCountByFloor = useMemo(() => {
    const map = {};

    roomsInCurrentBranch.forEach(room => {
      const floorId = String(room.floorId);
      map[floorId] = (map[floorId] || 0) + 1;
    });

    return map;
  }, [roomsInCurrentBranch]);

  const floorCountByBranch = useMemo(() => {
    const map = {};

    floors.forEach(floor => {
      const branchId = getBranchIdFromFloor(floor);
      if (branchId == null) return;

      const key = String(branchId);
      map[key] = (map[key] || 0) + 1;
    });

    return map;
  }, [floors]);

  const roomCountByBranch = useMemo(() => {
    const map = {};

    visibleRooms.forEach(room => {
      const branchId = getBranchIdFromRoom(room, floorBranchById);
      if (branchId == null) return;

      const key = String(branchId);
      map[key] = (map[key] || 0) + 1;
    });

    return map;
  }, [visibleRooms, floorBranchById]);

  const currentBranch = activeBranchId
    ? branches.find(branch => String(branch.branchId) === String(activeBranchId))
    : null;

  const selectedFloorData = filteredFloors.find(floor =>
    String(getFloorId(floor)) === String(selectedFloor),
  );

  const stats = useMemo(() => {
    const available = roomsOnFloor.filter(room => getStatus(room) === 'AVAILABLE').length;
    const shared = roomsOnFloor.filter(room => getStatus(room) === 'SHARED').length;

    return {
      total: roomsOnFloor.length,
      available,
      shared,
    };
  }, [roomsOnFloor]);

  return (
    <div className="bv-root">
      <style>{`
        .bv-root {
          font-family: "Times New Roman", Times, serif;
          color: #2f241d;
        }

        .bv-panel,
        .bv-info,
        .bv-empty,
        .bv-floor-head,
        .bv-loading,
        .bv-legend,
        .bv-amenities {
          background: #fff;
          border: 1px solid #eadfd4;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(102,64,35,.05);
        }

        .bv-panel {
          padding: 18px;
          margin-bottom: 18px;
        }

        .bv-label {
          color: #8b7665;
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 14px;
        }

        .bv-branch-list {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding-bottom: 6px;
        }

        .bv-branch-card {
          flex-shrink: 0;
          min-width: 172px;
          max-width: 220px;
          cursor: pointer;
          border-radius: 8px;
          padding: 15px 14px;
          border: 1.5px solid #eadfd4;
          background: #fff;
          transition: border-color .18s, background .18s, box-shadow .18s;
          text-align: center;
        }

        .bv-branch-card.active {
          border-color: #df7a35;
          background: #fff4ea;
          box-shadow: 0 6px 18px rgba(102,64,35,.10);
        }

        .bv-branch-name {
          color: #2f241d;
          font-size: 16px;
          font-weight: 700;
          margin-top: 10px;
          margin-bottom: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .bv-branch-card.active .bv-branch-name {
          color: #b85618;
        }

        .bv-branch-address {
          color: #8b7665;
          font-size: 13px;
          margin-bottom: 8px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .bv-branch-meta {
          display: inline-flex;
          border-radius: 5px;
          padding: 4px 9px;
          background: #fff8f0;
          border: 1px solid #f0e4d8;
          color: #6f5f52;
          font-size: 13px;
          font-weight: 700;
        }

        .bv-branch-card.active .bv-branch-meta {
          background: #df7a35;
          border-color: #df7a35;
          color: #fff;
        }

        .bv-mini-building {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          color: #b7a697;
        }

        .bv-mini-building.active {
          color: #df7a35;
        }

        .bv-mini-roof {
          width: 0;
          height: 0;
          border-left: 22px solid transparent;
          border-right: 22px solid transparent;
          border-bottom: 12px solid currentColor;
        }

        .bv-mini-body {
          width: 44px;
          background: currentColor;
          border-radius: 0 0 4px 4px;
          padding: 4px 4px 2px;
        }

        .bv-mini-row {
          display: flex;
          justify-content: space-around;
          margin-bottom: 3px;
        }

        .bv-mini-row span {
          width: 7px;
          height: 7px;
          border-radius: 1px;
          background: rgba(255,255,255,.72);
        }

        .bv-mini-ground {
          width: 52px;
          height: 5px;
          background: currentColor;
          border-radius: 0 0 3px 3px;
        }

        .bv-info {
          background: #fff0dc;
          border-color: #f0d8bd;
          padding: 16px 20px;
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .bv-info-item {
          min-width: 120px;
        }

        .bv-info-label {
          color: #8b7665;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 3px;
        }

        .bv-info-value {
          color: #2f241d;
          font-size: 18px;
          font-weight: 700;
        }

        .bv-empty {
          padding: 30px 20px;
          margin-bottom: 18px;
          text-align: center;
          color: #6f5f52;
        }

        .bv-empty-title {
          color: #2f241d;
          font-size: 19px;
          font-weight: 700;
          margin-bottom: 5px;
        }

        .bv-building-layout {
          display: flex;
          gap: 18px;
          align-items: flex-start;
          margin-bottom: 18px;
        }

        .bv-floor-selector {
          flex-shrink: 0;
          width: 116px;
        }

        .bv-floor-label {
          color: #8b7665;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 8px;
          text-align: center;
        }

        .bv-roof-wrap {
          display: flex;
          justify-content: center;
        }

        .bv-roof {
          width: 0;
          height: 0;
          border-left: 58px solid transparent;
          border-right: 58px solid transparent;
          border-bottom: 30px solid #df7a35;
        }

        .bv-floor-stack {
          border: 2px solid #df7a35;
          border-top: 0;
          border-radius: 0 0 8px 8px;
          overflow: hidden;
          box-shadow: 0 4px 14px rgba(102,64,35,.10);
        }

        .bv-floor-chip {
          padding: 10px 8px;
          text-align: center;
          cursor: pointer;
          border-bottom: 1px solid #f0d8bd;
          background: #fff;
          color: #6f5f52;
        }

        .bv-floor-chip:nth-child(even) {
          background: #fffaf5;
        }

        .bv-floor-chip.active {
          background: #df7a35;
          color: #fff;
        }

        .bv-floor-number {
          font-size: 15px;
          font-weight: 700;
        }

        .bv-floor-count {
          font-size: 12px;
          opacity: .72;
          margin-top: 2px;
          font-weight: 600;
        }

        .bv-ground {
          height: 12px;
          background: #df7a35;
          border-radius: 0 0 6px 6px;
          margin: 0 10px;
        }

        .bv-floor-plan {
          flex: 1;
          min-width: 0;
        }

        .bv-floor-head {
          padding: 15px 18px;
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .bv-floor-title {
          color: #2f241d;
          font-size: 20px;
          font-weight: 700;
        }

        .bv-floor-sub {
          color: #8b7665;
          font-size: 14px;
          margin-top: 2px;
        }

        .bv-stats {
          display: flex;
          gap: 12px;
        }

        .bv-stat {
          text-align: center;
          min-width: 62px;
        }

        .bv-stat-number {
          border-radius: 6px;
          padding: 6px 10px;
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 3px;
        }

        .bv-stat-label {
          color: #8b7665;
          font-size: 13px;
          font-weight: 600;
        }

        .bv-loading,
        .bv-floor-empty {
          background: #fff;
          border: 1px solid #eadfd4;
          border-radius: 8px;
          padding: 46px 20px;
          text-align: center;
          color: #6f5f52;
        }

        .bv-room-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(168px, 1fr));
          gap: 12px;
        }

        .bv-room-link {
          text-decoration: none;
          display: block;
          height: 100%;
        }

        .bv-room-card {
          border: 1.5px solid;
          border-radius: 8px;
          padding: 13px 14px;
          position: relative;
          overflow: hidden;
          height: 100%;
          box-sizing: border-box;
          transition: transform .18s, box-shadow .18s;
          color: #2f241d;
        }

        .bv-room-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102,64,35,.10);
        }

        .bv-room-stripe {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
        }

        .bv-room-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin: 5px 0 8px;
        }

        .bv-room-name {
          font-size: 16px;
          font-weight: 700;
          color: #2f241d;
        }

        .bv-room-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .bv-room-price {
          color: #d86622;
          font-size: 15px;
          font-weight: 700;
          margin-bottom: 6px;
        }

        .bv-room-price span {
          color: #8b7665;
          font-size: 12px;
          font-weight: 500;
        }

        .bv-room-line,
        .bv-room-desc {
          color: #6f5f52;
          font-size: 13px;
          margin-bottom: 6px;
        }

        .bv-room-desc {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .bv-room-deposit {
          display: inline-block;
          background: #fff;
          border: 1px solid #f0d8bd;
          color: #a95a13;
          border-radius: 5px;
          padding: 2px 7px;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 6px;
        }

        .bv-room-tag {
          display: inline-flex;
          border-radius: 5px;
          padding: 3px 8px;
          font-size: 12px;
          font-weight: 700;
        }

        .bv-legend,
        .bv-amenities {
          padding: 15px 18px;
          margin-bottom: 14px;
          display: flex;
          gap: 18px;
          align-items: center;
          flex-wrap: wrap;
        }

        .bv-legend-title,
        .bv-amenities-title {
          color: #2f241d;
          font-size: 16px;
          font-weight: 700;
        }

        .bv-legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .bv-legend-box {
          width: 26px;
          height: 26px;
          border-radius: 6px;
          border: 1.5px solid;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bv-legend-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
        }

        .bv-legend-name {
          color: #2f241d;
          font-size: 14px;
          font-weight: 700;
        }

        .bv-legend-sub {
          color: #8b7665;
          font-size: 12px;
        }

        .bv-amenities {
          align-items: flex-start;
          flex-direction: column;
        }

        .bv-amenity-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .bv-amenity {
          background: #fff8f0;
          border: 1px solid #f0e4d8;
          color: #6f5f52;
          border-radius: 5px;
          padding: 7px 11px;
          font-size: 14px;
          font-weight: 600;
        }

        @media (max-width: 820px) {
          .bv-building-layout {
            flex-direction: column;
          }

          .bv-floor-selector {
            width: 100%;
          }

          .bv-roof-wrap,
          .bv-ground {
            display: none;
          }

          .bv-floor-stack {
            border: 1px solid #eadfd4;
            border-radius: 8px;
            display: flex;
            overflow-x: auto;
          }

          .bv-floor-chip {
            min-width: 86px;
            border-bottom: 0;
            border-right: 1px solid #f0d8bd;
          }
        }

        @media (max-width: 620px) {
          .bv-panel,
          .bv-info,
          .bv-floor-head,
          .bv-legend,
          .bv-amenities {
            padding: 14px;
          }

          .bv-branch-card {
            min-width: 156px;
          }

          .bv-stats {
            width: 100%;
          }

          .bv-stat {
            flex: 1;
          }
        }
      `}</style>

      <div className="bv-panel">
        <div className="bv-label">Chọn tòa nhà / chi nhánh</div>

        <div className="bv-branch-list">
          {branches.map(branch => {
            const branchId = String(branch.branchId);
            const isActive = String(activeBranchId) === branchId;
            const floorCount = floorCountByBranch[branchId] || 0;
            const roomCount = roomCountByBranch[branchId] || 0;

            return (
              <div
                key={branch.branchId}
                onClick={() => onBranchChange(branch.branchId)}
                className={`bv-branch-card ${isActive ? 'active' : ''}`}
              >
                <MiniBuildingIcon floors={floorCount} active={isActive} />

                <div className="bv-branch-name">{branch.branchName}</div>
                <div className="bv-branch-address">{branch.address || 'Chưa có địa chỉ'}</div>
                <div className="bv-branch-meta">
                  {floorCount} tầng · {roomCount} phòng
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {currentBranch ? (
        <div className="bv-info">
          <InfoItem label="Tòa nhà" value={currentBranch.branchName} />
          <InfoItem label="Địa chỉ" value={currentBranch.address || 'Chưa có địa chỉ'} />
          <InfoItem label="Phòng có thể đặt" value={`${roomsInCurrentBranch.length} phòng`} />
          <InfoItem label="Số tầng" value={`${filteredFloors.length} tầng`} />
        </div>
      ) : (
        <div className="bv-empty">
          <div className="bv-empty-title">Chọn một tòa nhà để xem sơ đồ phòng</div>
          <div>Nhấn vào tòa nhà ở phía trên để bắt đầu.</div>
        </div>
      )}

      {currentBranch && (
        <div className="bv-building-layout">
          <div className="bv-floor-selector">
            <div className="bv-floor-label">Chọn tầng</div>

            <div className="bv-roof-wrap">
              <div className="bv-roof" />
            </div>

            <div className="bv-floor-stack">
              {sortedFloorsDesc.length === 0 ? (
                <div className="bv-floor-chip">Chưa có tầng</div>
              ) : sortedFloorsDesc.map((floor) => {
                const floorId = getFloorId(floor);
                const isSelected = String(selectedFloor) === String(floorId);
                const count = roomCountByFloor[String(floorId)] || 0;

                return (
                  <div
                    key={floorId}
                    onClick={() => onFloorChange(String(floorId))}
                    className={`bv-floor-chip ${isSelected ? 'active' : ''}`}
                  >
                    <div className="bv-floor-number">T.{floor.floorNumber}</div>
                    <div className="bv-floor-count">{count} phòng</div>
                  </div>
                );
              })}
            </div>

            <div className="bv-ground" />
          </div>

          <div className="bv-floor-plan">
            <div className="bv-floor-head">
              <div>
                <div className="bv-floor-title">
                  {selectedFloorData ? `Tầng ${selectedFloorData.floorNumber}` : 'Chưa chọn tầng'}
                </div>
                <div className="bv-floor-sub">
                  Chỉ hiện phòng còn trống và phòng ghép còn chỗ.
                </div>
              </div>

              <div className="bv-stats">
                <StatBox
                  count={stats.available}
                  label="Còn phòng"
                  color="#287a35"
                  bg="#eaf7ea"
                />
                <StatBox
                  count={stats.shared}
                  label="Ở ghép"
                  color="#a95a13"
                  bg="#fff0dc"
                />
              </div>
            </div>

            {loadingRooms ? (
              <div className="bv-loading">Đang tải phòng...</div>
            ) : roomsOnFloor.length === 0 ? (
              <div className="bv-floor-empty">
                <div style={{ fontWeight: 700, color: '#2f241d', marginBottom: 5 }}>
                  Tầng này chưa có phòng còn trống hoặc ở ghép còn chỗ
                </div>
                <div>Chọn tầng khác để xem thêm phòng.</div>
              </div>
            ) : (
              <div className="bv-room-grid">
                {roomsOnFloor.map(room => (
                  <RoomFloorCard key={room.roomId} room={room} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bv-legend">
        <span className="bv-legend-title">Chú thích</span>

        {[
          { ...STATUS_CFG.AVAILABLE, sub: 'Phòng đang trống' },
          { ...STATUS_CFG.SHARED, sub: 'Phòng ghép còn chỗ' },
        ].map(({ bg, border, dot, label, sub }) => (
          <div key={label} className="bv-legend-item">
            <div className="bv-legend-box" style={{ background: bg, borderColor: border }}>
              <div className="bv-legend-dot" style={{ background: dot }} />
            </div>
            <div>
              <div className="bv-legend-name">{label}</div>
              <div className="bv-legend-sub">{sub}</div>
            </div>
          </div>
        ))}
      </div>

      {amenities.length > 0 && (
        <div className="bv-amenities">
          <div className="bv-amenities-title">Tiện ích trong tòa nhà</div>

          <div className="bv-amenity-list">
            {amenities.map(amenity => {
              const id = amenity.amenityId ?? amenity.id;

              return (
                <div key={id} className="bv-amenity">
                  {amenity.amenityName}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="bv-info-item">
      <div className="bv-info-label">{label}</div>
      <div className="bv-info-value">{value}</div>
    </div>
  );
}

function StatBox({ count, label, color, bg }) {
  return (
    <div className="bv-stat">
      <div className="bv-stat-number" style={{ color, background: bg }}>
        {count}
      </div>
      <div className="bv-stat-label">{label}</div>
    </div>
  );
}
