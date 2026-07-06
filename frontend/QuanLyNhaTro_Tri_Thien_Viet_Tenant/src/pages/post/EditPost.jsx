import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { FaArrowLeft, FaSave, FaEdit } from "react-icons/fa";
import apiPost from "../../api/apiPost";

const MIN_DESC = 20;
const MAX_DESC = 1000;

export default function EditPost() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [description, setDescription] = useState("");
  const [loadingPost, setLoadingPost] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [descError, setDescError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiPost.getMyPosts(0, 100);
        const found = res.content?.find((p) => p.postId === Number(postId));
        if (!found) throw new Error("Không tìm thấy bài đăng.");
        if (found.status !== "ACTIVE")
          throw new Error("Bài đăng này không thể chỉnh sửa.");
        setPost(found);
        setDescription(found.description);
      } catch (err) {
        setApiError(err.message || "Không thể tải bài đăng.");
      } finally {
        setLoadingPost(false);
      }
    };
    load();
  }, [postId]);

  const validate = () => {
    if (!description.trim()) return "Mô tả không được để trống.";
    if (description.trim().length < MIN_DESC)
      return `Mô tả phải có ít nhất ${MIN_DESC} ký tự.`;
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setDescError(err);
      return;
    }
    setSubmitting(true);
    setApiError(null);
    try {
      await apiPost.updatePost(postId, { description: description.trim() });
      navigate("/user/posts", {
        state: { success: "Cập nhật bài đăng thành công." },
      });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Lỗi khi cập nhật. Thử lại sau.";
      setApiError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  const descLen = description.length;

  /* ── Loading ── */
  if (loadingPost) {
    return (
      <div className="container-fluid py-4 animate__animated animate__fadeIn">
        <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded-4 shadow-sm">
          <div className="d-flex align-items-center gap-3">
            <div className="btn btn-light border-0 rounded-circle p-2 shadow-sm">
              <FaArrowLeft className="text-muted" />
            </div>
            <div>
              <h4 className="fw-bold text-dark mb-0">CHỈNH SỬA BÀI ĐĂNG</h4>
            </div>
          </div>
        </div>
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body text-center py-5">
            <div className="spinner-border text-primary" />
            <p className="text-muted mt-2 small">Đang tải bài đăng...</p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Not found ── */
  if (apiError && !post) {
    return (
      <div className="container-fluid py-4 animate__animated animate__fadeIn">
        <div className="d-flex align-items-center gap-3 mb-4 bg-white p-3 rounded-4 shadow-sm">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-light border-0 rounded-circle p-2 shadow-sm"
          >
            <FaArrowLeft className="text-muted" />
          </button>
          <h4 className="fw-bold text-dark mb-0">CHỈNH SỬA BÀI ĐĂNG</h4>
        </div>
        <div className="alert alert-danger rounded-3">{apiError}</div>
      </div>
    );
  }

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
            <h4 className="fw-bold text-dark mb-0">CHỈNH SỬA BÀI ĐĂNG</h4>
            <span className="text-muted small">
              Phòng: <strong>{post?.roomName}</strong>
              {post?.branchName && <> — {post.branchName}</>}
            </span>
          </div>
        </div>
        <button
          type="submit"
          form="edit-post-form"
          className="btn btn-primary d-flex align-items-center gap-2 px-4 shadow-sm"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <span className="spinner-border spinner-border-sm" /> Đang lưu...
            </>
          ) : (
            <>
              <FaSave /> Lưu thay đổi
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

      {/* ── Form Card ── */}
      <div className="card border-0 shadow-sm rounded-4 p-4">
        <h6 className="fw-bold mb-4 border-bottom pb-3 d-flex align-items-center gap-2">
          <FaEdit className="text-info" /> Nội dung bài đăng
        </h6>

        <form id="edit-post-form" onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label className="form-label fw-medium small">
              Mô tả <span className="text-danger">*</span>
            </label>
            <textarea
              className={`form-control rounded-3 ${descError ? "is-invalid" : ""}`}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setDescError(null);
                setApiError(null);
              }}
              rows={12}
              maxLength={MAX_DESC}
            />
            {descError && <div className="invalid-feedback">{descError}</div>}
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
        </form>
      </div>
    </div>
  );
}
