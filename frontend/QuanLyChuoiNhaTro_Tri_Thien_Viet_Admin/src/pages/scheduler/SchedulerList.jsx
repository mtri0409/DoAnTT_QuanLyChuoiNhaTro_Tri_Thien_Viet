import React, { useState, useEffect } from "react";
import { FaPlay, FaEdit, FaClock, FaToggleOn, FaToggleOff, FaServer } from "react-icons/fa";
import apiScheduler from "../../api/apiScheduler";
import { toast } from "react-toastify";
import { confirmAction } from "../../utils/swalUtils";

const SchedulerList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [triggering, setTriggering] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [editData, setEditData] = useState({ cronExpression: "", isActive: true });
  const [saving, setSaving] = useState(false);

  const fetchSchedulers = async () => {
    setLoading(true);
    try {
      const res = await apiScheduler.getAll();
      setData(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Fetch schedulers error:", err);
      toast.error("Lỗi tải danh sách scheduler");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedulers();
  }, []);

  const handleTrigger = async (codeKey, name) => {
    const result = await confirmAction({
      title: "Kích hoạt ngay",
      text: `Bạn có chắc muốn chạy tác vụ "${name}" ngay lập tức?`,
      icon: "info",
      confirmText: "Chạy ngay",
    });
    if (!result.isConfirmed) return;

    setTriggering(codeKey);
    try {
      await apiScheduler.trigger(codeKey);
      toast.success(`Đã kích hoạt "${name}" thành công!`);
    } catch (err) {
      console.error("Trigger error:", err);
      toast.error("Lỗi khi kích hoạt: " + (err.response?.data || err.message));
    } finally {
      setTriggering(null);
    }
  };

  const openEditModal = (item) => {
    setEditData({
      cronExpression: item.cronExpression || "",
      isActive: item.isActive !== false,
    });
    setEditModal(item);
  };

  const handleSaveEdit = async () => {
    if (!editData.cronExpression.trim()) {
      toast.warning("Vui lòng nhập cron expression!");
      return;
    }
    setSaving(true);
    try {
      await apiScheduler.update(editModal.id, editData);
      toast.success(`Cập nhật "${editModal.name}" thành công!`);
      setEditModal(null);
      fetchSchedulers();
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Lỗi khi cập nhật: " + (err.response?.data || err.message));
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (isActive) => {
    return isActive !== false
      ? <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill small fw-semibold">
          <FaToggleOn className="me-1" /> Hoạt động
        </span>
      : <span className="badge bg-secondary bg-opacity-10 text-secondary px-3 py-2 rounded-pill small fw-semibold">
          <FaToggleOff className="me-1" /> Tắt
        </span>;
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">QUẢN LÝ SCHEDULER</h4>
          <p className="text-muted small mb-0">
            Cấu hình thời gian chạy cho các tác vụ tự động
          </p>
        </div>
      </div>

      {/* EDIT MODAL */}
      {editModal && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Cập nhật Scheduler</h5>
                <button type="button" className="btn-close" onClick={() => setEditModal(null)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">TÊN TÁC VỤ</label>
                  <input type="text" className="form-control bg-light border-0 py-2" value={editModal.name} disabled />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">CODE KEY</label>
                  <input type="text" className="form-control bg-light border-0 py-2" value={editModal.codeKey} disabled />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">
                    CRON EXPRESSION <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control bg-light border-0 py-2"
                    placeholder="VD: 0 0 8 * * *"
                    value={editData.cronExpression}
                    onChange={(e) => setEditData({ ...editData, cronExpression: e.target.value })}
                  />
                  <div className="small text-muted mt-1">
                    Định dạng: <code>giây phút giờ ngày tháng thứ</code> (6 field)
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">TRẠNG THÁI</label>
                  <div className="d-flex gap-3">
                    <label className="form-check-label d-flex align-items-center gap-2">
                      <input
                        type="radio"
                        className="form-check-input"
                        checked={editData.isActive === true}
                        onChange={() => setEditData({ ...editData, isActive: true })}
                      />
                      <FaToggleOn className="text-success" /> Hoạt động
                    </label>
                    <label className="form-check-label d-flex align-items-center gap-2">
                      <input
                        type="radio"
                        className="form-check-input"
                        checked={editData.isActive === false}
                        onChange={() => setEditData({ ...editData, isActive: false })}
                      />
                      <FaToggleOff className="text-secondary" /> Tắt
                    </label>
                  </div>
                </div>
                {editModal.description && (
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">MÔ TẢ</label>
                    <p className="text-muted small mb-0">{editModal.description}</p>
                  </div>
                )}
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-light" onClick={() => setEditModal(null)} disabled={saving}>
                  Hủy
                </button>
                <button type="button" className="btn btn-primary" onClick={handleSaveEdit} disabled={saving}>
                  {saving ? <span className="spinner-border spinner-border-sm me-1" /> : null}
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr className="text-muted small text-uppercase">
                  <th className="ps-4 py-3">Tên tác vụ</th>
                  <th>Code Key</th>
                  <th>Cron Expression</th>
                  <th>Trạng thái</th>
                  <th>Mô tả</th>
                  <th className="text-end pe-4">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <div className="spinner-border spinner-border-sm text-primary" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                      </div>
                      <span className="ms-2">Đang tải...</span>
                    </td>
                  </tr>
                ) : data.length > 0 ? (
                  data.map((item) => (
                    <tr key={item.id}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center">
                          <FaServer className="fs-5 text-secondary me-2" />
                          <span className="fw-semibold">{item.name}</span>
                        </div>
                      </td>
                      <td>
                        <code className="bg-light px-2 py-1 rounded small">{item.codeKey}</code>
                      </td>
                      <td>
                        <span className="d-inline-flex align-items-center gap-1 text-primary fw-semibold">
                          <FaClock size={12} />
                          {item.cronExpression}
                        </span>
                      </td>
                      <td>{getStatusBadge(item.isActive)}</td>
                      <td>
                        <span className="text-muted small">{item.description || "-"}</span>
                      </td>
                      <td className="text-end pe-4">
                        <div className="d-flex justify-content-end gap-1">
                          <button
                            className="btn btn-sm btn-light border-0"
                            onClick={() => handleTrigger(item.codeKey, item.name)}
                            disabled={triggering === item.codeKey}
                            title="Chạy ngay"
                          >
                            {triggering === item.codeKey ? (
                              <span className="spinner-border spinner-border-sm text-success">
                                <span className="visually-hidden">Đang chạy...</span>
                              </span>
                            ) : (
                              <FaPlay className="text-success" />
                            )}
                          </button>
                          <button
                            className="btn btn-sm btn-light border-0"
                            onClick={() => openEditModal(item)}
                            title="Chỉnh sửa"
                          >
                            <FaEdit className="text-primary" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      Không tìm thấy scheduler nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card-footer bg-white py-3 border-0">
          <small className="text-muted">
            Tổng: <strong>{data.length}</strong> scheduler
          </small>
        </div>
      </div>
    </div>
  );
};

export default SchedulerList;
