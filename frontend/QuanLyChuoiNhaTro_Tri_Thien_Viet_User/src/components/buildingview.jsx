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

const AMENITY_ICON_MAP = {
  wifi: '📶',
  'máy lạnh': '❄️',
  'điều hòa': '❄️',
  'nóng lạnh': '🚿',
  wc: '🚽',
  toilet: '🚽',
  bếp: '🍳',
  'gác lửng': '🪜',
  'thang máy': '🛗',
  'bãi xe': '🅿️',
  'chỗ để xe': '🅿️',
  'bảo vệ': '💂',
};

const getAmenityIcon = name => {
  const key = Object.keys(AMENITY_ICON_MAP).find(k => name?.toLowerCase().includes(k));
  return key ? AMENITY_ICON_MAP[key] : '✅';
};

const STATUS_CFG = {
  AVAILABLE: {
    bg: '#f0fdf4',
    border: '#86efac',
    dot: '#22c55e',
    label: 'Còn phòng',
    tagBg: '#dcfce7',
    tagColor: '#15803d',
  },
  SHARED: {
    bg: '#fffbeb',
    border: '#fcd34d',
    dot: '#f59e0b',
    label: 'Ở ghép',
    tagBg: '#fef9c3',
    tagColor: '#92400e',
  },
};

const getCfg = room => STATUS_CFG[getStatus(room)] ?? STATUS_CFG.AVAILABLE;

const RoomFloorCard = ({ room }) => {
  const cfg = getCfg(room);

  const card = (
    <div
      style={{
        borderRadius: 14,
        padding: '14px 16px',
        border: `2px solid ${cfg.border}`,
        background: cfg.bg,
        transition: 'all 0.2s',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        boxSizing: 'border-box',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = `0 12px 28px ${cfg.border}99`;
        e.currentTarget.style.borderColor = cfg.dot;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '';
        e.currentTarget.style.borderColor = cfg.border;
      }}
    >
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: cfg.dot,
        borderRadius: '14px 14px 0 0',
      }} />

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
        marginTop: 4,
      }}>
        <span style={{ fontWeight: 800, fontSize: 15, color: '#0f172a', letterSpacing: '-0.02em' }}>
          {room.roomName}
        </span>
        <div style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: cfg.dot,
          flexShrink: 0,
          boxShadow: `0 0 0 3px ${cfg.tagBg}`,
        }} />
      </div>

      <div style={{ fontSize: 13, fontWeight: 700, color: '#4361ee', marginBottom: 6 }}>
        {formatVND(room.price)}
        <span style={{ fontSize: 11, fontWeight: 500, color: '#94a3b8', marginLeft: 2 }}>/tháng</span>
      </div>

      <div style={{
        fontSize: 12,
        color: '#64748b',
        marginBottom: 6,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}>
        <span>👥</span>
        <span>
          <strong style={{ color: '#0f172a' }}>{room.currentPeople ?? 0}</strong>
          <span style={{ color: '#cbd5e1' }}>/{room.maxPeople ?? 1}</span> người
        </span>
      </div>

      {room.depositAmount > 0 && (
        <div style={{
          display: 'inline-block',
          fontSize: 11,
          fontWeight: 600,
          background: '#fef9c3',
          color: '#92400e',
          padding: '2px 8px',
          borderRadius: 6,
          marginBottom: 6,
        }}>
          Cọc: {formatVND(room.depositAmount)}
        </div>
      )}

      {room.description && (
        <div
          title={room.description}
          style={{
            fontSize: 11.5,
            color: '#94a3b8',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            marginBottom: 8,
          }}
        >
          {room.description}
        </div>
      )}

      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        background: cfg.tagBg,
        color: cfg.tagColor,
        fontSize: 11,
        fontWeight: 700,
        padding: '3px 10px',
        borderRadius: 20,
      }}>
        <span>{cfg.label}</span>
        <span style={{ opacity: 0.7 }}>→ chi tiết</span>
      </div>
    </div>
  );

  return (
    <Link to={`/phong/${room.roomId}/chi-tiet`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      {card}
    </Link>
  );
};

const MiniBuildingIcon = ({ floors = 4, active = false }) => {
  const color = active ? '#4361ee' : '#94a3b8';
  const rows = Math.min(Math.max(floors, 1), 6);

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{
        width: 0,
        height: 0,
        borderLeft: '22px solid transparent',
        borderRight: '22px solid transparent',
        borderBottom: `12px solid ${color}`,
      }} />
      <div style={{
        width: 44,
        background: color,
        borderRadius: '0 0 4px 4px',
        padding: '4px 4px 2px',
      }}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 3 }}>
            <div style={{ width: 7, height: 7, borderRadius: 1, background: 'rgba(255,255,255,0.7)' }} />
            <div style={{ width: 7, height: 7, borderRadius: 1, background: 'rgba(255,255,255,0.7)' }} />
            <div style={{ width: 7, height: 7, borderRadius: 1, background: 'rgba(255,255,255,0.7)' }} />
          </div>
        ))}
      </div>
      <div style={{ width: 52, height: 5, background: color, borderRadius: '0 0 3px 3px' }} />
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
  const visibleRooms = useMemo(
    () => allRooms.filter(isRoomVisible),
    [allRooms],
  );

  const filteredFloors = useMemo(() => {
    if (!activeBranchId) return floors;

    return floors.filter(floor => {
      const branchId = floor.branchId ?? floor.branch?.branchId;
      return String(branchId) === String(activeBranchId);
    });
  }, [floors, activeBranchId]);

  const sortedFloorsDesc = useMemo(
    () => [...filteredFloors].sort((a, b) => (b.floorNumber ?? 0) - (a.floorNumber ?? 0)),
    [filteredFloors],
  );

  const roomsOnFloor = useMemo(() => {
    if (!selectedFloor) return visibleRooms;

    return visibleRooms.filter(room => String(room.floorId) === String(selectedFloor));
  }, [visibleRooms, selectedFloor]);

  const roomCountByFloor = useMemo(() => {
    const map = {};

    visibleRooms.forEach(room => {
      const floorId = String(room.floorId);
      map[floorId] = (map[floorId] || 0) + 1;
    });

    return map;
  }, [visibleRooms]);

  const floorCountByBranch = useMemo(() => {
    const map = {};

    floors.forEach(floor => {
      const branchId = String(floor.branchId ?? floor.branch?.branchId);
      map[branchId] = (map[branchId] || 0) + 1;
    });

    return map;
  }, [floors]);

  const roomCountByBranch = useMemo(() => {
    const map = {};

    visibleRooms.forEach(room => {
      const branchId = String(room.branchId ?? room.branch?.branchId);
      map[branchId] = (map[branchId] || 0) + 1;
    });

    return map;
  }, [visibleRooms]);

  const currentBranch = activeBranchId
    ? branches.find(branch => String(branch.branchId) === String(activeBranchId))
    : null;

  const selectedFloorData = filteredFloors.find(floor => {
    const floorId = floor.floorId ?? floor.id;
    return String(floorId) === String(selectedFloor);
  });

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
    <div style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
      <div style={{
        background: '#fff',
        borderRadius: 18,
        padding: '20px 24px',
        boxShadow: '0 2px 20px rgba(67,97,238,0.09)',
        marginBottom: 20,
      }}>
        <div style={{
          fontSize: 11,
          fontWeight: 700,
          color: '#94a3b8',
          letterSpacing: '.1em',
          textTransform: 'uppercase',
          marginBottom: 18,
        }}>
          🏢 Chọn tòa nhà / Chi nhánh
        </div>

        <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }}>
          {branches.map(branch => {
            const isActive = String(activeBranchId) === String(branch.branchId);
            const floorCount = floorCountByBranch[String(branch.branchId)] || 0;
            const roomCount = roomCountByBranch[String(branch.branchId)] || 0;

            return (
              <div
                key={branch.branchId}
                onClick={() => onBranchChange(branch.branchId)}
                style={{
                  flexShrink: 0,
                  minWidth: 170,
                  maxWidth: 220,
                  cursor: 'pointer',
                  borderRadius: 16,
                  padding: '18px 16px 14px',
                  border: `2.5px solid ${isActive ? '#4361ee' : '#e2e8f0'}`,
                  background: isActive ? '#eef0fd' : '#f8fafc',
                  transition: 'all 0.2s',
                  textAlign: 'center',
                  boxShadow: isActive ? '0 6px 20px rgba(67,97,238,0.18)' : 'none',
                }}
              >
                <div style={{ marginBottom: 12 }}>
                  <MiniBuildingIcon floors={floorCount} active={isActive} />
                </div>

                <div style={{
                  fontWeight: 800,
                  fontSize: 14,
                  color: isActive ? '#4361ee' : '#0f172a',
                  marginBottom: 5,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {branch.branchName}
                </div>

                <div style={{
                  fontSize: 11,
                  color: '#94a3b8',
                  marginBottom: 8,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  📍 {branch.address || '—'}
                </div>

                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  background: isActive ? '#4361ee' : '#f1f5f9',
                  color: isActive ? '#fff' : '#64748b',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: 20,
                }}>
                  {floorCount} tầng · {roomCount} phòng
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {currentBranch ? (
        <div style={{
          background: 'linear-gradient(135deg, #4361ee 0%, #2d4fd6 100%)',
          borderRadius: 16,
          padding: '18px 28px',
          marginBottom: 20,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          flexWrap: 'wrap',
          rowGap: 12,
          boxShadow: '0 8px 24px rgba(67,97,238,0.3)',
        }}>
          {[
            { label: 'Tòa nhà', value: currentBranch.branchName, big: true },
            null,
            { label: 'Địa chỉ', value: currentBranch.address || '—', big: false },
            null,
            { label: 'Phòng có thể đặt', value: `${visibleRooms.length} phòng`, big: true },
            null,
            { label: 'Số tầng', value: `${filteredFloors.length} tầng`, big: true },
          ].map((item, index) =>
            item === null ? (
              <div
                key={index}
                style={{
                  width: 1,
                  height: 40,
                  background: 'rgba(255,255,255,0.2)',
                  margin: '0 24px',
                  flexShrink: 0,
                }}
              />
            ) : (
              <div key={index}>
                <div style={{
                  fontSize: 10,
                  opacity: 0.7,
                  fontWeight: 700,
                  letterSpacing: '.09em',
                  textTransform: 'uppercase',
                  marginBottom: 3,
                }}>
                  {item.label}
                </div>
                <div style={{ fontSize: item.big ? 18 : 14, fontWeight: item.big ? 800 : 600 }}>
                  {item.value}
                </div>
              </div>
            ),
          )}
        </div>
      ) : (
        <div style={{
          background: '#fff',
          borderRadius: 16,
          padding: '32px 24px',
          marginBottom: 20,
          textAlign: 'center',
          boxShadow: '0 2px 12px rgba(0,0,0,.05)',
        }}>
          <div style={{ fontSize: 48, marginBottom: 10 }}>🏢</div>
          <p style={{ fontWeight: 700, color: '#475569', fontSize: 16, marginBottom: 4 }}>
            Chọn một tòa nhà để xem sơ đồ phòng
          </p>
          <p style={{ fontSize: 13, color: '#94a3b8' }}>
            Nhấn vào tòa nhà ở phía trên để bắt đầu
          </p>
        </div>
      )}

      {currentBranch && (
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', marginBottom: 20 }}>
          <div style={{ flexShrink: 0, width: 116 }}>
            <div style={{
              fontSize: 10,
              fontWeight: 700,
              color: '#94a3b8',
              letterSpacing: '.09em',
              textTransform: 'uppercase',
              marginBottom: 10,
              textAlign: 'center',
            }}>
              Chọn tầng
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: 0,
                height: 0,
                borderLeft: '58px solid transparent',
                borderRight: '58px solid transparent',
                borderBottom: '30px solid #4361ee',
              }} />
            </div>

            <div style={{
              border: '2.5px solid #4361ee',
              borderTop: 'none',
              borderRadius: '0 0 10px 10px',
              overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(67,97,238,0.15)',
            }}>
              {sortedFloorsDesc.length === 0 ? (
                <div style={{ padding: '16px 8px', textAlign: 'center', fontSize: 12, color: '#94a3b8' }}>
                  Chưa có tầng
                </div>
              ) : sortedFloorsDesc.map((floor, index) => {
                const floorId = floor.floorId ?? floor.id;
                const isSelected = String(selectedFloor) === String(floorId);
                const count = roomCountByFloor[String(floorId)] || 0;
                const isLast = index === sortedFloorsDesc.length - 1;

                return (
                  <div
                    key={floorId}
                    onClick={() => onFloorChange(String(floorId))}
                    style={{
                      padding: '11px 8px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      borderBottom: isLast ? 'none' : '1px solid rgba(67,97,238,0.15)',
                      background: isSelected ? '#4361ee' : index % 2 === 0 ? '#f8fafc' : '#fff',
                      transition: 'all 0.15s',
                      color: isSelected ? '#fff' : '#334155',
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '-0.01em' }}>
                      T.{floor.floorNumber}
                    </div>
                    <div style={{ fontSize: 10, opacity: isSelected ? 0.8 : 0.55, marginTop: 2, fontWeight: 600 }}>
                      {count} phòng
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{
              height: 12,
              background: '#4361ee',
              borderRadius: '0 0 6px 6px',
              margin: '0 10px',
              boxShadow: '0 6px 14px rgba(67,97,238,0.25)',
            }} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              background: '#fff',
              borderRadius: 14,
              padding: '16px 22px',
              boxShadow: '0 2px 14px rgba(0,0,0,.06)',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
            }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 18, color: '#0f172a', letterSpacing: '-0.02em' }}>
                  {selectedFloorData ? `Tầng ${selectedFloorData.floorNumber}` : 'Chưa chọn tầng'}
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                  Sơ đồ bố trí phòng · chỉ hiện phòng còn trống và ở ghép còn chỗ
                </div>
              </div>

              <div style={{ display: 'flex', gap: 20, flexShrink: 0 }}>
                {[
                  { count: stats.available, label: 'Còn phòng', color: '#22c55e', bg: '#dcfce7' },
                  { count: stats.shared, label: 'Ở ghép', color: '#f59e0b', bg: '#fef9c3' },
                ].map(({ count, label, color, bg }) => (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color,
                      background: bg,
                      borderRadius: 10,
                      width: 44,
                      height: 36,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 4px',
                    }}>
                      {count}
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {loadingRooms ? (
              <div style={{
                background: '#fff',
                borderRadius: 14,
                padding: '56px 0',
                textAlign: 'center',
                color: '#94a3b8',
                boxShadow: '0 2px 14px rgba(0,0,0,.06)',
              }}>
                <div style={{
                  display: 'inline-block',
                  width: 32,
                  height: 32,
                  border: '3px solid #e2e8f0',
                  borderTopColor: '#4361ee',
                  borderRadius: '50%',
                  animation: 'bv-spin 0.7s linear infinite',
                }} />
                <style>{`@keyframes bv-spin { to { transform: rotate(360deg) } }`}</style>
                <p style={{ marginTop: 12, fontWeight: 600 }}>Đang tải phòng...</p>
              </div>
            ) : roomsOnFloor.length === 0 ? (
              <div style={{
                background: '#fff',
                borderRadius: 14,
                padding: '56px 24px',
                textAlign: 'center',
                boxShadow: '0 2px 14px rgba(0,0,0,.06)',
              }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>🛏️</div>
                <p style={{ fontWeight: 700, color: '#475569', fontSize: 15, marginBottom: 4 }}>
                  Tầng này chưa có phòng còn trống hoặc ở ghép còn chỗ
                </p>
                <p style={{ fontSize: 13, color: '#94a3b8' }}>Chọn tầng khác để xem thêm phòng</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(168px, 1fr))',
                gap: 14,
              }}>
                {roomsOnFloor.map(room => (
                  <RoomFloorCard key={room.roomId} room={room} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{
        background: '#fff',
        borderRadius: 14,
        padding: '16px 24px',
        boxShadow: '0 2px 12px rgba(0,0,0,.05)',
        marginBottom: 16,
        display: 'flex',
        gap: 28,
        alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#475569', flexShrink: 0 }}>
          Chú thích:
        </span>

        {[
          { ...STATUS_CFG.AVAILABLE, label2: 'Phòng đang trống' },
          { ...STATUS_CFG.SHARED, label2: 'Phòng ghép còn chỗ' },
        ].map(({ bg, border, dot, label, label2 }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              background: bg,
              border: `2px solid ${border}`,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: dot }} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{label}</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>{label2}</div>
            </div>
          </div>
        ))}
      </div>

      {amenities.length > 0 && (
        <div style={{
          background: '#fff',
          borderRadius: 14,
          padding: '20px 24px',
          boxShadow: '0 2px 12px rgba(0,0,0,.05)',
        }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginBottom: 16, letterSpacing: '-0.01em' }}>
            ✨ Tiện ích trong tòa nhà
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {amenities.map(amenity => {
              const id = amenity.amenityId ?? amenity.id;

              return (
                <div key={id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: '#f4f6fb',
                  borderRadius: 10,
                  padding: '9px 16px',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#475569',
                  border: '1.5px solid #e2e8f0',
                }}>
                  <span style={{ fontSize: 16 }}>{getAmenityIcon(amenity.amenityName)}</span>
                  <span>{amenity.amenityName}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
