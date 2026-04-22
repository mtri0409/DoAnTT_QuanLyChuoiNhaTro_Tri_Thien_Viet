import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaPaperPlane,
  FaDoorOpen,
  FaCheckCircle,
  FaImage,
} from "react-icons/fa";
import apiPost from "../../api/apiPost";
import apiRoom from "../../api/apiRoom";
import { imgURL } from "../../api/config";

const MIN_DESC = 20;
const MAX_DESC = 1000;

const formatPrice = (price) =>
  price
    ? new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(price)
    : null;

const getFullImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  return `${imgURL}${url}`;
};

export default function CreatePost() {
  const navigate = useNavigate();

  // ── Phòng ──
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomDetail, setRoomDetail] = useState(null); // chứa ảnh + giá
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [roomError, setRoomError] = useState(null);

  // ── Form ──
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Load phòng đang ở khi mount
  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiRoom.getMyRooms();
        const list = Array.isArray(data) ? data : (data?.data ?? []);
        setRooms(list);
        // Nếu chỉ có 1 phòng → tự chọn luôn
        if (list.length === 1) setSelectedRoom(list[0]);
      } catch {
        setRoomError("Không thể tải danh sách phòng. Vui lòng thử lại.");
      } finally {
        setLoadingRooms(false);
      }
    };
    load();
  }, []);

  // Khi chọn phòng → load chi tiết (ảnh + giá)
  useEffect(() => {
    if (!selectedRoom) {
      setRoomDetail(null);
      return;
    }
    const load = async () => {
      setLoadingDetail(true);
      try {
        const data = await apiRoom.getRoomById(selectedRoom.roomId);
        setRoomDetail(data?.data ?? data);
      } catch {
        setRoomDetail(null);
      } finally {
        setLoadingDetail(false);
      }
    };
    load();
  }, [selectedRoom]);

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
      await apiPost.createPost({
        roomId: selectedRoom.roomId,
        description: description.trim(),
      });
      navigate("/user/posts", { state: { success: "Đăng bài thành công!" } });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Lỗi khi đăng bài. Thử lại sau.";
      setApiError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  // Lấy ảnh thumbnail hoặc ảnh đầu tiên
  const thumbnail =
    roomDetail?.roomMedia?.find((m) => m.isThumbnail) ??
    roomDetail?.roomMedia?.[0];
  const descLen = description.length;

  return (
    <div className="container py-4" style={{ maxWidth: 660 }}>
      <Link
        to="/user/posts"
        className="btn btn-link text-decoration-none px-0 mb-3 text-secondary"
      >
        <FaArrowLeft className="me-1" /> Quay lại
      </Link>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <h5 className="fw-bold mb-1">Đăng bài tìm bạn ghép phòng</h5>
          <p className="text-muted small mb-4">
            Bài đăng sẽ hiển thị công khai và tự động hết hạn sau 30 ngày.
          </p>

          {apiError && (
            <div className="alert alert-danger py-2 small">{apiError}</div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* ── Chọn phòng ── */}
            <div className="mb-3">
              <label className="form-label fw-medium small">
                Phòng đang ở <span className="text-danger">*</span>
              </label>

              {loadingRooms ? (
                <div className="d-flex align-items-center gap-2 text-muted small py-2">
                  <span className="spinner-border spinner-border-sm" />
                  Đang tải danh sách phòng...
                </div>
              ) : roomError ? (
                <div className="alert alert-warning py-2 small">
                  {roomError}
                </div>
              ) : rooms.length === 0 ? (
                <div className="alert alert-info py-2 small">
                  Bạn chưa là thành viên của phòng nào. Vui lòng liên hệ quản lý
                  để được thêm vào phòng.
                </div>
              ) : rooms.length === 1 ? (
                /* Chỉ 1 phòng → hiện chip không cần chọn */
                <div className="d-inline-flex align-items-center gap-2 bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-1 small">
                  <FaDoorOpen size={12} />
                  <span className="fw-medium">{rooms[0].roomName}</span>
                  <FaCheckCircle size={11} className="ms-1" />
                </div>
              ) : (
                /* Nhiều phòng → dropdown */
                <select
                  className={`form-select form-select-sm ${errors.room ? "is-invalid" : ""}`}
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
                <div className="invalid-feedback d-block">{errors.room}</div>
              )}
            </div>

            {/* ── Preview phòng (ảnh + giá) ── */}
            {selectedRoom && (
              <div
                className="mb-4 rounded-3 overflow-hidden border"
                style={{ background: "#f8f9fa" }}
              >
                {loadingDetail ? (
                  <div className="d-flex align-items-center justify-content-center py-4 text-muted small gap-2">
                    <span className="spinner-border spinner-border-sm" /> Đang
                    tải thông tin phòng...
                  </div>
                ) : (
                  <div
                    className="d-flex align-items-stretch"
                    style={{ minHeight: 90 }}
                  >
                    {/* Ảnh thumbnail */}
                    <div
                      className="flex-shrink-0 d-flex align-items-center justify-content-center bg-secondary bg-opacity-10"
                      style={{ width: 120 }}
                    >
                      {thumbnail ? (
                        <img
                          src={getFullImageUrl(thumbnail.url)}
                          alt={selectedRoom.roomName}
                          style={{ width: 120, height: 90, objectFit: "cover" }}
                        />
                      ) : (
                        <FaImage size={28} className="text-muted opacity-50" />
                      )}
                    </div>

                    {/* Thông tin phòng */}
                    <div className="p-3 d-flex flex-column justify-content-center gap-1 flex-grow-1">
                      <div className="fw-semibold small d-flex align-items-center gap-1">
                        <FaDoorOpen className="text-primary" size={13} />
                        {selectedRoom.roomName}
                      </div>
                      {roomDetail?.price && (
                        <div
                          className="text-success fw-bold"
                          style={{ fontSize: 15 }}
                        >
                          {formatPrice(roomDetail.price)}
                          <span
                            className="text-muted fw-normal"
                            style={{ fontSize: 12 }}
                          >
                            {" "}
                            /tháng
                          </span>
                        </div>
                      )}
                      {roomDetail?.currentPeople != null &&
                        roomDetail?.maxPeople != null && (
                          <div className="text-muted" style={{ fontSize: 12 }}>
                            {roomDetail.currentPeople}/{roomDetail.maxPeople}{" "}
                            người
                          </div>
                        )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Mô tả ── */}
            <div className="mb-4">
              <label className="form-label fw-medium small">
                Mô tả <span className="text-danger">*</span>
              </label>
              <textarea
                className={`form-control form-control-sm ${errors.description ? "is-invalid" : ""}`}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setErrors((p) => ({ ...p, description: undefined }));
                  setApiError(null);
                }}
                rows={6}
                maxLength={MAX_DESC}
                placeholder={`Mô tả về phòng, yêu cầu người ghép, giá thuê chia sẻ, liên hệ... (tối thiểu ${MIN_DESC} ký tự)`}
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

            <div className="alert alert-info py-2 small mb-4">
              💡 Gợi ý: nêu rõ giá thuê chia sẻ, giới tính, thói quen sinh hoạt
              để tìm người phù hợp nhanh hơn.
            </div>

            <div className="d-flex gap-2 justify-content-end">
              <Link
                to="/user/posts"
                className="btn btn-outline-secondary btn-sm px-4"
              >
                Hủy
              </Link>
              <button
                type="submit"
                className="btn btn-primary btn-sm px-4"
                disabled={submitting || rooms.length === 0}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Đang đăng...
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="me-2" size={12} />
                    Đăng bài
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
