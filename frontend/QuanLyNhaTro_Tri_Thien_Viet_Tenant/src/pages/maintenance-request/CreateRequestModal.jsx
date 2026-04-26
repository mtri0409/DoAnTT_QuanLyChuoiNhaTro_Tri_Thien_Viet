import React, { useState, useRef } from "react";
import { FaTimes, FaCamera, FaTrash, FaTools } from "react-icons/fa";
import apiMaintenanceRequest from "../../api/apiMaintenanceaRequest";
import apiRoom from "../../api/apiRoom";

const MAX_IMAGES = 5;

const CreateRequestModal = ({ show, onClose, onSuccess }) => {
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [roomId, setRoomId] = useState(null);
  const [roomName, setRoomName] = useState("");
  const fileRef = useRef();

  // Fetch phòng đang ở khi mở modal
  React.useEffect(() => {
    if (!show) return;
    apiRoom
      .getMyRooms()
      .then((rooms) => {
        const active = Array.isArray(rooms) ? rooms[0] : rooms?.content?.[0];
        if (active) {
          setRoomId(active.roomId);
          setRoomName(active.roomName);
        }
      })
      .catch(() => setError("Không thể lấy thông tin phòng"));
  }, [show]);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    const remaining = MAX_IMAGES - files.length;
    if (selected.length > remaining) {
      setError(`Chỉ được chọn thêm tối đa ${remaining} ảnh`);
      return;
    }
    const newFiles = [...files, ...selected].slice(0, MAX_IMAGES);
    setFiles(newFiles);
    setPreviews(newFiles.map((f) => URL.createObjectURL(f)));
    setError("");
    e.target.value = "";
  };

  const removeFile = (idx) => {
    const newFiles = files.filter((_, i) => i !== idx);
    const newPreviews = previews.filter((_, i) => i !== idx);
    setFiles(newFiles);
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roomId) {
      setError("Không tìm thấy thông tin phòng của bạn");
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      setError("Mô tả phải có ít nhất 10 ký tự");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const created = await apiMaintenanceRequest.createRequest(
        roomId,
        description,
      );
      if (files.length > 0) {
        await apiMaintenanceRequest.uploadImages(created.requestId, files);
      }
      onSuccess?.();
      handleClose();
    } catch (err) {
      setError(
        err?.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setDescription("");
    setFiles([]);
    setPreviews([]);
    setError("");
    onClose();
  };

  if (!show) return null;

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg rounded-4">
          {/* Header */}
          <div className="modal-header border-0 px-4 pt-4 pb-0">
            <div className="d-flex align-items-center gap-2">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center"
                style={{ width: 40, height: 40, background: "#fff3cd" }}
              >
                <FaTools className="text-warning" size={18} />
              </div>
              <div>
                <h5 className="mb-0 fw-bold">Gửi yêu cầu sửa chữa</h5>
                <p className="mb-0 text-muted" style={{ fontSize: 13 }}>
                  {roomName ? (
                    <>
                      Phòng: <strong>{roomName}</strong>
                    </>
                  ) : (
                    "Mô tả chi tiết để được xử lý nhanh hơn"
                  )}
                </p>
              </div>
            </div>
            <button
              className="btn btn-light btn-sm rounded-circle"
              onClick={handleClose}
              style={{ width: 32, height: 32, padding: 0 }}
            >
              <FaTimes size={14} />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit}>
            <div className="modal-body px-4 py-3">
              {error && (
                <div
                  className="alert alert-danger py-2 small rounded-3"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <div className="mb-3">
                <label className="form-label fw-semibold small">
                  Mô tả sự cố <span className="text-danger">*</span>
                </label>
                <textarea
                  className="form-control rounded-3"
                  rows={4}
                  placeholder="Ví dụ: Điều hòa phòng không hoạt động, bật lên có tiếng kêu lạ..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ resize: "none", fontSize: 14 }}
                  required
                />
                <div className="text-end mt-1">
                  <small
                    className={
                      description.length < 10 ? "text-danger" : "text-muted"
                    }
                  >
                    {description.length} ký tự{" "}
                    {description.length < 10 && "(tối thiểu 10)"}
                  </small>
                </div>
              </div>

              {/* Upload ảnh */}
              <div className="mb-2">
                <label className="form-label fw-semibold small">
                  Ảnh minh hoạ{" "}
                  <span className="text-muted fw-normal">
                    (tối đa {MAX_IMAGES} ảnh, JPEG/PNG/WebP)
                  </span>
                </label>

                <div className="d-flex flex-wrap gap-2">
                  {previews.map((src, idx) => (
                    <div
                      key={idx}
                      className="position-relative"
                      style={{ width: 80, height: 80 }}
                    >
                      <img
                        src={src}
                        alt=""
                        className="rounded-3 object-fit-cover border"
                        style={{ width: "100%", height: "100%" }}
                      />
                      <button
                        type="button"
                        className="btn btn-danger btn-sm position-absolute top-0 end-0 rounded-circle p-0 d-flex align-items-center justify-content-center"
                        style={{
                          width: 22,
                          height: 22,
                          transform: "translate(40%, -40%)",
                        }}
                        onClick={() => removeFile(idx)}
                      >
                        <FaTrash size={9} />
                      </button>
                    </div>
                  ))}

                  {files.length < MAX_IMAGES && (
                    <button
                      type="button"
                      className="btn btn-light border rounded-3 d-flex flex-column align-items-center justify-content-center gap-1"
                      style={{
                        width: 80,
                        height: 80,
                        fontSize: 11,
                        color: "#888",
                      }}
                      onClick={() => fileRef.current.click()}
                    >
                      <FaCamera size={18} />
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
            </div>

            {/* Footer */}
            <div className="modal-footer border-0 px-4 pb-4 pt-2">
              <button
                type="button"
                className="btn btn-light rounded-3 px-4"
                onClick={handleClose}
                disabled={loading}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="btn btn-warning text-dark fw-semibold rounded-3 px-4"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Đang gửi...
                  </>
                ) : (
                  "Gửi yêu cầu"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRequestModal;
