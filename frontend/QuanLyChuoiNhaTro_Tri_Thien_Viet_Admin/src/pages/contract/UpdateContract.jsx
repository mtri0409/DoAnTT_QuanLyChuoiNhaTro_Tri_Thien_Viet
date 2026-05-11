import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaSearch,
  FaUser,
  FaTimes,
  FaCheck,
  FaArrowLeft,
  FaFileContract,
  FaPhone,
  FaIdCard,
  FaCalendarAlt,
  FaDoorOpen,
  FaConciergeBell,
  FaExclamationCircle,
  FaSave,
  FaSpinner,
} from "react-icons/fa";
import apiContract from "../../api/apiContract";
import apiProfile from "../../api/apiProfile";
import apiServices from "../../api/apiService";
import apiRoom from "../../api/apiRoom";

// ====================== SECTION HEADER (đồng bộ ContractDetail) ======================
const SectionHeader = ({ icon: Icon, title, action }) => (
  <div className="d-flex align-items-center gap-2 mb-4 pb-3 border-bottom">
    {Icon && (
      <div
        className="d-flex align-items-center justify-content-center rounded-2 bg-light text-secondary flex-shrink-0"
        style={{ width: 30, height: 30 }}
      >
        <Icon size={13} />
      </div>
    )}
    <span
      className="text-muted text-uppercase fw-bold"
      style={{ letterSpacing: "0.06em", fontSize: "0.72rem" }}
    >
      {title}
    </span>
    {action && <div className="ms-auto">{action}</div>}
  </div>
);

// ====================== PROFILE SEARCH MODAL ======================
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
      const res = await apiProfile.searchProfiles(keyword.trim(), 0, 10);
      setResults(res?.content ?? res ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow-lg rounded-3">
          <div className="modal-header border-0 pb-0 px-4 pt-4">
            <div>
              <h5 className="modal-title fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <FaSearch size={14} className="text-secondary" />
                Tìm kiếm người đại diện
              </h5>
              <p className="text-muted small mb-0 mt-1">
                Tìm theo tên, số điện thoại hoặc CCCD
              </p>
            </div>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body px-4 pt-3 pb-4">
            <form onSubmit={handleSearch} className="d-flex gap-2 mb-4">
              <div className="input-group">
                <span className="input-group-text bg-light border-0">
                  <FaSearch className="text-muted" size={13} />
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  className="form-control bg-light border-0"
                  placeholder="Nhập tên, số điện thoại hoặc CCCD..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="btn btn-dark shadow-sm px-4"
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
                <p className="small mb-0">Không tìm thấy kết quả phù hợp.</p>
              </div>
            )}
            {results.length > 0 && (
              <div className="list-group list-group-flush">
                {results.map((profile) => (
                  <button
                    key={profile.profileId ?? profile.id}
                    type="button"
                    className="list-group-item list-group-item-action rounded-3 mb-1 border"
                    onClick={() => onSelect(profile)}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="rounded-circle bg-light border d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width: 44, height: 44 }}
                      >
                        <FaUser className="text-secondary" size={14} />
                      </div>
                      <div className="flex-grow-1 text-start">
                        <div className="fw-semibold small text-dark">
                          {profile.fullName}
                        </div>
                        <div className="small text-muted d-flex gap-3 mt-1">
                          <span>
                            <FaPhone className="me-1" size={10} />
                            {profile.phone ?? "N/A"}
                          </span>
                          <span>
                            <FaIdCard className="me-1" size={10} />
                            {profile.identityNumber ?? "N/A"}
                          </span>
                        </div>
                      </div>
                      <FaCheck
                        className="text-secondary opacity-50"
                        size={12}
                      />
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

// ====================== ROOM SEARCH INPUT ======================
const RoomSearchInput = ({ value, onSelect, error }) => {
  const [keyword, setKeyword] = useState(value?.roomName ?? "");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (!wrapperRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (value?.roomName) setKeyword(value.roomName);
    else if (!value) setKeyword("");
  }, [value]);

  const fetchRooms = async (kw) => {
    if (!kw.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await apiRoom.getAllRooms(
        0,
        10,
        "roomName",
        "asc",
        null,
        null,
        kw,
      );
      const list = res?.data?.content ?? res?.data ?? res?.content ?? res ?? [];
      setResults(Array.isArray(list) ? list : []);
      setOpen(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInput = (e) => {
    const val = e.target.value;
    setKeyword(val);
    if (value) onSelect(null);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchRooms(val), 350);
  };

  const handleSelect = (room) => {
    setKeyword(room.roomName);
    setOpen(false);
    onSelect(room);
  };

  return (
    <div ref={wrapperRef} className="position-relative">
      <div className="input-group">
        <span
          className={`input-group-text bg-light border-0 ${error ? "border border-danger border-end-0" : ""}`}
        >
          {loading ? (
            <span
              className="spinner-border spinner-border-sm text-muted"
              style={{ width: 14, height: 14 }}
            />
          ) : (
            <FaDoorOpen className="text-muted" size={13} />
          )}
        </span>
        <input
          type="text"
          autoComplete="off"
          className={`form-control bg-light border-0 ${error ? "is-invalid border border-danger border-start-0" : ""}`}
          placeholder="Gõ tên phòng để tìm kiếm..."
          value={keyword}
          onChange={handleInput}
          onFocus={() => results.length > 0 && setOpen(true)}
        />
      </div>

      {open && results.length > 0 && (
        <div
          className="position-absolute w-100 bg-white border rounded-3 shadow-sm mt-1 z-3"
          style={{ maxHeight: 220, overflowY: "auto" }}
        >
          {results.map((room) => (
            <button
              key={room.roomId}
              type="button"
              className="d-flex align-items-center gap-2 w-100 text-start px-3 py-2 border-0 bg-transparent"
              onMouseDown={() => handleSelect(room)}
            >
              <FaDoorOpen className="text-muted flex-shrink-0" size={13} />
              <div>
                <div className="fw-semibold small text-dark">
                  {room.roomName}
                </div>
                {room.roomPrice && (
                  <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                    {Number(room.roomPrice).toLocaleString("vi-VN")} đ/tháng
                  </div>
                )}
              </div>
              <span
                className="ms-auto badge bg-light text-muted border"
                style={{ fontSize: "0.7rem" }}
              >
                #{room.roomId}
              </span>
            </button>
          ))}
        </div>
      )}
      {open && !loading && results.length === 0 && keyword.trim() && (
        <div className="position-absolute w-100 bg-white border rounded-3 shadow-sm mt-1 p-3 text-center text-muted small z-3">
          Không tìm thấy phòng phù hợp
        </div>
      )}
    </div>
  );
};

// ====================== STATUS OPTIONS ======================
const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Đang hiệu lực" },
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "EXPIRED", label: "Hết hạn" },
  { value: "CANCELLED", label: "Đã hủy" },
];

// ====================== UPDATE CONTRACT PAGE ======================
const UpdateContract = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loadingData, setLoadingData] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [availableServices, setAvailableServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [form, setForm] = useState({
    startDate: "",
    endDate: "",
    billingDay: "",
    status: "ACTIVE",
    rentPrice: "",
    depositAmount: "",
  });

  useEffect(() => {
    const loadAll = async () => {
      setLoadingData(true);
      try {
        const [contractRes, allSvcsRes, svcRes] = await Promise.all([
          apiContract.getContractById(id),
          apiServices.getAllServices(1, 100, "serviceId", "asc", ""),
          apiContract.getServices(id),
        ]);

        const allSvcList =
          allSvcsRes?.content ??
          allSvcsRes?.data?.content ??
          allSvcsRes?.data ??
          allSvcsRes ??
          [];
        setAvailableServices(Array.isArray(allSvcList) ? allSvcList : []);

        const contractSvcs = svcRes?.data?.services ?? svcRes?.services ?? [];
        setSelectedServices(
          contractSvcs.map((s) => ({
            contractServiceId: s.contractServiceId ?? s.id,
            serviceId: s.serviceId,
            serviceName: s.serviceName,
            quantity: s.quantity ?? 1,
            unitPrice: s.priceAtSigning ?? s.unitPrice ?? s.price ?? 0,
            unit: s.unitAtSigning ?? s.unit ?? s.unitName ?? null,
          })),
        );

        const contract = contractRes?.data ?? contractRes;
        setForm({
          startDate: contract.startDate?.slice(0, 10) ?? "",
          endDate: contract.endDate?.slice(0, 10) ?? "",
          billingDay:
            contract.billingDay ??
            contract.paymentDay ??
            contract.payDay ??
            contract.billingDate ??
            "",
          status: contract.status ?? "ACTIVE",
          rentPrice:
            contract.rentPrice ??
            contract.rent ??
            contract.monthlyRent ??
            contract.price ??
            "",
          depositAmount:
            contract.depositAmount ??
            contract.deposit ??
            contract.depositMoney ??
            "",
        });

        if (contract.roomId) {
          setSelectedRoom({
            roomId: contract.roomId,
            roomName: contract.roomName ?? `Phòng #${contract.roomId}`,
          });
        }

        const repId =
          contract.representativeId ??
          contract.representativeProfileId ??
          contract.tenantId ??
          null;
        if (repId) {
          try {
            const repProfile = await apiProfile.getProfileById(repId);
            setSelectedProfile({
              profileId: repProfile.profileId ?? repProfile.id ?? repId,
              fullName:
                repProfile.fullName ??
                repProfile.name ??
                contract.representativeName ??
                "Người đại diện",
              phone: repProfile.phone ?? repProfile.phoneNumber ?? null,
              identityNumber:
                repProfile.identityNumber ??
                repProfile.cccd ??
                repProfile.idNumber ??
                null,
            });
          } catch {
            setSelectedProfile({
              profileId: repId,
              fullName: contract.representativeName ?? "Người đại diện",
              phone: contract.representativePhone ?? null,
              identityNumber: contract.representativeIdentity ?? null,
            });
          }
        }
      } catch (err) {
        console.error("Lỗi tải hợp đồng:", err);
        alert("Không thể tải thông tin hợp đồng!");
        navigate("/contracts");
      } finally {
        setLoadingData(false);
      }
    };
    loadAll();
  }, [id]);

  const handleSelectProfile = (profile) => {
    setSelectedProfile(profile);
    setErrors((prev) => ({ ...prev, representativeId: null }));
    setShowModal(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const toggleService = (svc) => {
    const exists = selectedServices.find((s) => s.serviceId === svc.serviceId);
    if (exists) {
      setSelectedServices((prev) =>
        prev.filter((s) => s.serviceId !== svc.serviceId),
      );
    } else {
      setSelectedServices((prev) => [
        ...prev,
        {
          serviceId: svc.serviceId,
          serviceName: svc.serviceName,
          quantity: 1,
          unitPrice: svc.unitPrice ?? svc.price ?? 0,
          unit: svc.unit ?? svc.unitName ?? null,
        },
      ]);
    }
  };

  const updateServiceQty = (serviceId, qty) => {
    const num = Math.max(1, Number(qty) || 1);
    setSelectedServices((prev) =>
      prev.map((s) =>
        s.serviceId === serviceId ? { ...s, quantity: num } : s,
      ),
    );
  };

  const validate = () => {
    const e = {};
    if (!selectedRoom) e.roomId = "Vui lòng chọn phòng";
    if (!selectedProfile) e.representativeId = "Vui lòng chọn người đại diện";
    if (!form.startDate) e.startDate = "Vui lòng chọn ngày bắt đầu";
    if (!form.endDate) e.endDate = "Vui lòng chọn ngày kết thúc";
    if (form.startDate && form.endDate && form.startDate >= form.endDate)
      e.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
    if (
      !form.billingDay ||
      Number(form.billingDay) < 1 ||
      Number(form.billingDay) > 28
    )
      e.billingDay = "Ngày thanh toán phải từ 1 đến 28";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const representativeId = selectedProfile.profileId ?? selectedProfile.id;
    const payload = {
      roomId: selectedRoom.roomId,
      startDate: form.startDate,
      endDate: form.endDate,
      billingDay: Number(form.billingDay),
      status: form.status,
      rentPrice: form.rentPrice !== "" ? Number(form.rentPrice) : undefined,
      depositAmount:
        form.depositAmount !== "" ? Number(form.depositAmount) : undefined,
      representativeId,
      memberIds: [representativeId],
      contractServices: selectedServices.map((s) => ({
        serviceId: s.serviceId,
        quantity: s.quantity ?? 1,
        unitPrice: s.unitPrice,
        price: s.unitPrice,
      })),
    };

    try {
      setSubmitting(true);
      await apiContract.updateContract(id, payload);
      alert("Cập nhật hợp đồng thành công!");
      navigate("/contracts");
    } catch (err) {
      console.error("Lỗi cập nhật hợp đồng:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        "Có lỗi xảy ra khi cập nhật hợp đồng!";
      if (err.response?.status === 400 && typeof err.response.data === "object")
        setErrors(err.response.data);
      else alert(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  const renderError = (field) =>
    errors[field] ? (
      <div className="text-danger small mt-1 d-flex align-items-center gap-1">
        <FaExclamationCircle size={12} /> {errors[field]}
      </div>
    ) : null;

  // ── Loading ──
  if (loadingData)
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: 400 }}
      >
        <div className="text-center">
          <div
            className="spinner-border text-secondary mb-3"
            style={{ width: 28, height: 28, borderWidth: 2 }}
          />
          <p className="text-muted small mb-0">Đang tải...</p>
        </div>
      </div>
    );

  const formatContractCode = (cid) =>
    cid ? `HD-${String(cid).padStart(5, "0")}` : "—";

  return (
    <>
      {showModal && (
        <ProfileSearchModal
          onSelect={handleSelectProfile}
          onClose={() => setShowModal(false)}
        />
      )}

      <div className="container-fluid py-4">
        {/* ── HEADER (đồng bộ ContractDetail) ── */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <button
                className="btn btn-sm btn-light border"
                onClick={() => navigate(-1)}
                title="Quay lại"
              >
                <FaArrowLeft size={12} />
              </button>
              <FaFileContract className="text-secondary fs-5" />
              <h4 className="fw-bold text-dark mb-0">
                {formatContractCode(id)}
              </h4>
            </div>
            <p className="text-muted small mb-0">
              Chỉnh sửa thông tin hợp đồng
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="card border-0 shadow-sm rounded-3">
            <div className="card-body p-4">
              <div className="row g-4">
                {/* ── CỘT TRÁI ── */}
                <div className="col-lg-5">
                  {/* Thông tin phòng & hợp đồng */}
                  <div className="card border-0 shadow-sm rounded-3 mb-4">
                    <div className="card-header bg-white border-0 py-3">
                      <SectionHeader
                        icon={FaDoorOpen}
                        title="Thông tin phòng & hợp đồng"
                      />
                    </div>
                    <div className="card-body pt-0 px-4 pb-4">
                      {/* Chọn phòng */}
                      <div className="mb-3">
                        <label
                          className="form-label small fw-bold text-muted text-uppercase"
                          style={{ letterSpacing: "0.04em" }}
                        >
                          Tên phòng <span className="text-danger">*</span>
                        </label>
                        <RoomSearchInput
                          value={selectedRoom}
                          onSelect={(room) => {
                            setSelectedRoom(room);
                            setErrors((prev) => ({ ...prev, roomId: null }));
                          }}
                          error={errors.roomId}
                        />
                        {selectedRoom && (
                          <div className="mt-2 px-3 py-2 bg-light rounded-3 d-flex align-items-center gap-2 border">
                            <FaDoorOpen className="text-muted" size={13} />
                            <span className="small fw-semibold text-dark">
                              {selectedRoom.roomName}
                            </span>
                            <span className="ms-auto text-muted small">
                              ID: {selectedRoom.roomId}
                            </span>
                            <button
                              type="button"
                              className="btn btn-sm p-0 border-0 ms-1"
                              onClick={() => setSelectedRoom(null)}
                            >
                              <FaTimes className="text-danger" size={12} />
                            </button>
                          </div>
                        )}
                        {renderError("roomId")}
                      </div>

                      {/* Trạng thái */}
                      <div className="mb-3">
                        <label
                          className="form-label small fw-bold text-muted text-uppercase"
                          style={{ letterSpacing: "0.04em" }}
                        >
                          Trạng thái hợp đồng
                        </label>
                        <select
                          name="status"
                          className="form-select bg-light border-0"
                          value={form.status}
                          onChange={handleChange}
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Ngày thanh toán */}
                      <div className="mb-3">
                        <label
                          className="form-label small fw-bold text-muted text-uppercase"
                          style={{ letterSpacing: "0.04em" }}
                        >
                          Ngày thanh toán hàng tháng{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          type="number"
                          name="billingDay"
                          min={1}
                          max={28}
                          className={`form-control bg-light border-0 ${errors.billingDay ? "is-invalid" : ""}`}
                          placeholder="VD: 5 (ngày 5 hàng tháng)"
                          value={form.billingDay}
                          onChange={handleChange}
                        />
                        {renderError("billingDay")}
                      </div>

                      {/* Giá thuê & tiền cọc */}
                      <div className="row g-2 mb-3">
                        <div className="col-6">
                          <label
                            className="form-label small fw-bold text-muted text-uppercase"
                            style={{ letterSpacing: "0.04em" }}
                          >
                            Giá thuê (VNĐ)
                          </label>
                          <input
                            type="number"
                            name="rentPrice"
                            min={0}
                            className="form-control bg-light border-0"
                            placeholder="VD: 3000000"
                            value={form.rentPrice}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="col-6">
                          <label
                            className="form-label small fw-bold text-muted text-uppercase"
                            style={{ letterSpacing: "0.04em" }}
                          >
                            Tiền cọc (VNĐ)
                          </label>
                          <input
                            type="number"
                            name="depositAmount"
                            min={0}
                            className="form-control bg-light border-0"
                            placeholder="VD: 6000000"
                            value={form.depositAmount}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      {/* Ngày bắt đầu */}
                      <div className="mb-3">
                        <label
                          className="form-label small fw-bold text-muted text-uppercase"
                          style={{ letterSpacing: "0.04em" }}
                        >
                          <FaCalendarAlt className="me-1" size={11} />
                          Ngày bắt đầu <span className="text-danger">*</span>
                        </label>
                        <input
                          type="date"
                          name="startDate"
                          className={`form-control bg-light border-0 ${errors.startDate ? "is-invalid" : ""}`}
                          value={form.startDate}
                          onChange={handleChange}
                        />
                        {renderError("startDate")}
                      </div>

                      {/* Ngày kết thúc */}
                      <div className="mb-0">
                        <label
                          className="form-label small fw-bold text-muted text-uppercase"
                          style={{ letterSpacing: "0.04em" }}
                        >
                          <FaCalendarAlt className="me-1" size={11} />
                          Ngày kết thúc <span className="text-danger">*</span>
                        </label>
                        <input
                          type="date"
                          name="endDate"
                          className={`form-control bg-light border-0 ${errors.endDate ? "is-invalid" : ""}`}
                          value={form.endDate}
                          onChange={handleChange}
                          min={form.startDate || undefined}
                        />
                        {renderError("endDate")}
                      </div>
                    </div>
                  </div>

                  {/* Người đại diện */}
                  <div className="card border-0 shadow-sm rounded-3">
                    <div className="card-header bg-white border-0 py-3">
                      <SectionHeader
                        icon={FaUser}
                        title="Người đại diện"
                        action={
                          <button
                            type="button"
                            className="btn btn-sm btn-light border"
                            style={{ fontSize: "0.75rem" }}
                            onClick={() => setShowModal(true)}
                          >
                            <FaSearch size={11} className="me-1" />
                            {selectedProfile ? "Đổi" : "Tìm kiếm"}
                          </button>
                        }
                      />
                    </div>
                    <div className="card-body pt-0 px-4 pb-4">
                      {renderError("representativeId")}
                      {!selectedProfile ? (
                        <div
                          className="border rounded-3 p-4 text-center text-muted bg-light"
                          style={{ cursor: "pointer" }}
                          onClick={() => setShowModal(true)}
                        >
                          <FaUser className="fs-3 mb-2 opacity-25" />
                          <p className="small mb-1">
                            Nhấn <strong>Tìm kiếm</strong> để chọn người đại
                            diện
                          </p>
                          <p className="small mb-0 text-muted">
                            Tìm theo tên, SĐT hoặc CCCD
                          </p>
                        </div>
                      ) : (
                        <div className="d-flex align-items-center gap-3 p-3 border rounded-3 bg-light">
                          <div
                            className="rounded-circle bg-secondary bg-opacity-10 border d-flex align-items-center justify-content-center flex-shrink-0 fw-bold text-secondary"
                            style={{
                              width: 46,
                              height: 46,
                              fontSize: "0.85rem",
                            }}
                          >
                            {(selectedProfile.fullName || "?")
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <div className="flex-grow-1">
                            <div className="fw-semibold small text-dark">
                              {selectedProfile.fullName}
                            </div>
                            <div className="small text-muted d-flex gap-3 mt-1 flex-wrap">
                              <span>
                                <FaPhone className="me-1" size={10} />
                                {selectedProfile.phone ?? "N/A"}
                              </span>
                              <span>
                                <FaIdCard className="me-1" size={10} />
                                {selectedProfile.identityNumber ?? "N/A"}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm btn-light border-0"
                            onClick={() => setSelectedProfile(null)}
                          >
                            <FaTimes className="text-danger" size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── CỘT PHẢI ── */}
                <div className="col-lg-7">
                  <div className="card border-0 shadow-sm rounded-3 h-100">
                    <div className="card-header bg-white border-0 py-3">
                      <SectionHeader
                        icon={FaConciergeBell}
                        title="Dịch vụ đăng ký"
                        action={
                          <span
                            className="badge bg-light text-dark border fw-normal"
                            style={{ fontSize: "0.72rem" }}
                          >
                            {selectedServices.length} đã chọn
                          </span>
                        }
                      />
                    </div>
                    <div className="card-body pt-0 px-4 pb-4 d-flex flex-column">
                      {loadingData ? (
                        <div className="text-center py-5 text-muted">
                          <div className="spinner-border spinner-border-sm mb-2" />
                          <p className="small mb-0">
                            Đang tải danh sách dịch vụ...
                          </p>
                        </div>
                      ) : availableServices.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                          <FaConciergeBell className="fs-2 mb-2 opacity-25" />
                          <p className="small mb-0">Không có dịch vụ nào</p>
                        </div>
                      ) : (
                        <div
                          className="d-flex flex-column gap-2"
                          style={{ maxHeight: 380, overflowY: "auto" }}
                        >
                          {availableServices.map((svc) => {
                            const selected = selectedServices.find(
                              (s) => s.serviceId === svc.serviceId,
                            );
                            return (
                              <div
                                key={svc.serviceId}
                                className={`border rounded-3 px-3 py-2 d-flex align-items-center gap-3 ${selected ? "bg-light border-secondary" : "bg-light border-0"}`}
                                style={{ cursor: "pointer" }}
                                onClick={() => toggleService(svc)}
                              >
                                <div
                                  className={`rounded-2 d-flex align-items-center justify-content-center flex-shrink-0 ${selected ? "bg-dark text-white" : "bg-white border"}`}
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
                                      {Number(svc.unitPrice).toLocaleString(
                                        "vi-VN",
                                      )}{" "}
                                      đ/{svc.unit ?? svc.unitName ?? "tháng"}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {selectedServices.length > 0 && (
                        <div className="mt-3 p-3 bg-light rounded-3 border">
                          <p className="small fw-bold text-dark mb-2">
                            Dịch vụ đã chọn:
                          </p>
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

                      <div className="mt-auto pt-4">
                        <hr className="text-muted opacity-25 mb-4" />
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            type="button"
                            className="btn btn-light border px-4 fw-semibold"
                            onClick={() => navigate("/contracts")}
                            disabled={submitting}
                          >
                            Hủy bỏ
                          </button>
                          <button
                            type="submit"
                            disabled={submitting}
                            className="btn btn-dark px-5 shadow-sm fw-bold d-inline-flex align-items-center gap-2"
                          >
                            {submitting ? (
                              <>
                                <span className="spinner-border spinner-border-sm" />{" "}
                                Đang lưu...
                              </>
                            ) : (
                              <>
                                <FaSave size={13} /> Lưu thay đổi
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin-icon { animation: spin 1s linear infinite; }
      `}</style>
    </>
  );
};

export default UpdateContract;
