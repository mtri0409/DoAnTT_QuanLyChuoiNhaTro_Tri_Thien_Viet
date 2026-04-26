import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  FaArrowLeft,
  FaSave,
  FaExclamationCircle,
  FaUserPlus,
  FaFileContract,
  FaCheck,
  FaSearch,
  FaUser,
  FaPhone,
  FaIdCard,
  FaCalendarAlt,
  FaConciergeBell,
  FaTimes,
  FaEnvelope,
  FaBolt,
  FaRocket,
  FaDoorOpen,
  FaMapMarkerAlt,
  FaLayerGroup,
  FaChevronRight,
  FaInfoCircle,
} from "react-icons/fa";
import apiProfile from "../../api/apiProfile";
import apiContract from "../../api/apiContract";
import apiUser from "../../api/apiUser";
import apiServices from "../../api/apiService";
import apiRoom from "../../api/apiRoom";

// ─── STEP INDICATOR ───────────────────────────────────────────────────────────
const StepIndicator = ({ currentStep }) => {
  const steps = [
    { id: 1, label: "Thông tin người thuê", icon: <FaUserPlus size={14} /> },
    { id: 2, label: "Chi tiết hợp đồng", icon: <FaFileContract size={14} /> },
    { id: 3, label: "Dịch vụ đăng ký", icon: <FaConciergeBell size={14} /> },
  ];

  return (
    <div className="d-flex align-items-center justify-content-center mb-4 gap-0">
      {steps.map((step, idx) => (
        <React.Fragment key={step.id}>
          <div className="d-flex flex-column align-items-center">
            <div
              className={`rounded-circle d-flex align-items-center justify-content-center fw-bold mb-1 ${
                currentStep > step.id
                  ? "bg-success text-white"
                  : currentStep === step.id
                    ? "bg-primary text-white"
                    : "bg-light text-muted border"
              }`}
              style={{
                width: 40,
                height: 40,
                fontSize: 13,
                transition: "all 0.3s",
              }}
            >
              {currentStep > step.id ? <FaCheck size={13} /> : step.icon}
            </div>
            <small
              className={`fw-semibold text-center`}
              style={{
                fontSize: 11,
                color:
                  currentStep >= step.id
                    ? currentStep > step.id
                      ? "#16a34a"
                      : "#0d6efd"
                    : "#9ca3af",
                maxWidth: 80,
              }}
            >
              {step.label}
            </small>
          </div>
          {idx < steps.length - 1 && (
            <div
              className="flex-grow-1 mx-2 mb-4"
              style={{
                height: 2,
                backgroundColor: currentStep > step.id ? "#16a34a" : "#e5e7eb",
                transition: "background-color 0.3s",
                maxWidth: 60,
              }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const FastContract = () => {
  const navigate = useNavigate();
  const { roomId: paramRoomId } = useParams();
  const location = useLocation();

  // Room state
  const [room, setRoom] = useState(location.state?.room ?? null);
  const [loadingRoom, setLoadingRoom] = useState(!room);

  // Step
  const [step, setStep] = useState(1);

  // Step 1 – Profile
  const [profileMode, setProfileMode] = useState("create"); // "create" | "existing"
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    identityNumber: "",
    idIssueDate: "",
    idIssuePlace: "",
    idExpirationDate: "",
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [selectedExistingProfile, setSelectedExistingProfile] = useState(null);
  const [showProfileSearch, setShowProfileSearch] = useState(false);
  const [createdProfile, setCreatedProfile] = useState(null); // profile vừa tạo/chọn → dùng ở step 2

  // Step 2 – Contract
  const [contractForm, setContractForm] = useState({
    startDate: "",
    endDate: "",
    monthlyRent: room?.price ?? "",
    depositAmount: room?.depositAmount ?? "",
    notes: "",
  });
  const [contractErrors, setContractErrors] = useState({});

  // Step 3 – Services
  const [availableServices, setAvailableServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);

  // Submit
  const [submitting, setSubmitting] = useState(false);

  // ── Load room nếu chưa có ──
  useEffect(() => {
    if (room) {
      setLoadingRoom(false);
      return;
    }
    if (!paramRoomId) return;
    const fetch = async () => {
      try {
        const res = await apiRoom.getRoomById(paramRoomId);
        const data = res.data || res;
        setRoom(data);
        setContractForm((prev) => ({
          ...prev,
          monthlyRent: data.price ?? "",
          depositAmount: data.depositAmount ?? "",
        }));
      } catch (e) {
        console.log("Error with :",e.response)
      } finally {
        setLoadingRoom(false);
      }
    };
    fetch();
  }, [paramRoomId]);

  // ── Load services khi sang step 3 ──
  useEffect(() => {
    if (step !== 3) return;
    const fetchServices = async () => {
      setLoadingServices(true);
      try {
        const res = (await apiServices.getAllServices?.()) ?? { data: [] };
        const list =
          res?.data?.content ?? res?.data ?? res?.content ?? res ?? [];
        setAvailableServices(Array.isArray(list) ? list : []);
      } catch {
        setAvailableServices([]);
      } finally {
        setLoadingServices(false);
      }
    };
    fetchServices();
  }, [step]);

  // ─── HELPERS ──────────────────────────────────────────────────────────────
  const formatPrice = (p) =>
    p != null
      ? new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(p)
      : "—";

  const renderError = (errors, field) => {
    if (!errors[field]) return null;
    return (
      <div className="text-danger small mt-1 d-flex align-items-center gap-1">
        <FaExclamationCircle size={11} /> {errors[field]}
      </div>
    );
  };

  // ─── STEP 1 LOGIC ─────────────────────────────────────────────────────────
  const validateProfileForm = () => {
    const e = {};
    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneReg = /^\d{10}$/;
    if (!profileForm.fullName || profileForm.fullName.length < 8)
      e.fullName = "Họ tên phải có ít nhất 8 ký tự";
    if (!phoneReg.test(profileForm.phone))
      e.phone = "Số điện thoại phải đúng 10 chữ số";
    if (!profileForm.email) e.email = "Email là bắt buộc";
    else if (!emailReg.test(profileForm.email))
      e.email = "Định dạng email không hợp lệ";
    if (profileForm.identityNumber && profileForm.identityNumber.length !== 12)
      e.identityNumber = "Số CCCD phải đúng 12 chữ số";
    setProfileErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNextFromStep1 = async () => {
    if (profileMode === "existing") {
      if (!selectedExistingProfile) {
        setProfileErrors({ _root: "Vui lòng chọn một người đại diện" });
        return;
      }
      setCreatedProfile(selectedExistingProfile);
      setStep(2);
      return;
    }
    // create mode
    if (!validateProfileForm()) return;
    setSubmitting(true);
    try {
      // Convert empty strings → null để backend @Valid không lỗi khi parse LocalDate
      const payload = {
        ...profileForm,
        identityNumber: profileForm.identityNumber || null,
        idIssueDate: profileForm.idIssueDate || null,
        idIssuePlace: profileForm.idIssuePlace || null,
        idExpirationDate: profileForm.idExpirationDate || null,
        address: profileForm.address || null,
      };
      const res = await apiProfile.createProfile(payload);
      const newProfile = res.data || res;
      // Tạo tài khoản tự động
      try {
        await apiUser.generareAcount(newProfile.profileId);
      } catch {
        /* không bắt buộc */
      }
      setCreatedProfile(newProfile);
      setStep(2);
    } catch (err) {
      const res = err.response;
      if (res?.status === 400) {
        const d = res.data;
        if (d?.message?.includes("Duplicate entry")) {
          if (d.message.includes("email"))
            setProfileErrors({ email: "Email đã tồn tại trên hệ thống!" });
          else if (d.message.includes("identity_number"))
            setProfileErrors({
              identityNumber: "Số CCCD đã tồn tại trên hệ thống!",
            });
        } else if (typeof d === "object") {
          setProfileErrors(d);
        }
      } else {
        alert("Lỗi hệ thống hoặc mất kết nối Server.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ─── STEP 2 LOGIC ─────────────────────────────────────────────────────────
  const validateContractForm = () => {
    const e = {};
    if (!contractForm.startDate) e.startDate = "Vui lòng chọn ngày bắt đầu";
    if (!contractForm.endDate) e.endDate = "Vui lòng chọn ngày kết thúc";
    if (
      contractForm.startDate &&
      contractForm.endDate &&
      contractForm.startDate >= contractForm.endDate
    )
      e.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
    if (!contractForm.monthlyRent || Number(contractForm.monthlyRent) <= 0)
      e.monthlyRent = "Vui lòng nhập giá thuê hợp lệ";
    setContractErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNextFromStep2 = () => {
    if (!validateContractForm()) return;
    setStep(3);
  };

  // ─── STEP 3 – FINAL SUBMIT ────────────────────────────────────────────────
  const toggleService = (svc) => {
    setSelectedServices((prev) =>
      prev.find((s) => s.serviceId === svc.serviceId)
        ? prev.filter((s) => s.serviceId !== svc.serviceId)
        : [...prev, svc],
    );
  };

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    try {
      const roomId = room?.roomId ?? paramRoomId;

      // ── DEBUG: xem toàn bộ createdProfile ──────────────────────────────
      console.log("=== DEBUG createdProfile ===", createdProfile);
      console.log("=== DEBUG room ===", room);
      // ────────────────────────────────────────────────────────────────────

      // Lấy profileId an toàn — backend trả về profileId hoặc id tuỳ DTO
      const representativeId =
        createdProfile?.profileId ?? createdProfile?.id ?? null;

      if (!representativeId) {
        alert("Lỗi: không lấy được ID người đại diện. Vui lòng thử lại.");
        setSubmitting(false);
        return;
      }

      const dto = {
        roomId: Number(roomId),
        representativeId,
        memberIds: [representativeId], // ← backend yêu cầu không được rỗng
        startDate: contractForm.startDate,
        endDate: contractForm.endDate,
        rentPrice: Number(contractForm.monthlyRent),
        depositAmount: contractForm.depositAmount
          ? Number(contractForm.depositAmount)
          : null,
      };

      console.log("=== DEBUG contract DTO ===", dto);

      const contractRes = await apiContract.createContract(dto);
      console.log("Contract created:", contractRes.data);
      const contractData = contractRes.data || contractRes;
      const contractId =
        contractData?.contractId ?? contractData?.data?.contractId;

      // Thêm dịch vụ nếu có
      if (selectedServices.length > 0 && contractId) {
        const servicePayload = selectedServices.map((s) => ({
          serviceId: s.serviceId,
          quantity: 1,
        }));
        try {
          await apiContract.addServices(contractId, servicePayload);
        } catch {
          /* ignore */
        }
      }

      alert("🎉 Tạo hợp đồng thành công!");
      navigate(`/contracts/${contractId}/detail`);
    } catch (err) {
      const res = err.response;
      console.log(res);
      if (res?.status === 400) {
        alert(res.data?.message || "Dữ liệu không hợp lệ.");
      } else if (res?.status === 409) {
        alert("Phòng này đã có hợp đồng đang hoạt động!");
      } else {
        alert("Lỗi hệ thống hoặc mất kết nối Server.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ─── PROFILE SEARCH MODAL ────────────────────────────────────────────────
  const ProfileSearchModal = ({ onSelect, onClose }) => {
    const [keyword, setKeyword] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
      inputRef.current?.focus();
    }, []);

    const handleSearch = async (e) => {
      e.preventDefault();
      if (!keyword.trim()) return;
      setLoading(true);
      setSearched(true);
      try {
        const res = await apiProfile.searchProfiles(
          keyword.trim(),
          0,
          10,
          "id",
          "asc",
          null,
          true,
        );
        setResults(res?.content ?? res?.data?.content ?? res ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div
        className="modal d-block"
        style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
        onClick={onClose}
      >
        <div
          className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content border-0 shadow-lg rounded-4">
            <div className="modal-header border-0 pb-0">
              <h5 className="modal-title fw-bold">
                <FaSearch className="me-2 text-primary" />
                Tìm người thuê có sẵn
              </h5>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body pt-3">
              <form onSubmit={handleSearch} className="d-flex gap-2 mb-4">
                <div className="input-group">
                  <span className="input-group-text bg-light border-0">
                    <FaSearch className="text-muted" />
                  </span>
                  <input
                    ref={inputRef}
                    type="text"
                    className="form-control bg-light border-0"
                    placeholder="Nhập tên, SĐT hoặc số CCCD..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary px-4"
                  disabled={loading || !keyword.trim()}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm" />
                  ) : (
                    "Tìm"
                  )}
                </button>
              </form>
              {!searched && (
                <div className="text-center py-4 text-muted">
                  <FaUser className="fs-1 mb-2 opacity-25" />
                  <p className="small mb-0">
                    Tìm theo tên, số điện thoại hoặc số CCCD
                  </p>
                </div>
              )}
              {searched && !loading && results.length === 0 && (
                <div className="text-center py-4 text-muted">
                  <p>Không tìm thấy kết quả.</p>
                </div>
              )}
              {results.length > 0 && (
                <div className="list-group list-group-flush">
                  {results.map((p) => (
                    <button
                      key={p.profileId ?? p.id}
                      type="button"
                      className="list-group-item list-group-item-action rounded-3 mb-1 border"
                      onClick={() => onSelect(p)}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{ width: 44, height: 44 }}
                        >
                          <FaUser className="text-primary" />
                        </div>
                        <div className="flex-grow-1 text-start">
                          <div className="fw-semibold text-dark">
                            {p.fullName}
                          </div>
                          <div className="small text-muted d-flex gap-3 mt-1">
                            <span>
                              <FaPhone className="me-1" />
                              {p.phone ?? "N/A"}
                            </span>
                            <span>
                              <FaIdCard className="me-1" />
                              {p.identityNumber ?? "N/A"}
                            </span>
                          </div>
                        </div>
                        <FaCheck className="text-success opacity-50" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ─── ROOM INFO BANNER ─────────────────────────────────────────────────────
  const RoomInfoBanner = () => {
    if (loadingRoom)
      return (
        <div className="alert alert-light border rounded-3 d-flex align-items-center gap-2 mb-4">
          <div className="spinner-border spinner-border-sm text-primary me-2" />
          <span className="text-muted small">Đang tải thông tin phòng...</span>
        </div>
      );
    if (!room) return null;
    return (
      <div
        className="alert border-0 rounded-4 mb-4 d-flex align-items-center gap-3 py-3"
        style={{
          background: "linear-gradient(135deg, #e0f2fe 0%, #f0fdf4 100%)",
          border: "1px solid #bae6fd",
        }}
      >
        <div className="rounded-3 bg-primary bg-opacity-10 p-3 flex-shrink-0">
          <FaDoorOpen size={22} className="text-primary" />
        </div>
        <div className="flex-grow-1">
          <div className="fw-bold text-dark mb-0">
            {room.roomName ?? `Phòng #${room.roomId}`}
          </div>
          <div className="small text-muted d-flex gap-3 flex-wrap mt-1">
            {room.branchName && (
              <span>
                <FaMapMarkerAlt size={10} className="me-1" />
                {room.branchName}
              </span>
            )}
            {room.floorNumber != null && (
              <span>
                <FaLayerGroup size={10} className="me-1" />
                Tầng {room.floorNumber}
              </span>
            )}
          </div>
        </div>
        <div className="text-end flex-shrink-0">
          <div className="fw-bold text-success">{formatPrice(room.price)}</div>
          <small className="text-muted">/ tháng</small>
        </div>
      </div>
    );
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="container-fluid py-4" style={{ maxWidth: 900 }}>
      {/* Header */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-light border-0 shadow-sm rounded-circle p-2"
        >
          <FaArrowLeft className="text-muted" />
        </button>
        <div>
          <div className="d-flex align-items-center gap-2">
            <h4 className="fw-bold text-dark mb-0 text-uppercase">
              Tạo hợp đồng nhanh
            </h4>
            <span
              className="badge rounded-pill px-3 py-2"
              style={{
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                fontSize: 11,
              }}
            >
              <FaRocket size={10} className="me-1" /> FastContract
            </span>
          </div>
          <p className="text-muted small mb-0">
            Tạo người thuê và hợp đồng trong một bước
          </p>
        </div>
      </div>

      <RoomInfoBanner />
      <StepIndicator currentStep={step} />

      {/* ════════ STEP 1: PROFILE ════════ */}
      {step === 1 && (
        <div className="card border-0 shadow-sm rounded-4 p-4">
          <div className="d-flex align-items-center gap-2 mb-4 border-bottom pb-3">
            <div className="bg-primary-subtle p-2 rounded-3 text-primary">
              <FaUserPlus size={18} />
            </div>
            <h6 className="fw-bold mb-0 text-primary">
              Thông tin người thuê chính
            </h6>
          </div>

          {/* Toggle mode */}
          <div className="d-flex gap-2 mb-4">
            <button
              type="button"
              className={`btn rounded-3 fw-semibold px-4 ${profileMode === "create" ? "btn-primary" : "btn-outline-secondary border-0 bg-light"}`}
              onClick={() => {
                setProfileMode("create");
                setProfileErrors({});
              }}
            >
              <FaUserPlus size={13} className="me-2" />
              Tạo người thuê mới
            </button>
            <button
              type="button"
              className={`btn rounded-3 fw-semibold px-4 ${profileMode === "existing" ? "btn-primary" : "btn-outline-secondary border-0 bg-light"}`}
              onClick={() => {
                setProfileMode("existing");
                setProfileErrors({});
              }}
            >
              <FaSearch size={13} className="me-2" />
              Chọn người có sẵn
            </button>
          </div>

          {/* ── Mode: existing ── */}
          {profileMode === "existing" && (
            <div>
              {profileErrors._root && (
                <div className="alert alert-danger py-2 small rounded-3">
                  <FaExclamationCircle size={12} className="me-1" />
                  {profileErrors._root}
                </div>
              )}
              {!selectedExistingProfile ? (
                <div
                  className="border rounded-3 p-5 text-center bg-light"
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowProfileSearch(true)}
                >
                  <FaUser className="fs-2 mb-2 text-muted opacity-25" />
                  <p className="text-muted small mb-2">
                    Nhấn để tìm và chọn người thuê
                  </p>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm rounded-3"
                  >
                    <FaSearch size={11} className="me-2" />
                    Tìm kiếm
                  </button>
                </div>
              ) : (
                <div className="d-flex align-items-center gap-3 p-3 border rounded-3 bg-success bg-opacity-10">
                  <div
                    className="rounded-circle bg-success bg-opacity-25 d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: 48, height: 48 }}
                  >
                    <FaUser className="text-success" size={18} />
                  </div>
                  <div className="flex-grow-1">
                    <div className="fw-bold text-dark">
                      {selectedExistingProfile.fullName}
                    </div>
                    <div className="small text-muted d-flex gap-3 flex-wrap mt-1">
                      <span>
                        <FaPhone size={10} className="me-1" />
                        {selectedExistingProfile.phone ?? "N/A"}
                      </span>
                      <span>
                        <FaIdCard size={10} className="me-1" />
                        {selectedExistingProfile.identityNumber ?? "N/A"}
                      </span>
                      {selectedExistingProfile.email && (
                        <span>
                          <FaEnvelope size={10} className="me-1" />
                          {selectedExistingProfile.email}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary border-0 rounded-3"
                      onClick={() => setShowProfileSearch(true)}
                    >
                      Đổi
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-light border-0"
                      onClick={() => setSelectedExistingProfile(null)}
                    >
                      <FaTimes className="text-danger" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Mode: create ── */}
          {profileMode === "create" && (
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">
                  HỌ VÀ TÊN <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  className={`form-control bg-light border-0 py-2 ${profileErrors.fullName ? "is-invalid" : ""}`}
                  placeholder="VD: Nguyễn Văn A"
                  value={profileForm.fullName}
                  onChange={(e) => {
                    setProfileForm((p) => ({ ...p, fullName: e.target.value }));
                    setProfileErrors((p) => {
                      const n = { ...p };
                      delete n.fullName;
                      return n;
                    });
                  }}
                />
                {renderError(profileErrors, "fullName")}
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">
                  SỐ ĐIỆN THOẠI <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-0">
                    <FaPhone className="text-success" size={12} />
                  </span>
                  <input
                    type="text"
                    name="phone"
                    className={`form-control bg-light border-0 py-2 ${profileErrors.phone ? "is-invalid" : ""}`}
                    placeholder="09xx xxx xxx"
                    value={profileForm.phone}
                    onChange={(e) => {
                      setProfileForm((p) => ({ ...p, phone: e.target.value }));
                      setProfileErrors((p) => {
                        const n = { ...p };
                        delete n.phone;
                        return n;
                      });
                    }}
                  />
                </div>
                {renderError(profileErrors, "phone")}
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">
                  EMAIL <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-0">
                    <FaEnvelope className="text-primary" size={12} />
                  </span>
                  <input
                    type="email"
                    name="email"
                    className={`form-control bg-light border-0 py-2 ${profileErrors.email ? "is-invalid" : ""}`}
                    placeholder="example@gmail.com"
                    value={profileForm.email}
                    onChange={(e) => {
                      setProfileForm((p) => ({ ...p, email: e.target.value }));
                      setProfileErrors((p) => {
                        const n = { ...p };
                        delete n.email;
                        return n;
                      });
                    }}
                  />
                </div>
                {renderError(profileErrors, "email")}
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">
                  SỐ CCCD
                </label>
                <input
                  type="text"
                  name="identityNumber"
                  className={`form-control bg-light border-0 py-2 ${profileErrors.identityNumber ? "is-invalid" : ""}`}
                  placeholder="12 chữ số"
                  value={profileForm.identityNumber}
                  onChange={(e) => {
                    setProfileForm((p) => ({
                      ...p,
                      identityNumber: e.target.value,
                    }));
                    setProfileErrors((p) => {
                      const n = { ...p };
                      delete n.identityNumber;
                      return n;
                    });
                  }}
                />
                {renderError(profileErrors, "identityNumber")}
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-bold text-muted">
                  NƠI CẤP CCCD
                </label>
                <input
                  type="text"
                  className="form-control bg-light border-0 py-2"
                  placeholder="Cục CSQL HCNN..."
                  value={profileForm.idIssuePlace}
                  onChange={(e) =>
                    setProfileForm((p) => ({
                      ...p,
                      idIssuePlace: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-bold text-muted">
                  <FaCalendarAlt className="me-1" />
                  NGÀY CẤP
                </label>
                <input
                  type="date"
                  className="form-control bg-light border-0 py-2"
                  value={profileForm.idIssueDate}
                  onChange={(e) =>
                    setProfileForm((p) => ({
                      ...p,
                      idIssueDate: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-bold text-muted">
                  <FaCalendarAlt className="me-1" />
                  NGÀY HẾT HẠN
                </label>
                <input
                  type="date"
                  className="form-control bg-light border-0 py-2"
                  value={profileForm.idExpirationDate}
                  onChange={(e) =>
                    setProfileForm((p) => ({
                      ...p,
                      idExpirationDate: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="col-12">
                <label className="form-label small fw-bold text-muted">
                  ĐỊA CHỈ THƯỜNG TRÚ
                </label>
                <textarea
                  className="form-control bg-light border-0"
                  rows={2}
                  placeholder="Địa chỉ chi tiết..."
                  value={profileForm.address}
                  onChange={(e) =>
                    setProfileForm((p) => ({ ...p, address: e.target.value }))
                  }
                />
              </div>
            </div>
          )}

          <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
            <button
              type="button"
              className="btn btn-light border-0 fw-bold px-4"
              onClick={() => navigate(-1)}
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              className="btn btn-primary px-5 fw-bold d-inline-flex align-items-center gap-2"
              onClick={handleNextFromStep1}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm" /> Đang
                  lưu...
                </>
              ) : (
                <>
                  {profileMode === "create" ? "Tạo & tiếp tục" : "Tiếp tục"}{" "}
                  <FaChevronRight size={12} />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ════════ STEP 2: CONTRACT ════════ */}
      {step === 2 && (
        <div className="card border-0 shadow-sm rounded-4 p-4">
          <div className="d-flex align-items-center gap-2 mb-4 border-bottom pb-3">
            <div className="bg-warning-subtle p-2 rounded-3 text-warning">
              <FaFileContract size={18} />
            </div>
            <h6 className="fw-bold mb-0 text-warning">Chi tiết hợp đồng</h6>
          </div>

          {/* Profile đã chọn mini */}
          {createdProfile && (
            <div className="alert alert-success border-0 rounded-3 d-flex align-items-center gap-2 py-2 mb-4">
              <FaCheck size={13} className="text-success flex-shrink-0" />
              <span className="small">
                Người đại diện: <strong>{createdProfile.fullName}</strong>
              </span>
            </div>
          )}

          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label small fw-bold text-muted">
                <FaCalendarAlt className="me-1" />
                NGÀY BẮT ĐẦU <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                className={`form-control bg-light border-0 py-2 ${contractErrors.startDate ? "is-invalid" : ""}`}
                value={contractForm.startDate}
                onChange={(e) => {
                  setContractForm((p) => ({ ...p, startDate: e.target.value }));
                  setContractErrors((p) => {
                    const n = { ...p };
                    delete n.startDate;
                    return n;
                  });
                }}
              />
              {renderError(contractErrors, "startDate")}
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-bold text-muted">
                <FaCalendarAlt className="me-1" />
                NGÀY KẾT THÚC <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                className={`form-control bg-light border-0 py-2 ${contractErrors.endDate ? "is-invalid" : ""}`}
                value={contractForm.endDate}
                onChange={(e) => {
                  setContractForm((p) => ({ ...p, endDate: e.target.value }));
                  setContractErrors((p) => {
                    const n = { ...p };
                    delete n.endDate;
                    return n;
                  });
                }}
              />
              {renderError(contractErrors, "endDate")}
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-bold text-muted">
                <FaBolt className="me-1 text-success" />
                GIÁ THUÊ / THÁNG <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <input
                  type="number"
                  className={`form-control bg-light border-0 py-2 ${contractErrors.monthlyRent ? "is-invalid" : ""}`}
                  placeholder="VD: 3500000"
                  value={contractForm.monthlyRent}
                  onChange={(e) => {
                    setContractForm((p) => ({
                      ...p,
                      monthlyRent: e.target.value,
                    }));
                    setContractErrors((p) => {
                      const n = { ...p };
                      delete n.monthlyRent;
                      return n;
                    });
                  }}
                />
                <span className="input-group-text bg-light border-0 text-muted small">
                  VNĐ
                </span>
              </div>
              {renderError(contractErrors, "monthlyRent")}
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-bold text-muted">
                TIỀN ĐẶT CỌC
              </label>
              <div className="input-group">
                <input
                  type="number"
                  className="form-control bg-light border-0 py-2"
                  placeholder="VD: 7000000"
                  value={contractForm.depositAmount}
                  onChange={(e) =>
                    setContractForm((p) => ({
                      ...p,
                      depositAmount: e.target.value,
                    }))
                  }
                />
                <span className="input-group-text bg-light border-0 text-muted small">
                  VNĐ
                </span>
              </div>
            </div>
            <div className="col-12">
              <label className="form-label small fw-bold text-muted">
                GHI CHÚ
              </label>
              <textarea
                className="form-control bg-light border-0"
                rows={3}
                placeholder="Ghi chú thêm về hợp đồng..."
                value={contractForm.notes}
                onChange={(e) =>
                  setContractForm((p) => ({ ...p, notes: e.target.value }))
                }
              />
            </div>
          </div>

          {/* Summary */}
          {contractForm.startDate &&
            contractForm.endDate &&
            contractForm.monthlyRent && (
              <div
                className="mt-4 p-3 rounded-3 border"
                style={{ backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" }}
              >
                <p className="small fw-bold text-success mb-2">
                  <FaInfoCircle className="me-1" />
                  Tóm tắt hợp đồng
                </p>
                <div className="row g-2 small text-muted">
                  <div className="col-6">
                    Thời hạn:{" "}
                    <strong className="text-dark">
                      {contractForm.startDate} → {contractForm.endDate}
                    </strong>
                  </div>
                  <div className="col-6">
                    Giá thuê:{" "}
                    <strong className="text-success">
                      {formatPrice(contractForm.monthlyRent)}/tháng
                    </strong>
                  </div>
                  {contractForm.depositAmount && (
                    <div className="col-6">
                      Tiền cọc:{" "}
                      <strong className="text-warning">
                        {formatPrice(contractForm.depositAmount)}
                      </strong>
                    </div>
                  )}
                </div>
              </div>
            )}

          <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
            <button
              type="button"
              className="btn btn-light border-0 fw-bold px-4"
              onClick={() => setStep(1)}
            >
              <FaArrowLeft size={13} className="me-2" />
              Quay lại
            </button>
            <button
              type="button"
              className="btn btn-warning text-white px-5 fw-bold d-inline-flex align-items-center gap-2"
              onClick={handleNextFromStep2}
            >
              Tiếp tục <FaChevronRight size={12} />
            </button>
          </div>
        </div>
      )}

      {/* ════════ STEP 3: SERVICES ════════ */}
      {step === 3 && (
        <div className="card border-0 shadow-sm rounded-4 p-4">
          <div className="d-flex align-items-center gap-2 mb-1 border-bottom pb-3">
            <div className="bg-info-subtle p-2 rounded-3 text-info">
              <FaConciergeBell size={18} />
            </div>
            <h6 className="fw-bold mb-0 text-info">Dịch vụ đăng ký</h6>
            <span className="ms-auto badge bg-info bg-opacity-10 text-info border border-info border-opacity-25">
              {selectedServices.length} đã chọn
            </span>
          </div>
          <p className="text-muted small mt-2 mb-3">
            Chọn các dịch vụ đăng ký kèm theo hợp đồng (tùy chọn)
          </p>

          {loadingServices ? (
            <div className="text-center py-5 text-muted">
              <div className="spinner-border spinner-border-sm mb-2" />
              <p className="small mb-0">Đang tải danh sách dịch vụ...</p>
            </div>
          ) : availableServices.length === 0 ? (
            <div className="text-center py-4 bg-light rounded-3">
              <FaConciergeBell className="fs-2 mb-2 text-muted opacity-25" />
              <p className="text-muted small mb-0">
                Không có dịch vụ nào trong hệ thống
              </p>
            </div>
          ) : (
            <div
              className="row g-2"
              style={{ maxHeight: 320, overflowY: "auto" }}
            >
              {availableServices.map((svc) => {
                const selected = selectedServices.find(
                  (s) => s.serviceId === svc.serviceId,
                );
                return (
                  <div key={svc.serviceId} className="col-md-6">
                    <div
                      className={`border rounded-3 px-3 py-2 d-flex align-items-center gap-3 h-100 ${selected ? "border-info bg-info bg-opacity-10" : "bg-light border-0"}`}
                      style={{ cursor: "pointer", transition: "all 0.2s" }}
                      onClick={() => toggleService(svc)}
                    >
                      <div
                        className={`rounded-2 d-flex align-items-center justify-content-center flex-shrink-0 ${selected ? "bg-info text-white" : "bg-white border"}`}
                        style={{ width: 22, height: 22 }}
                      >
                        {selected && <FaCheck size={10} />}
                      </div>
                      <div className="flex-grow-1">
                        <div className="fw-semibold small text-dark">
                          {svc.serviceName}
                        </div>
                        {svc.unitPrice != null && (
                          <div
                            className="text-muted"
                            style={{ fontSize: "0.75rem" }}
                          >
                            {Number(svc.unitPrice).toLocaleString("vi-VN")} đ/
                            {svc.unit ?? svc.unitName ?? "tháng"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Summary dịch vụ chọn */}
          {selectedServices.length > 0 && (
            <div className="mt-3 p-3 bg-info bg-opacity-10 rounded-3 border border-info border-opacity-25">
              <p className="small fw-bold text-info mb-2">Dịch vụ đã chọn:</p>
              {selectedServices.map((s) => (
                <div
                  key={s.serviceId}
                  className="d-flex justify-content-between small mb-1"
                >
                  <span className="text-dark">{s.serviceName}</span>
                  <span className="text-muted">
                    {Number(s.unitPrice).toLocaleString("vi-VN")} đ
                    {s.unit ? `/${s.unit}` : ""}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Final confirm */}
          <div
            className="mt-4 p-3 rounded-3 border"
            style={{ backgroundColor: "#fefce8", borderColor: "#fde68a" }}
          >
            <p className="small fw-bold text-warning-emphasis mb-2">
              <FaInfoCircle className="me-1" />
              Xác nhận tạo hợp đồng
            </p>
            <div className="row g-1 small text-muted">
              <div className="col-12">
                Người thuê:{" "}
                <strong className="text-dark">
                  {createdProfile?.fullName}
                </strong>
              </div>
              <div className="col-12">
                Phòng:{" "}
                <strong className="text-dark">
                  {room?.roomName ?? `#${room?.roomId ?? paramRoomId}`}
                </strong>
              </div>
              <div className="col-6">
                Từ ngày:{" "}
                <strong className="text-dark">{contractForm.startDate}</strong>
              </div>
              <div className="col-6">
                Đến ngày:{" "}
                <strong className="text-dark">{contractForm.endDate}</strong>
              </div>
              <div className="col-6">
                Giá thuê:{" "}
                <strong className="text-success">
                  {formatPrice(contractForm.monthlyRent)}
                </strong>
              </div>
              {contractForm.depositAmount && (
                <div className="col-6">
                  Tiền cọc:{" "}
                  <strong className="text-warning">
                    {formatPrice(contractForm.depositAmount)}
                  </strong>
                </div>
              )}
              {selectedServices.length > 0 && (
                <div className="col-12">
                  Dịch vụ:{" "}
                  <strong className="text-info">
                    {selectedServices.length} dịch vụ
                  </strong>
                </div>
              )}
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
            <button
              type="button"
              className="btn btn-light border-0 fw-bold px-4"
              onClick={() => setStep(2)}
            >
              <FaArrowLeft size={13} className="me-2" />
              Quay lại
            </button>
            <button
              type="button"
              className="btn btn-success px-5 fw-bold d-inline-flex align-items-center gap-2 shadow-sm"
              onClick={handleFinalSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm" /> Đang
                  tạo...
                </>
              ) : (
                <>
                  <FaSave size={14} /> Xác nhận & Tạo hợp đồng
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Profile Search Modal */}
      {showProfileSearch && (
        <ProfileSearchModal
          onSelect={(p) => {
            setSelectedExistingProfile(p);
            setShowProfileSearch(false);
            setProfileErrors({});
          }}
          onClose={() => setShowProfileSearch(false)}
        />
      )}
    </div>
  );
};

export default FastContract;
