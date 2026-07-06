import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaPaperPlane,
  FaDoorOpen,
  FaCheckCircle,
  FaImage,
  FaEdit,
} from "react-icons/fa";
import apiPost from "../../api/apiPost";
import apiRoom from "../../api/apiRoom";
import { imgURL } from "../../api/config";
import { notify } from "../../utils/swalUtils";

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

  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomDetail, setRoomDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [roomError, setRoomError] = useState(null);

  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiRoom.getMyRooms();
        const list = Array.isArray(data) ? data : (data?.data ?? []);
        setRooms(list);
        if (list.length === 1) setSelectedRoom(list[0]);
      } catch {
        setRoomError("Không thể tải danh sách phòng. Vui lòng thử lại.");
      } finally {
        setLoadingRooms(false);
      }
    };
    load();
  }, []);

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
      navigate("/user/posts");
      notify("Đăng bài thành công")
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

  const thumbnail =
    roomDetail?.roomMedia?.find((m) => m.isThumbnail) ??
    roomDetail?.roomMedia?.[0];
  const descLen = description.length;

  return (
    <div className="container-fluid py-4 animate__animated animate__fadeIn">
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
            <h4 className="fw-bold text-dark mb-0">
              ĐĂNG BÀI TÌM BẠN GHÉP PHÒNG
            </h4>
            <span className="text-muted small">
              Bài đăng sẽ hiển thị công khai và tự động hết hạn sau 30 ngày
            </span>
          </div>
        </div>
        <button
          type="submit"
          form="create-post-form"
          className="btn btn-primary d-flex align-items-center gap-2 px-4 shadow-sm"
          disabled={submitting || rooms.length === 0}
        >
          {submitting ? (
            <>
              <span className="spinner-border spinner-border-sm" /> Đang đăng...
            </>
          ) : (
            <>
              <FaPaperPlane /> Đăng bài
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
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
            <h6 className="fw-bold mb-4 border-bottom pb-3 d-flex align-items-center gap-2">
              <FaDoorOpen className="text-primary" /> Chọn phòng
            </h6>

            {loadingRooms ? (
              <div className="d-flex align-items-center gap-2 text-muted small py-2">
                <span className="spinner-border spinner-border-sm" /> Đang tải
                danh sách phòng...
              </div>
            ) : roomError ? (
              <div className="alert alert-warning py-2 small rounded-3">
                {roomError}
              </div>
            ) : rooms.length === 0 ? (
              <div className="alert alert-info py-2 small rounded-3">
                Bạn chưa là thành viên của phòng nào. Vui lòng liên hệ quản lý
                để được thêm vào phòng.
              </div>
            ) : rooms.length === 1 ? (
              <div className="d-inline-flex align-items-center gap-2 bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2 small">
                <FaDoorOpen size={13} />
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
          </div>

          {/* ── Preview phòng ── */}
          {selectedRoom && (
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
              {loadingDetail ? (
                <div className="d-flex align-items-center justify-content-center py-4 text-muted small gap-2 p-4">
                  <span className="spinner-border spinner-border-sm" /> Đang tải
                  thông tin phòng...
                </div>
              ) : (
                <>
                  {/* Thumbnail */}
                  <div
                    className="bg-secondary bg-opacity-10 d-flex align-items-center justify-content-center"
                    style={{ height: 180 }}
                  >
                    {thumbnail ? (
                      <img
                        src={getFullImageUrl(thumbnail.url)}
                        alt={selectedRoom.roomName}
                        style={{
                          width: "100%",
                          height: 180,
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <FaImage size={36} className="text-muted opacity-50" />
                    )}
                  </div>
                  <div className="card-body p-4">
                    <div className="fw-semibold d-flex align-items-center gap-2 mb-2">
                      <FaDoorOpen className="text-primary" size={14} />
                      {selectedRoom.roomName}
                    </div>
                    {roomDetail?.price && (
                      <div className="text-success fw-bold fs-5 mb-1">
                        {formatPrice(roomDetail.price)}
                        <span className="text-muted fw-normal small">
                          {" "}
                          /tháng
                        </span>
                      </div>
                    )}
                    {roomDetail?.currentPeople != null &&
                      roomDetail?.maxPeople != null && (
                        <div className="text-muted small">
                          {roomDetail.currentPeople}/{roomDetail.maxPeople}{" "}
                          người
                        </div>
                      )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Cột phải: Mô tả ── */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <h6 className="fw-bold mb-4 border-bottom pb-3 d-flex align-items-center gap-2">
              <FaEdit className="text-info" /> Nội dung bài đăng
            </h6>

            <form id="create-post-form" onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label className="form-label fw-medium small">
                  Mô tả <span className="text-danger">*</span>
                </label>
                <textarea
                  className={`form-control rounded-3 ${errors.description ? "is-invalid" : ""}`}
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setErrors((p) => ({ ...p, description: undefined }));
                    setApiError(null);
                  }}
                  rows={10}
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

              <div className="alert alert-info py-2 small rounded-3 mb-0">
                💡 Gợi ý: nêu rõ giá thuê chia sẻ, giới tính, thói quen sinh
                hoạt để tìm người phù hợp nhanh hơn.
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
