import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaPaperPlane,
  FaSearch,
  FaDoorOpen,
} from "react-icons/fa";
import apiPost from "../../api/apiPost";
import apiRoom from "../../api/apiRoom";

const MIN_DESC = 20;
const MAX_DESC = 1000;

export default function CreatePost() {
  const navigate = useNavigate();

  // ── Room search state ──
  const [roomQuery, setRoomQuery] = useState("");
  const [roomResults, setRoomResults] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null); // { roomId, roomName }
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef(null);
  const dropdownRef = useRef(null);

  // ── Form state ──
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Debounce search
  const handleRoomInput = (e) => {
    const val = e.target.value;
    setRoomQuery(val);
    setSelectedRoom(null);
    setErrors((p) => ({ ...p, room: undefined }));

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim()) {
      setRoomResults([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await apiRoom.searchByName(val.trim(), 0, 8);
        const list = res.content || res || [];
        setRoomResults(list);
        setShowDropdown(true);
      } catch {
        setRoomResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
  };

  const selectRoom = (room) => {
    setSelectedRoom(room);
    setRoomQuery(room.roomName);
    setShowDropdown(false);
    setErrors((p) => ({ ...p, room: undefined }));
  };

  // Validate
  const validate = () => {
    const errs = {};
    if (!selectedRoom) errs.room = "Vui lòng chọn phòng từ danh sách.";
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

  const descLen = description.length;

  return (
    <div className="container py-4" style={{ maxWidth: 640 }}>
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
            Bài đăng sẽ hiển thị và tự động hết hạn sau 30 ngày.
          </p>

          {apiError && (
            <div className="alert alert-danger py-2 small">{apiError}</div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* ── Room Search ── */}
            <div className="mb-3" ref={dropdownRef}>
              <label className="form-label fw-medium small">
                Phòng <span className="text-danger">*</span>
              </label>
              <div className="position-relative">
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    {searching ? (
                      <span className="spinner-border spinner-border-sm text-muted" />
                    ) : (
                      <FaSearch size={13} className="text-muted" />
                    )}
                  </span>
                  <input
                    type="text"
                    className={`form-control form-control-sm border-start-0 ps-0 ${errors.room ? "is-invalid" : ""}`}
                    placeholder="Nhập tên phòng để tìm..."
                    value={roomQuery}
                    onChange={handleRoomInput}
                    onFocus={() =>
                      roomResults.length > 0 && setShowDropdown(true)
                    }
                    autoComplete="off"
                    style={{ boxShadow: "none" }}
                  />
                  {errors.room && (
                    <div className="invalid-feedback">{errors.room}</div>
                  )}
                </div>

                {/* Dropdown */}
                {showDropdown && (
                  <ul
                    className="list-group position-absolute w-100 shadow-sm z-3 mt-1"
                    style={{ maxHeight: 220, overflowY: "auto" }}
                  >
                    {roomResults.length === 0 ? (
                      <li className="list-group-item text-muted small py-2">
                        Không tìm thấy phòng nào.
                      </li>
                    ) : (
                      roomResults.map((room) => (
                        <li
                          key={room.roomId}
                          className="list-group-item list-group-item-action py-2 px-3 small d-flex align-items-center gap-2"
                          style={{ cursor: "pointer" }}
                          onMouseDown={() => selectRoom(room)}
                        >
                          <FaDoorOpen
                            className="text-primary flex-shrink-0"
                            size={13}
                          />
                          <span className="fw-medium">{room.roomName}</span>
                          {room.floorName && (
                            <span className="text-muted ms-auto">
                              {room.floorName}
                            </span>
                          )}
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>

              {/* Selected room chip */}
              {selectedRoom && (
                <div className="mt-2 d-inline-flex align-items-center gap-2 bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-1 small">
                  <FaDoorOpen size={12} />
                  <span className="fw-medium">{selectedRoom.roomName}</span>
                  <button
                    type="button"
                    className="btn-close btn-close-white ms-1"
                    style={{
                      fontSize: 9,
                      filter:
                        "invert(0.5) sepia(1) saturate(5) hue-rotate(200deg)",
                    }}
                    onClick={() => {
                      setSelectedRoom(null);
                      setRoomQuery("");
                    }}
                  />
                </div>
              )}
              <div className="form-text">
                Chỉ đăng được cho phòng bạn đang là thành viên.
              </div>
            </div>

            {/* ── Description ── */}
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
              💡 Gợi ý: nêu rõ giá thuê, giới tính, thói quen sinh hoạt để tìm
              người phù hợp nhanh hơn.
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
                disabled={submitting}
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
