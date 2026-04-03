import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaUser,
  FaTimes,
  FaCheck,
  FaArrowLeft,
  FaFileContract,
  FaPhone,
  FaIdCard,
} from "react-icons/fa";
import apiContract from "../../api/apiContract";
import apiProfile from "../../api/apiProfile";

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
      // response có thể là Page (có .content) hoặc array
      setResults(res?.content ?? res ?? []);
    } catch (err) {
      console.error("Lỗi tìm kiếm profile:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow-lg rounded-3">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold">
              <FaSearch className="me-2 text-primary" />
              Tìm kiếm người đại diện
            </h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>

          <div className="modal-body pt-3">
            {/* Search Input */}
            <form onSubmit={handleSearch} className="d-flex gap-2 mb-4">
              <div className="input-group">
                <span className="input-group-text bg-light border-0">
                  <FaSearch className="text-muted" />
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
                className="btn btn-primary px-4"
                disabled={loading || !keyword.trim()}
              >
                {loading ? (
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                  />
                ) : (
                  "Tìm"
                )}
              </button>
            </form>

            {/* Hint */}
            {!searched && (
              <div className="text-center py-4 text-muted">
                <FaUser className="fs-1 mb-2 opacity-25" />
                <p className="small">
                  Tìm theo tên, số điện thoại hoặc số CCCD
                </p>
              </div>
            )}

            {/* Results */}
            {searched && !loading && results.length === 0 && (
              <div className="text-center py-4 text-muted">
                <p>Không tìm thấy kết quả phù hợp.</p>
              </div>
            )}

            {results.length > 0 && (
              <div className="list-group list-group-flush">
                {results.map((profile) => (
                  <button
                    key={profile.profileId ?? profile.id}
                    type="button"
                    className="list-group-item list-group-item-action rounded-2 mb-1 border"
                    onClick={() => onSelect(profile)}
                  >
                    <div className="d-flex align-items-center gap-3">
                      {/* Avatar */}
                      <div
                        className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width: 44, height: 44 }}
                      >
                        <FaUser className="text-primary" />
                      </div>
                      {/* Info */}
                      <div className="flex-grow-1 text-start">
                        <div className="fw-semibold text-dark">
                          {profile.fullName}
                        </div>
                        <div className="small text-muted d-flex gap-3 mt-1">
                          <span>
                            <FaPhone className="me-1" />
                            {profile.phone ?? "N/A"}
                          </span>
                          <span>
                            <FaIdCard className="me-1" />
                            {profile.identityNumber ?? "N/A"}
                          </span>
                        </div>
                      </div>
                      {/* Select indicator */}
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

// ====================== CREATE CONTRACT PAGE ======================
const CreateContract = () => {
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    roomId: "",
    startDate: "",
    endDate: "",
    billingDay: "",
    representativeId: null,
    memberIds: [],
  });

  // ====================== HANDLERS ======================
  const handleSelectProfile = (profile) => {
    const id = profile.profileId ?? profile.id;
    setSelectedProfile(profile);
    setForm((prev) => ({
      ...prev,
      representativeId: id,
      // Đại diện tự động là thành viên
      memberIds: prev.memberIds.includes(id)
        ? prev.memberIds
        : [...prev.memberIds, id],
    }));
    setShowModal(false);
    setErrors((prev) => ({ ...prev, representativeId: null }));
  };

  const handleRemoveRepresentative = () => {
    const id = selectedProfile?.profileId ?? selectedProfile?.id;
    setSelectedProfile(null);
    setForm((prev) => ({
      ...prev,
      representativeId: null,
      memberIds: prev.memberIds.filter((m) => m !== id),
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  // ====================== VALIDATION ======================
  const validate = () => {
    const newErrors = {};
    if (!form.roomId || isNaN(Number(form.roomId)))
      newErrors.roomId = "Vui lòng nhập ID phòng hợp lệ";
    if (!form.representativeId)
      newErrors.representativeId = "Vui lòng chọn người đại diện";
    if (!form.startDate) newErrors.startDate = "Vui lòng chọn ngày bắt đầu";
    if (!form.endDate) newErrors.endDate = "Vui lòng chọn ngày kết thúc";
    if (form.startDate && form.endDate && form.startDate >= form.endDate)
      newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
    if (
      !form.billingDay ||
      isNaN(Number(form.billingDay)) ||
      Number(form.billingDay) < 1 ||
      Number(form.billingDay) > 28
    )
      newErrors.billingDay = "Ngày thanh toán phải từ 1 đến 28";
    return newErrors;
  };

  // ====================== SUBMIT ======================
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      roomId: Number(form.roomId),
      startDate: form.startDate,
      endDate: form.endDate,
      billingDay: Number(form.billingDay),
      representativeId: form.representativeId,
      memberIds: form.memberIds,
    };

    try {
      setSubmitting(true);
      await apiContract.createContract(payload);
      alert("Tạo hợp đồng thành công!");
      navigate("/contracts");
    } catch (err) {
      console.error("Lỗi tạo hợp đồng:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        "Có lỗi xảy ra khi tạo hợp đồng!";
      alert(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  // ====================== RENDER ======================
  return (
    <>
      {showModal && (
        <ProfileSearchModal
          onSelect={handleSelectProfile}
          onClose={() => setShowModal(false)}
        />
      )}

      <div className="container-fluid py-4" style={{ maxWidth: 760 }}>
        {/* Header */}
        <div className="d-flex align-items-center gap-3 mb-4">
          <button
            className="btn btn-light border-0 shadow-sm"
            onClick={() => navigate("/contracts")}
          >
            <FaArrowLeft />
          </button>
          <div>
            <h4 className="fw-bold text-dark mb-0">
              <FaFileContract className="me-2 text-primary" />
              Tạo hợp đồng mới
            </h4>
            <p className="text-muted small mb-0">
              Điền thông tin để tạo hợp đồng thuê phòng
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* ---- THÔNG TIN PHÒNG ---- */}
          <div className="card border-0 shadow-sm rounded-3 mb-3">
            <div className="card-header bg-white border-0 pt-3 pb-0">
              <h6 className="fw-bold text-dark mb-0">Thông tin phòng</h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">
                    ID Phòng <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    name="roomId"
                    className={`form-control ${errors.roomId ? "is-invalid" : ""}`}
                    placeholder="Nhập ID phòng"
                    value={form.roomId}
                    onChange={handleChange}
                    min={1}
                  />
                  {errors.roomId && (
                    <div className="invalid-feedback">{errors.roomId}</div>
                  )}
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">
                    Ngày thanh toán hàng tháng{" "}
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    name="billingDay"
                    className={`form-control ${errors.billingDay ? "is-invalid" : ""}`}
                    placeholder="VD: 5 (ngày 5 hàng tháng)"
                    value={form.billingDay}
                    onChange={handleChange}
                    min={1}
                    max={28}
                  />
                  {errors.billingDay && (
                    <div className="invalid-feedback">{errors.billingDay}</div>
                  )}
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">
                    Ngày bắt đầu <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    className={`form-control ${errors.startDate ? "is-invalid" : ""}`}
                    value={form.startDate}
                    onChange={handleChange}
                  />
                  {errors.startDate && (
                    <div className="invalid-feedback">{errors.startDate}</div>
                  )}
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">
                    Ngày kết thúc <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    className={`form-control ${errors.endDate ? "is-invalid" : ""}`}
                    value={form.endDate}
                    onChange={handleChange}
                    min={form.startDate || undefined}
                  />
                  {errors.endDate && (
                    <div className="invalid-feedback">{errors.endDate}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ---- NGƯỜI ĐẠI DIỆN ---- */}
          <div className="card border-0 shadow-sm rounded-3 mb-3">
            <div className="card-header bg-white border-0 pt-3 pb-0 d-flex justify-content-between align-items-center">
              <h6 className="fw-bold text-dark mb-0">
                Người đại diện <span className="text-danger">*</span>
              </h6>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={() => setShowModal(true)}
              >
                <FaSearch className="me-1" />
                {selectedProfile ? "Đổi người đại diện" : "Tìm kiếm"}
              </button>
            </div>
            <div className="card-body">
              {errors.representativeId && (
                <div className="alert alert-danger py-2 small mb-3">
                  {errors.representativeId}
                </div>
              )}

              {!selectedProfile ? (
                <div
                  className="border rounded-2 p-4 text-center text-muted bg-light"
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowModal(true)}
                >
                  <FaUser className="fs-3 mb-2 opacity-25" />
                  <p className="small mb-0">
                    Nhấn <strong>Tìm kiếm</strong> để chọn người đại diện
                  </p>
                  <p className="small mb-0 text-muted">
                    Tìm theo tên, SĐT hoặc CCCD
                  </p>
                </div>
              ) : (
                <div className="d-flex align-items-center gap-3 p-3 border rounded-2 bg-success bg-opacity-10">
                  <div
                    className="rounded-circle bg-success bg-opacity-25 d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: 48, height: 48 }}
                  >
                    <FaUser className="text-success" />
                  </div>
                  <div className="flex-grow-1">
                    <div className="fw-semibold text-dark">
                      {selectedProfile.fullName}
                    </div>
                    <div className="small text-muted d-flex gap-3 mt-1">
                      <span>
                        <FaPhone className="me-1" />
                        {selectedProfile.phone ?? "N/A"}
                      </span>
                      <span>
                        <FaIdCard className="me-1" />
                        {selectedProfile.identityNumber ?? "N/A"}
                      </span>
                    </div>
                    <div className="small text-muted mt-1">
                      Profile ID:{" "}
                      <strong>
                        {selectedProfile.profileId ?? selectedProfile.id}
                      </strong>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-light border-0"
                    onClick={handleRemoveRepresentative}
                    title="Bỏ chọn"
                  >
                    <FaTimes className="text-danger" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ---- THÀNH VIÊN ---- */}
          <div className="card border-0 shadow-sm rounded-3 mb-4">
            <div className="card-header bg-white border-0 pt-3 pb-0">
              <h6 className="fw-bold text-dark mb-0">Danh sách thành viên</h6>
              <p className="small text-muted mb-0">
                Người đại diện được tự động thêm vào. Có thể thêm thành viên
                khác sau khi tạo hợp đồng.
              </p>
            </div>
            <div className="card-body">
              {form.memberIds.length === 0 ? (
                <p className="text-muted small mb-0">Chưa có thành viên nào.</p>
              ) : (
                <div className="d-flex flex-wrap gap-2">
                  {form.memberIds.map((id) => (
                    <span
                      key={id}
                      className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-2 rounded-pill"
                    >
                      <FaUser className="me-1" />
                      Profile #{id}
                      {id === form.representativeId && (
                        <span
                          className="ms-1 badge bg-success rounded-pill"
                          style={{ fontSize: "0.65rem" }}
                        >
                          Đại diện
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ---- NOTE ---- */}
          <div className="alert alert-info small mb-4">
            <strong>Lưu ý:</strong> Giá thuê và tiền cọc sẽ được lấy tự động từ
            thông tin phòng. Dịch vụ có thể thêm sau khi tạo hợp đồng.
          </div>

          {/* ---- ACTIONS ---- */}
          <div className="d-flex gap-2 justify-content-end">
            <button
              type="button"
              className="btn btn-light border"
              onClick={() => navigate("/contracts")}
              disabled={submitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn-primary px-4"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  />
                  Đang tạo...
                </>
              ) : (
                <>
                  <FaCheck className="me-2" />
                  Tạo hợp đồng
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreateContract;
