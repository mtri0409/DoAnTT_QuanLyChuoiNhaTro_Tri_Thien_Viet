import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaBed,
  FaDollarSign,
  FaFileAlt,
  FaUsers,
  FaBuilding,
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaCheck,
  FaToggleOn,
  FaImage,
  FaMapMarkerAlt,
  FaLayerGroup,
  FaStar,
  FaChevronLeft,
  FaChevronRight,
  FaExpand,
  FaTimes,
  FaWifi,
  FaSnowflake,
  FaTv,
  FaShower,
  FaParking,
  FaInfoCircle,
  FaThLarge,
  FaExclamationTriangle,
  FaFan,
  FaBolt,
  FaTint,
  FaCouch,
  FaUtensils,
  FaFireExtinguisher,
  FaDoorOpen,
  FaLock,
  FaCamera,
  FaFileContract,
} from "react-icons/fa";
import { imgURL } from "../../api/config";
import apiRoom from "../../api/apiRoom";
import apiFloor from "../../api/apiFloor";
import apiBranches from "../../api/apiBranches";
import apiContract from "../../api/apiContract";
import apiProfile from "../../api/apiProfile";
import { toast } from "react-toastify";

const RoomDetail = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [floors, setFloors] = useState([]);
  const [branches, setBranches] = useState([]);

  const [contract, setContract] = useState(null);
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const roomRes = await apiRoom.getRoomById(roomId);
        const roomData = roomRes.data || roomRes;
        setRoom(roomData);

        const floorRes = await apiFloor.getAllFloors();
        const floorData = floorRes.data || floorRes;
        setFloors(Array.isArray(floorData) ? floorData : []);

        const branchRes = await apiBranches.getAllBranches(1, 100);
        const branchData = branchRes.data || branchRes;
        setBranches(branchData?.content || []);

        try {
          setLoadingMembers(true);

          const contractRes = await apiContract.getContractsByRoom(roomId);
          const rawContracts =
            contractRes?.data?.content ??
            contractRes?.data ??
            contractRes ??
            [];
          const list = Array.isArray(rawContracts)
            ? rawContracts
            : [rawContracts].filter(Boolean);

          const activeContract =
            list.find((c) => c.status?.toUpperCase() === "ACTIVE") ??
            list[0] ??
            null;

          if (activeContract?.contractId) {
            setContract(activeContract);

            const memberIdsRes = await apiContract.getMembers(
              activeContract.contractId,
            );
            const memberIds = Array.isArray(memberIdsRes) ? memberIdsRes : [];

            if (memberIds.length > 0) {
              const results = await Promise.allSettled(
                memberIds.map((pid) => apiProfile.getProfileById(pid)),
              );
              setMembers(
                results
                  .filter((r) => r.status === "fulfilled")
                  .map((r) => r.value),
              );
            } else {
              setMembers([]);
            }
          }
        } catch {
          setContract(null);
          setMembers([]);
        } finally {
          setLoadingMembers(false);
        }
      } catch (err) {
        console.error("Fetch room detail error:", err);
        setError("Không thể tải thông tin phòng. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    if (roomId) fetchData();
  }, [roomId]);

  const getFullImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http") || url.startsWith("data:")) return url;
    return `${imgURL}${url}`;
  };

  const getAmenityIcon = (name) => {
    if (!name) return <FaStar size={14} />;
    const lower = name.toLowerCase();
    if (
      lower.includes("wifi") ||
      lower.includes("internet") ||
      lower.includes("mạng")
    )
      return <FaWifi size={14} />;
    if (
      lower.includes("điều hòa") ||
      lower.includes("máy lạnh") ||
      lower.includes("ac")
    )
      return <FaSnowflake size={14} />;
    if (
      lower.includes("tv") ||
      lower.includes("tivi") ||
      lower.includes("truyền hình")
    )
      return <FaTv size={14} />;
    if (
      lower.includes("nóng lạnh") ||
      lower.includes("vòi sen") ||
      lower.includes("tắm")
    )
      return <FaShower size={14} />;
    if (
      lower.includes("xe") ||
      lower.includes("đỗ") ||
      lower.includes("parking") ||
      lower.includes("gara")
    )
      return <FaParking size={14} />;
    if (lower.includes("quạt")) return <FaFan size={14} />;
    if (lower.includes("điện")) return <FaBolt size={14} />;
    if (lower.includes("nước")) return <FaTint size={14} />;
    if (
      lower.includes("sofa") ||
      lower.includes("ghế") ||
      lower.includes("bàn") ||
      lower.includes("nội thất")
    )
      return <FaCouch size={14} />;
    if (lower.includes("bếp") || lower.includes("nấu ăn"))
      return <FaUtensils size={14} />;
    if (lower.includes("pccc") || lower.includes("cháy"))
      return <FaFireExtinguisher size={14} />;
    if (lower.includes("ban công") || lower.includes("cửa"))
      return <FaDoorOpen size={14} />;
    if (
      lower.includes("khóa") ||
      lower.includes("an ninh") ||
      lower.includes("bảo vệ")
    )
      return <FaLock size={14} />;
    if (lower.includes("camera")) return <FaCamera size={14} />;
    return <FaCheck size={14} />;
  };

  const getAmenityColor = (index) => {
    const colors = [
      { bg: "#e0f2fe", text: "#0284c7", border: "#bae6fd" },
      { bg: "#dcfce7", text: "#16a34a", border: "#bbf7d0" },
      { bg: "#fef3c7", text: "#d97706", border: "#fde68a" },
      { bg: "#f3e8ff", text: "#9333ea", border: "#e9d5ff" },
      { bg: "#ffe4e6", text: "#e11d48", border: "#fecdd3" },
      { bg: "#e0e7ff", text: "#4f46e5", border: "#c7d2fe" },
      { bg: "#ccfbf1", text: "#0d9488", border: "#99f6e4" },
      { bg: "#fff1f2", text: "#f43f5e", border: "#fecdd3" },
    ];
    return colors[index % colors.length];
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "AVAILABLE":
        return {
          label: "Có sẵn",
          bg: "bg-success",
          icon: <FaCheck size={10} />,
        };
      case "OCCUPIED":
        return {
          label: "Đã cho thuê",
          bg: "bg-warning",
          icon: <FaUsers size={10} />,
        };
      case "MAINTENANCE":
        return {
          label: "Bảo trì",
          bg: "bg-danger",
          icon: <FaExclamationTriangle size={10} />,
        };
      default:
        return {
          label: status || "Không rõ",
          bg: "bg-secondary",
          icon: <FaInfoCircle size={10} />,
        };
    }
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return "—";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getFloorInfo = (floorId) => {
    if (!floorId || !Array.isArray(floors)) return null;
    return floors.find((f) => f.floorId === floorId);
  };

  const getBranchName = (floorId) => {
    const floor = getFloorInfo(floorId);
    if (!floor || !floor.branchId) return "—";
    const branch = branches.find((b) => b.branchId === floor.branchId);
    return branch ? branch.branchName : "—";
  };

  const getFloorNumber = (floorId) => {
    const floor = getFloorInfo(floorId);
    return floor ? `Tầng ${floor.floorNumber}` : "—";
  };

  const getImageMedia = () => {
    if (!room?.roomMedia || room.roomMedia.length === 0) return [];
    return room.roomMedia.filter((m) => m.mediaType?.startsWith("image"));
  };

  const getAllMedia = () => room?.roomMedia || [];

  const images = room ? getImageMedia() : [];

  const handlePrevImage = () =>
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const handleNextImage = () =>
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  const handleThumbnailClick = (index) => setCurrentImageIndex(index);

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xóa phòng này? Hành động này không thể hoàn tác.",
      )
    )
      return;
    try {
      await apiRoom.deleteRoom(roomId);
      toast.success("Xóa phòng thành công!");
      navigate("/rooms/1");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Lỗi khi xóa phòng!");
    }
  };

  if (loading)
    return (
      <div className="container-fluid py-5">
        <div
          className="d-flex flex-column align-items-center justify-content-center"
          style={{ minHeight: "400px" }}
        >
          <div
            className="spinner-border text-primary mb-3"
            style={{ width: "3rem", height: "3rem" }}
            role="status"
          />
          <p className="text-muted fw-semibold">Đang tải thông tin phòng...</p>
        </div>
      </div>
    );

  if (error || !room)
    return (
      <div className="container-fluid py-5">
        <div
          className="d-flex flex-column align-items-center justify-content-center"
          style={{ minHeight: "400px" }}
        >
          <div className="bg-danger-subtle p-4 rounded-circle mb-3">
            <FaExclamationTriangle size={40} className="text-danger" />
          </div>
          <h5 className="fw-bold text-dark mb-2">Không tìm thấy phòng</h5>
          <p className="text-muted mb-4">
            {error || "Phòng bạn tìm không tồn tại hoặc đã bị xóa."}
          </p>
          <button
            onClick={() => navigate("/rooms/1")}
            className="btn btn-primary px-4 fw-bold"
          >
            <FaArrowLeft className="me-2" /> Quay lại danh sách
          </button>
        </div>
      </div>
    );

  const statusConfig = getStatusConfig(room.Status || room.status);

  return (
    <div className="container-fluid py-4">
      {/* HEADER */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-light border-0 shadow-sm rounded-circle p-2"
          >
            <FaArrowLeft className="text-muted" />
          </button>
          <div>
            <h4 className="fw-bold text-dark mb-0 text-uppercase">
              Chi tiết phòng
            </h4>
            <p className="text-muted small mb-0">
              Mã phòng: <strong className="text-primary">#{room.roomId}</strong>
            </p>
          </div>
        </div>
        <div className="d-flex gap-2">
          <button
            onClick={() => navigate(`/rooms/${room.roomId}/update`)}
            className="btn btn-outline-primary px-3 fw-bold d-inline-flex align-items-center gap-2 rounded-3"
          >
            <FaEdit size={14} /> Chỉnh sửa
          </button>
          <button
            onClick={handleDelete}
            className="btn btn-outline-danger px-3 fw-bold d-inline-flex align-items-center gap-2 rounded-3"
          >
            <FaTrash size={14} /> Xóa
          </button>
        </div>
      </div>

      <div className="row g-4">
        {/* ── CỘT TRÁI ── */}
        <div className="col-lg-5">
          {/* Image Gallery */}
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
            {images.length > 0 ? (
              <>
                <div
                  className="position-relative"
                  style={{ height: "320px", background: "#f8f9fa" }}
                >
                  <img
                    src={getFullImageUrl(images[currentImageIndex]?.url)}
                    alt={`Phòng ${room.roomName}`}
                    className="w-100 h-100"
                    style={{ objectFit: "cover", cursor: "pointer" }}
                    onClick={() => setShowLightbox(true)}
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="btn btn-dark btn-sm position-absolute top-50 start-0 translate-middle-y ms-2 rounded-circle shadow"
                        style={{ opacity: 0.7, width: "36px", height: "36px" }}
                      >
                        <FaChevronLeft size={12} />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="btn btn-dark btn-sm position-absolute top-50 end-0 translate-middle-y me-2 rounded-circle shadow"
                        style={{ opacity: 0.7, width: "36px", height: "36px" }}
                      >
                        <FaChevronRight size={12} />
                      </button>
                    </>
                  )}
                  <div className="position-absolute bottom-0 end-0 m-3">
                    <span className="badge bg-dark bg-opacity-75 px-3 py-2 rounded-pill">
                      <FaImage size={10} className="me-1" />
                      {currentImageIndex + 1} / {images.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowLightbox(true)}
                    className="btn btn-dark btn-sm position-absolute top-0 end-0 m-3 rounded-circle shadow"
                    style={{ opacity: 0.7, width: "36px", height: "36px" }}
                  >
                    <FaExpand size={12} />
                  </button>
                </div>
                {images.length > 1 && (
                  <div className="p-3 bg-white">
                    <div
                      className="d-flex gap-2 overflow-auto pb-1"
                      style={{ scrollbarWidth: "thin" }}
                    >
                      {images.map((img, idx) => (
                        <img
                          key={idx}
                          src={getFullImageUrl(img.url)}
                          alt={`Thumb ${idx + 1}`}
                          className={`rounded-2 flex-shrink-0 ${idx === currentImageIndex ? "border border-2 border-primary shadow-sm" : "border border-light opacity-75"}`}
                          style={{
                            width: "64px",
                            height: "48px",
                            objectFit: "cover",
                            cursor: "pointer",
                          }}
                          onClick={() => handleThumbnailClick(idx)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div
                className="d-flex flex-column align-items-center justify-content-center bg-light"
                style={{ height: "320px" }}
              >
                <FaImage size={48} className="text-muted mb-2 opacity-25" />
                <small className="text-muted">Chưa có hình ảnh</small>
              </div>
            )}
          </div>

          {/* Room Basic Info */}
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <div className="d-flex align-items-center gap-2 mb-4 border-bottom pb-3">
              <div className="bg-primary-subtle p-2 rounded-3 text-primary">
                <FaBed size={20} />
              </div>
              <h6 className="fw-bold mb-0 text-primary">Thông tin cơ bản</h6>
            </div>
            <div className="d-flex align-items-start justify-content-between mb-4">
              <div>
                <h3 className="fw-bold text-dark mb-1">
                  {room.roomName || "—"}
                </h3>
                <div className="d-flex align-items-center gap-2 text-muted small">
                  <FaMapMarkerAlt size={12} />
                  <span>{getBranchName(room.floorId)}</span>
                  <span>•</span>
                  <FaLayerGroup size={12} />
                  <span>{getFloorNumber(room.floorId)}</span>
                </div>
              </div>
              <span
                className={`badge ${statusConfig.bg} px-3 py-2 rounded-pill d-inline-flex align-items-center gap-1`}
              >
                {statusConfig.icon} {statusConfig.label}
              </span>
            </div>
            <div className="bg-success bg-opacity-10 rounded-3 p-3 mb-4 text-center">
              <small className="text-muted fw-bold d-block mb-1">
                GIÁ THUÊ
              </small>
              <h4 className="fw-bold text-success mb-0">
                <FaDollarSign size={18} className="me-1" />
                {formatPrice(room.price)}
              </h4>
              <small className="text-muted">/ tháng</small>
            </div>
            <div className="row g-3">
              <div className="col-6">
                <div className="bg-light rounded-3 p-3 text-center">
                  <FaUsers className="text-primary mb-2" size={20} />
                  <small className="text-muted fw-bold d-block">
                    NGƯỜI HIỆN TẠI
                  </small>
                  <h5 className="fw-bold text-dark mb-0 mt-1">
                    {room.currentPeople ?? 0}
                  </h5>
                </div>
              </div>
              <div className="col-6">
                <div className="bg-light rounded-3 p-3 text-center">
                  <FaUsers className="text-info mb-2" size={20} />
                  <small className="text-muted fw-bold d-block">
                    SỨC CHỨA TỐI ĐA
                  </small>
                  <h5 className="fw-bold text-dark mb-0 mt-1">
                    {room.maxPeople ?? 1}
                  </h5>
                </div>
              </div>
            </div>
            <div className="mt-3">
              <div className="d-flex justify-content-between small mb-1">
                <span className="text-muted">Tỷ lệ lấp đầy</span>
                <span className="fw-bold">
                  {room.maxPeople
                    ? Math.round(
                        ((room.currentPeople || 0) / room.maxPeople) * 100,
                      )
                    : 0}
                  %
                </span>
              </div>
              <div
                className="progress"
                style={{ height: "8px", borderRadius: "4px" }}
              >
                <div
                  className={`progress-bar ${(room.currentPeople || 0) / (room.maxPeople || 1) >= 1 ? "bg-danger" : (room.currentPeople || 0) / (room.maxPeople || 1) >= 0.7 ? "bg-warning" : "bg-success"}`}
                  style={{
                    width: `${Math.min(((room.currentPeople || 0) / (room.maxPeople || 1)) * 100, 100)}%`,
                    borderRadius: "4px",
                    transition: "width 0.5s ease",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── CỘT PHẢI ── */}
        <div className="col-lg-7">
          {/* Description */}
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <div className="d-flex align-items-center gap-2 mb-4 border-bottom pb-3">
              <div className="bg-info-subtle p-2 rounded-3 text-info">
                <FaFileAlt size={20} />
              </div>
              <h6 className="fw-bold mb-0 text-info">Mô tả chi tiết</h6>
            </div>
            <p
              className="text-dark mb-0 lh-lg"
              style={{ whiteSpace: "pre-line" }}
            >
              {room.description || (
                <span className="text-muted fst-italic">
                  Chưa có mô tả cho phòng này.
                </span>
              )}
            </p>
          </div>

          {/* Location */}
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <div className="d-flex align-items-center gap-2 mb-4 border-bottom pb-3">
              <div className="bg-warning-subtle p-2 rounded-3 text-warning">
                <FaBuilding size={20} />
              </div>
              <h6 className="fw-bold mb-0 text-warning">Vị trí</h6>
            </div>
            <div className="row g-3">
              <div className="col-md-4">
                <div className="bg-light rounded-3 p-3">
                  <small className="text-muted fw-bold d-block mb-1">
                    <FaBuilding size={11} className="me-1" /> CHI NHÁNH
                  </small>
                  <span className="fw-bold text-dark">
                    {getBranchName(room.floorId)}
                  </span>
                </div>
              </div>
              <div className="col-md-4">
                <div className="bg-light rounded-3 p-3">
                  <small className="text-muted fw-bold d-block mb-1">
                    <FaLayerGroup size={11} className="me-1" /> TẦNG
                  </small>
                  <span className="fw-bold text-dark">
                    {getFloorNumber(room.floorId)}
                  </span>
                </div>
              </div>
              <div className="col-md-4">
                <div className="bg-light rounded-3 p-3">
                  <small className="text-muted fw-bold d-block mb-1">
                    <FaToggleOn size={11} className="me-1" /> TRẠNG THÁI
                  </small>
                  <span
                    className={`badge ${statusConfig.bg} px-2 py-1 rounded-pill`}
                  >
                    {statusConfig.icon} {statusConfig.label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Deposit card ── */}
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <div className="d-flex align-items-center gap-2 mb-4 border-bottom pb-3">
              <div className="bg-warning-subtle p-2 rounded-3 text-warning">
                <FaDollarSign size={20} />
              </div>
              <h6 className="fw-bold mb-0 text-warning">Tiền cọc</h6>
            </div>
            {room.depositAmount ? (
              <div className="row g-3">
                <div className="col-6">
                  <div className="bg-warning bg-opacity-10 rounded-3 p-3 text-center">
                    <small className="text-muted fw-bold d-block mb-1">
                      SỐ TIỀN CỌC
                    </small>
                    <h5 className="fw-bold text-warning mb-0">
                      {formatPrice(room.depositAmount)}
                    </h5>
                  </div>
                </div>
                <div className="col-6">
                  <div className="bg-light rounded-3 p-3 text-center">
                    <small className="text-muted fw-bold d-block mb-1">
                      TRẠNG THÁI
                    </small>
                    <span
                      className={`badge rounded-pill px-3 py-2 ${
                        room.depositStatus === "ACTIVE"
                          ? "bg-success text-white"
                          : room.depositStatus === "REFUNDED"
                            ? "bg-info text-white"
                            : room.depositStatus === "COMPENSATED"
                              ? "bg-danger text-white"
                              : "bg-warning text-dark"
                      }`}
                    >
                      {room.depositStatus === "BOOKED"
                        ? "📌 Giữ chỗ"
                        : room.depositStatus === "ACTIVE"
                          ? "✅ Đang giữ"
                          : room.depositStatus === "REFUNDED"
                            ? "↩️ Hoàn cọc"
                            : room.depositStatus === "COMPENSATED"
                              ? "⚠️ Bồi thường"
                              : (room.depositStatus ?? "—")}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-light rounded-3 p-4 text-center">
                <FaDollarSign
                  size={24}
                  className="text-muted opacity-25 mb-2"
                />
                <p className="text-muted small mb-0">
                  Phòng này chưa có tiền cọc
                </p>
              </div>
            )}
          </div>

          {/* ── Members / Contract card ── */}
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3">
              <div className="d-flex align-items-center gap-2">
                <div className="bg-primary-subtle p-2 rounded-3 text-primary">
                  <FaFileContract size={20} />
                </div>
                <h6 className="fw-bold mb-0 text-primary">
                  Hợp đồng & Thành viên
                </h6>
              </div>
              {contract && members.length > 0 && (
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-primary-subtle text-primary rounded-pill px-3">
                    {members.length} thành viên
                  </span>
                  <button
                    className="btn btn-sm btn-outline-primary border-0 fw-semibold"
                    onClick={() =>
                      navigate(`/contracts/${contract.contractId}/detail`)
                    }
                    style={{ fontSize: "0.75rem" }}
                  >
                    <FaFileContract size={11} className="me-1" /> Xem hợp đồng
                  </button>
                </div>
              )}
            </div>

            {loadingMembers ? (
              <div className="text-center py-3">
                <div
                  className="spinner-border spinner-border-sm text-primary"
                  role="status"
                />
                <span className="ms-2 small text-muted">Đang tải...</span>
              </div>
            ) : !contract ? (
              <div className="bg-light rounded-3 p-4 text-center">
                <FaFileContract
                  size={28}
                  className="text-primary opacity-50 mb-2"
                />
                <p className="text-muted small fw-semibold mb-1">
                  Phòng chưa ký hợp đồng
                </p>
                <p className="text-muted mb-3" style={{ fontSize: 12 }}>
                  Phòng này đang trống — bạn có thể tạo hợp đồng ngay bây giờ
                </p>
                <button
                  className="btn btn-primary btn-sm px-4 fw-bold d-inline-flex align-items-center gap-2 shadow-sm"
                  onClick={() =>
                    navigate(`/rooms/${room.roomId}/fast-contract`, {
                      state: { room },
                    })
                  }
                >
                  <FaFileContract size={12} /> Tạo hợp đồng nhanh
                </button>
              </div>
            ) : (
              <>
                <div className="alert alert-light border-0 py-2 px-3 mb-3 rounded-3 d-flex align-items-center gap-2 flex-wrap small">
                  <FaFileContract className="text-primary" size={13} />
                  <span className="text-muted">Hợp đồng</span>
                  <strong className="text-dark">#{contract.contractId}</strong>
                  {contract.startDate && (
                    <span className="text-muted ms-auto">
                      {new Date(contract.startDate).toLocaleDateString("vi-VN")}
                      {contract.endDate &&
                        ` → ${new Date(contract.endDate).toLocaleDateString("vi-VN")}`}
                    </span>
                  )}
                  {contract.status && (
                    <span
                      className={`badge ms-2 ${
                        contract.status?.toUpperCase() === "ACTIVE"
                          ? "bg-success"
                          : "bg-secondary"
                      }`}
                      style={{ fontSize: 10 }}
                    >
                      {contract.status}
                    </span>
                  )}
                </div>

                {members.length > 0 ? (
                  <div className="d-flex flex-column gap-2">
                    {members.map((member, idx) => {
                      const fullName = member.fullName ?? "—";
                      const phone = member.phone ?? "";
                      const idNum = member.identityNumber ?? "";
                      const initial = fullName[0]?.toUpperCase() ?? "?";

                      return (
                        <div
                          key={member.profileId ?? idx}
                          className="d-flex align-items-center gap-3 p-3 bg-light rounded-3"
                        >
                          <div
                            className="rounded-circle bg-primary d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{ width: 40, height: 40 }}
                          >
                            <span className="text-white fw-bold small">
                              {initial}
                            </span>
                          </div>
                          <div className="flex-grow-1 min-w-0">
                            <div className="fw-semibold text-dark small">
                              {fullName}
                            </div>
                            <div
                              className="text-muted"
                              style={{ fontSize: 12 }}
                            >
                              {phone && (
                                <span className="me-2">📱 {phone}</span>
                              )}
                              {idNum && <span>🪪 {idNum}</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-light rounded-3 p-4 text-center">
                    <FaUsers size={24} className="text-muted opacity-25 mb-2" />
                    <p className="text-muted small mb-0">
                      Hợp đồng chưa có thành viên nào
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Amenities */}
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3">
              <div className="d-flex align-items-center gap-2">
                <div className="bg-success-subtle p-2 rounded-3 text-success">
                  <FaStar size={20} />
                </div>
                <h6 className="fw-bold mb-0 text-success">Tiện ích phòng</h6>
              </div>
              {room.amenities?.length > 0 && (
                <span className="badge bg-success-subtle text-success rounded-pill px-3">
                  {room.amenities.length} tiện ích
                </span>
              )}
            </div>
            {room.amenities?.length > 0 ? (
              <div className="row g-2">
                {room.amenities.map((amenity, idx) => {
                  const color = getAmenityColor(idx);
                  const amenityName =
                    amenity.amenityName ||
                    amenity.name ||
                    `Tiện ích #${amenity.amenityId}`;
                  return (
                    <div key={idx} className="col-6 col-md-4 col-xl-3">
                      <div
                        className="rounded-3 p-3 d-flex flex-column align-items-center text-center h-100"
                        style={{
                          backgroundColor: color.bg,
                          border: `1px solid ${color.border}`,
                          cursor: "default",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow =
                            "0 4px 12px rgba(0,0,0,0.1)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center mb-2"
                          style={{
                            width: "36px",
                            height: "36px",
                            backgroundColor: "rgba(255,255,255,0.7)",
                            color: color.text,
                          }}
                        >
                          {getAmenityIcon(amenityName)}
                        </div>
                        <span
                          className="small fw-semibold"
                          style={{
                            color: color.text,
                            fontSize: "12px",
                            lineHeight: "1.3",
                          }}
                        >
                          {amenityName}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-light rounded-3 p-4 text-center">
                <FaStar size={24} className="text-muted opacity-25 mb-2" />
                <p className="text-muted small mb-0">
                  Phòng này chưa có tiện ích nào
                </p>
              </div>
            )}
          </div>

          {/* Media Gallery */}
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3">
              <div className="d-flex align-items-center gap-2">
                <div
                  className="p-2 rounded-3"
                  style={{ backgroundColor: "#f3e8ff" }}
                >
                  <FaThLarge size={20} style={{ color: "#8b5cf6" }} />
                </div>
                <h6 className="fw-bold mb-0" style={{ color: "#8b5cf6" }}>
                  Thư viện ảnh / video
                </h6>
              </div>
              {getAllMedia().length > 0 && (
                <span
                  className="badge rounded-pill px-3"
                  style={{ backgroundColor: "#f3e8ff", color: "#8b5cf6" }}
                >
                  {getAllMedia().length} file
                </span>
              )}
            </div>
            {getAllMedia().length > 0 ? (
              <div className="row g-3">
                {getAllMedia().map((media, idx) => (
                  <div key={idx} className="col-6 col-md-4">
                    <div
                      className="position-relative rounded-3 overflow-hidden border"
                      style={{ height: "140px", cursor: "pointer" }}
                      onClick={() => {
                        const imgIdx = images.findIndex(
                          (img) => img.url === media.url,
                        );
                        if (imgIdx !== -1) {
                          setCurrentImageIndex(imgIdx);
                          setShowLightbox(true);
                        }
                      }}
                    >
                      {media.mediaType?.startsWith("image") ? (
                        <img
                          src={getFullImageUrl(media.url)}
                          alt={`Media ${idx + 1}`}
                          className="w-100 h-100"
                          style={{ objectFit: "cover" }}
                        />
                      ) : (
                        <div className="bg-dark d-flex flex-column align-items-center justify-content-center w-100 h-100">
                          <FaImage size={24} className="text-white-50 mb-1" />
                          <small className="text-white-50">Video</small>
                        </div>
                      )}
                      <div
                        className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                        style={{
                          background: "rgba(0,0,0,0.3)",
                          opacity: 0,
                          transition: "opacity 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.opacity = 1)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.opacity = 0)
                        }
                      >
                        <FaExpand size={20} className="text-white" />
                      </div>
                      {media.isThumbnail && (
                        <span
                          className="badge bg-primary position-absolute top-0 start-0 m-2 rounded-pill"
                          style={{ fontSize: "10px" }}
                        >
                          Ảnh bìa
                        </span>
                      )}
                      <span
                        className="badge bg-dark bg-opacity-75 position-absolute bottom-0 end-0 m-2 rounded-pill"
                        style={{ fontSize: "10px" }}
                      >
                        {media.mediaType?.split("/")[1]?.toUpperCase() ||
                          "FILE"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-light rounded-3 p-4 text-center">
                <FaImage size={24} className="text-muted opacity-25 mb-2" />
                <p className="text-muted small mb-0">
                  Chưa có ảnh hoặc video nào
                </p>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="card border-0 shadow-sm rounded-4 p-4 mt-4">
            <div className="alert alert-light border-1 border-secondary-subtle mb-0">
              <small className="text-muted fw-bold d-block mb-3">
                <FaInfoCircle className="me-1" /> TÓM TẮT THÔNG TIN
              </small>
              <div className="row g-3 small">
                <div className="col-md-6">
                  <div className="d-flex justify-content-between py-2 border-bottom">
                    <span className="text-muted">Mã phòng:</span>
                    <strong>#{room.roomId}</strong>
                  </div>
                  <div className="d-flex justify-content-between py-2 border-bottom">
                    <span className="text-muted">Tên phòng:</span>
                    <strong>{room.roomName || "—"}</strong>
                  </div>
                  <div className="d-flex justify-content-between py-2 border-bottom">
                    <span className="text-muted">Chi nhánh:</span>
                    <strong>{getBranchName(room.floorId)}</strong>
                  </div>
                  <div className="d-flex justify-content-between py-2">
                    <span className="text-muted">Tầng:</span>
                    <strong>{getFloorNumber(room.floorId)}</strong>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex justify-content-between py-2 border-bottom">
                    <span className="text-muted">Giá thuê:</span>
                    <strong className="text-success">
                      {formatPrice(room.price)}
                    </strong>
                  </div>
                  <div className="d-flex justify-content-between py-2 border-bottom">
                    <span className="text-muted">Tiền cọc:</span>
                    <strong className="text-warning">
                      {room.depositAmount
                        ? formatPrice(room.depositAmount)
                        : "—"}
                    </strong>
                  </div>
                  <div className="d-flex justify-content-between py-2 border-bottom">
                    <span className="text-muted">Sức chứa:</span>
                    <strong>
                      {room.currentPeople ?? 0}/{room.maxPeople ?? 1} người
                    </strong>
                  </div>
                  <div className="d-flex justify-content-between py-2 border-bottom">
                    <span className="text-muted">Tiện ích:</span>
                    <strong>{room.amenities?.length || 0} tiện ích</strong>
                  </div>
                  <div className="d-flex justify-content-between py-2">
                    <span className="text-muted">Ảnh/Video:</span>
                    <strong>{getAllMedia().length} file</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LIGHTBOX */}
      {showLightbox && images.length > 0 && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ background: "rgba(0,0,0,0.9)", zIndex: 9999 }}
          onClick={() => setShowLightbox(false)}
        >
          <button
            onClick={() => setShowLightbox(false)}
            className="btn btn-outline-light position-absolute top-0 end-0 m-4 rounded-circle"
            style={{ width: "44px", height: "44px", zIndex: 10000 }}
          >
            <FaTimes size={16} />
          </button>
          <div className="position-absolute top-0 start-50 translate-middle-x mt-4">
            <span className="badge bg-dark bg-opacity-75 px-4 py-2 rounded-pill fs-6">
              {currentImageIndex + 1} / {images.length}
            </span>
          </div>
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrevImage();
              }}
              className="btn btn-outline-light position-absolute start-0 ms-4 rounded-circle"
              style={{ width: "50px", height: "50px" }}
            >
              <FaChevronLeft size={18} />
            </button>
          )}
          <img
            src={getFullImageUrl(images[currentImageIndex]?.url)}
            alt="Fullscreen"
            style={{
              maxWidth: "85%",
              maxHeight: "85vh",
              objectFit: "contain",
              borderRadius: "8px",
            }}
            onClick={(e) => e.stopPropagation()}
          />
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNextImage();
              }}
              className="btn btn-outline-light position-absolute end-0 me-4 rounded-circle"
              style={{ width: "50px", height: "50px" }}
            >
              <FaChevronRight size={18} />
            </button>
          )}
          {images.length > 1 && (
            <div
              className="position-absolute bottom-0 start-50 translate-middle-x mb-4 d-flex gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={getFullImageUrl(img.url)}
                  alt={`Thumb ${idx + 1}`}
                  className={`rounded-2 ${idx === currentImageIndex ? "border border-2 border-white shadow" : "opacity-50"}`}
                  style={{
                    width: "60px",
                    height: "45px",
                    objectFit: "cover",
                    cursor: "pointer",
                  }}
                  onClick={() => handleThumbnailClick(idx)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RoomDetail;
