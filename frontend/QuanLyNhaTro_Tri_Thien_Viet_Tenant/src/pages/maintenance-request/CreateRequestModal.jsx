import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaPaperPlane,
  FaHome,
  FaCheckCircle,
  FaCamera,
  FaTrash,
  FaEdit,
} from "react-icons/fa";
import apiMaintenanceRequest from "../../api/apiMaintenanceaRequest";
import apiRoom from "../../api/apiRoom";

const MIN_DESC = 10;
const MAX_DESC = 1000;
const MAX_IMAGES = 5;

export default function CreateMaintenanceRequest() {
  const navigate = useNavigate();
  const fileRef = useRef();

  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomError, setRoomError] = useState(null);

  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiRoom.getMyRooms();
        const list = Array.isArray(data)
          ? data
          : (data?.content ?? data?.data ?? []);
        setRooms(list);
        if (list.length >= 1) setSelectedRoom(list[0]);
      } catch {
        setRoomError("Không thể tải thông tin phòng. Vui lòng thử lại.");
      } finally {
        setLoadingRooms(false);
      }
    };
    load();
  }, []);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    const remaining = MAX_IMAGES - files.length;
    if (selected.length > remaining) {
      setErrors((p) => ({
        ...p,
        images: `Chỉ được chọn thêm tối đa ${remaining} ảnh`,
      }));
      return;
    }
    const newFiles = [...files, ...selected].slice(0, MAX_IMAGES);
    setFiles(newFiles);
    setPreviews(newFiles.map((f) => URL.createObjectURL(f)));
    setErrors((p) => ({ ...p, images: undefined }));
    e.target.value = "";
  };

  const removeFile = (idx) => {
    setFiles((f) => f.filter((_, i) => i !== idx));
    setPreviews((p) => p.filter((_, i) => i !== idx));
  };

  const validate = () => {
    const errs = {};
    if (!selectedRoom) errs.room = "Vui lòng chọn phòng.";
    if (!description.trim()) errs.description = "Mô tả không được để trống.";
    else if (description.trim().length < MIN_DESC)
      errs.description = `Mô tả phải có ít nhất ${MIN_DESC} ký tự.`;
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    setApiError(null);
    try {
      const created = await apiMaintenanceRequest.createRequest(
        selectedRoom.roomId,
        description.trim(),
      );
      if (files.length > 0) {
        await apiMaintenanceRequest.uploadImages(created.requestId, files);
      }
      navigate("/user/requests", {
        state: { success: "Gửi yêu cầu sửa chữa thành công!" },
      });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Lỗi khi gửi yêu cầu. Thử lại sau.";
      setApiError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  const descLen = description.length;

  return (
    <div
      className="container-fluid py-4 bg-light"
      style={{ minHeight: "100vh" }}
    >
      {/* ── Header Panel ── */}
      <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded-4 shadow-sm">
        <div className="d-flex align-items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-light border-0 rounded-circle p-2 shadow-sm"
          >
            <FaArrowLeft className="text-muted" />
          </button>
          <div>
            <h4 className="fw-bold text-dark mb-0">GỬI YÊU CẦU SỬA CHỮA</h4>
            <span className="text-muted small">
              Mô tả chi tiết để kỹ thuật viên xử lý nhanh hơn
            </span>
          </div>
        </div>
        <button
          type="submit"
          form="create-request-form"
          className="btn btn-warning text-dark d-flex align-items-center gap-2 px-4 shadow-sm fw-semibold"
          disabled={submitting || loadingRooms || !selectedRoom}
        >
          {submitting ? (
            <>
              <span className="spinner-border spinner-border-sm" /> Đang gửi...
            </>
          ) : (
            <>
              <FaPaperPlane /> Gửi yêu cầu
            </>
          )}
        </button>
      </div>

      {/* ── API Error ── */}
      {apiError && (
        <div className="alert alert-danger py-2 small rounded-3 mb-4">
          {apiError}
        </div>
      )}

      <div className="row g-4">
        {/* ── Cột trái: Chọn phòng ── */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <h6 className="fw-bold mb-4 border-bottom pb-3 d-flex align-items-center gap-2">
              <FaHome className="text-warning" /> Phòng của bạn
            </h6>

            {loadingRooms ? (
              <div className="d-flex align-items-center gap-2 text-muted small py-2">
                <span className="spinner-border spinner-border-sm" /> Đang
                tải...
              </div>
            ) : roomError ? (
              <div className="alert alert-warning py-2 small rounded-3">
                {roomError}
              </div>
            ) : rooms.length === 0 ? (
              <div className="alert alert-info py-2 small rounded-3">
                Bạn chưa đang thuê phòng nào. Vui lòng liên hệ quản lý.
              </div>
            ) : rooms.length === 1 ? (
              <div className="d-inline-flex align-items-center gap-2 bg-warning bg-opacity-10 text-warning rounded-pill px-3 py-2 small">
                <FaHome size={13} />
                <span className="fw-semibold">{rooms[0].roomName}</span>
                <FaCheckCircle size={12} className="ms-1" />
              </div>
            ) : (
              <select
                className={`form-select rounded-3 ${errors.room ? "is-invalid" : ""}`}
                value={selectedRoom?.roomId ?? ""}
                onChange={(e) => {
                  const found = rooms.find(
                    (r) => r.roomId === Number(e.target.value),
                  );
                  setSelectedRoom(found ?? null);
                  setErrors((p) => ({ ...p, room: undefined }));
                }}
              >
                <option value="">-- Chọn phòng --</option>
                {rooms.map((r) => (
                  <option key={r.roomId} value={r.roomId}>
                    {r.roomName}
                  </option>
                ))}
              </select>
            )}
            {errors.room && (
              <div className="invalid-feedback d-block small mt-1">
                {errors.room}
              </div>
            )}

            {/* Tips box */}
            {selectedRoom && (
              <div className="mt-4 rounded-3 p-3 bg-warning bg-opacity-10 border border-warning-subtle">
                <p
                  className="mb-2 fw-semibold text-warning-emphasis"
                  style={{ fontSize: 12 }}
                >
                  💡 Mẹo để được xử lý nhanh
                </p>
                <ul
                  className="mb-0 ps-3 text-warning-emphasis"
                  style={{ fontSize: 12 }}
                >
                  <li className="mb-1">
                    Nêu rõ vị trí sự cố (phòng ngủ, WC, bếp…)
                  </li>
                  <li className="mb-1">
                    Đính kèm ảnh để kỹ thuật viên nắm được vấn đề
                  </li>
                  <li>Ghi thời điểm xảy ra nếu biết</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* ── Cột phải: Nội dung + ảnh ── */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <h6 className="fw-bold mb-4 border-bottom pb-3 d-flex align-items-center gap-2">
              <FaEdit className="text-warning" /> Nội dung yêu cầu
            </h6>

            <form id="create-request-form" onSubmit={handleSubmit} noValidate>
              {/* Description */}
              <div className="mb-4">
                <label className="form-label fw-medium small">
                  Mô tả sự cố <span className="text-danger">*</span>
                </label>
                <textarea
                  className={`form-control rounded-3 ${errors.description ? "is-invalid" : ""}`}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setErrors((p) => ({ ...p, description: undefined }));
                    setApiError(null);
                  }}
                  rows={7}
                  maxLength={MAX_DESC}
                  placeholder={`Ví dụ: Điều hòa phòng không hoạt động, bật lên có tiếng kêu lạ và không ra hơi lạnh... (tối thiểu ${MIN_DESC} ký tự)`}
                  style={{ resize: "none", lineHeight: 1.7 }}
                />
                {errors.description && (
                  <div className="invalid-feedback">{errors.description}</div>
                )}
                <div className="d-flex justify-content-between mt-1">
                  <span
                    className={`small ${descLen < MIN_DESC && descLen > 0 ? "text-danger" : "text-muted"}`}
                  >
                    {descLen < MIN_DESC && descLen > 0
                      ? `Cần thêm ${MIN_DESC - descLen} ký tự`
                      : ""}
                  </span>
                  <span
                    className={`small ${descLen >= MAX_DESC ? "text-danger" : "text-muted"}`}
                  >
                    {descLen}/{MAX_DESC}
                  </span>
                </div>
              </div>

              {/* Image upload */}
              <div className="mb-2">
                <label className="form-label fw-medium small">
                  Ảnh minh hoạ{" "}
                  <span className="text-muted fw-normal">
                    (tối đa {MAX_IMAGES} ảnh, JPEG/PNG/WebP)
                  </span>
                </label>
                {errors.images && (
                  <div className="text-danger small mb-2">{errors.images}</div>
                )}

                <div className="d-flex flex-wrap gap-2">
                  {previews.map((src, idx) => (
                    <div
                      key={idx}
                      className="position-relative rounded-3 overflow-hidden border flex-shrink-0"
                      style={{ width: 90, height: 90 }}
                    >
                      <img
                        src={src}
                        alt=""
                        className="w-100 h-100"
                        style={{ objectFit: "cover" }}
                      />
                      <button
                        type="button"
                        className="btn btn-danger btn-sm position-absolute top-0 end-0 d-flex align-items-center justify-content-center p-0 rounded-circle m-1"
                        style={{ width: 22, height: 22 }}
                        onClick={() => removeFile(idx)}
                      >
                        <FaTrash size={9} />
                      </button>
                    </div>
                  ))}

                  {files.length < MAX_IMAGES && (
                    <button
                      type="button"
                      className="btn btn-light border rounded-3 d-flex flex-column align-items-center justify-content-center gap-1 flex-shrink-0 text-secondary"
                      style={{ width: 90, height: 90, fontSize: 11 }}
                      onClick={() => fileRef.current.click()}
                      disabled={submitting}
                    >
                      <FaCamera size={20} />
                      <span>Thêm ảnh</span>
                    </button>
                  )}
                </div>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="d-none"
                  onChange={handleFileChange}
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
