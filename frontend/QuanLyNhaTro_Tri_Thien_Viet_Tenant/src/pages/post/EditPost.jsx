import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { FaArrowLeft, FaSave } from "react-icons/fa";
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
        // Gọi getMyPosts lấy toàn bộ rồi tìm theo postId
        // Hoặc backend có getPostById public (chỉ ACTIVE)
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
      navigate("/user/posts/my", {
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

  if (loadingPost) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" />
        <p className="text-muted mt-2 small">Đang tải bài đăng...</p>
      </div>
    );
  }

  if (apiError && !post) {
    return (
      <div className="container py-4" style={{ maxWidth: 640 }}>
        <div className="alert alert-danger">{apiError}</div>
        <Link to="/user/posts/my" className="btn btn-outline-secondary btn-sm">
          <FaArrowLeft className="me-1" /> Quay lại
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ maxWidth: 640 }}>
      <Link
        to="/user/posts/my"
        className="btn btn-link text-decoration-none px-0 mb-3 text-secondary"
      >
        <FaArrowLeft className="me-1" /> Quay lại bài của tôi
      </Link>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <h5 className="fw-bold mb-1">Chỉnh sửa bài đăng</h5>
          <p className="text-muted small mb-4">
            Phòng: <strong>{post?.roomName}</strong>
            {post?.branchName && <> — {post.branchName}</>}
          </p>

          {apiError && (
            <div className="alert alert-danger py-2 small">{apiError}</div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label className="form-label fw-medium">
                Mô tả <span className="text-danger">*</span>
              </label>
              <textarea
                className={`form-control ${descError ? "is-invalid" : ""}`}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setDescError(null);
                  setApiError(null);
                }}
                rows={7}
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

            <div className="d-flex gap-2 justify-content-end">
              <Link
                to="/user/posts/my"
                className="btn btn-outline-secondary px-4"
              >
                Hủy
              </Link>
              <button
                type="submit"
                className="btn btn-primary px-4"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <FaSave className="me-2" size={13} />
                    Lưu thay đổi
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
