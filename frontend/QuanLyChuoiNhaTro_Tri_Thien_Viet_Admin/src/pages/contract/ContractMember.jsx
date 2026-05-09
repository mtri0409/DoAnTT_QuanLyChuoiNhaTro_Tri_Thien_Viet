import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaUsers,
  FaUserPlus,
  FaTrash,
  FaSearch,
  FaUser,
  FaPhone,
  FaIdCard,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaTimes,
  FaCheck,
  FaFileContract,
  FaEye,
} from "react-icons/fa";
import apiContract from "../../api/apiContract";
import apiProfile from "../../api/apiProfile";

// ====================== HELPERS ======================
const formatContractCode = (id) =>
  id ? `HD-${String(id).padStart(5, "0")}` : "N/A";

// ====================== PROFILE SEARCH MODAL ======================
const AddMemberModal = ({ contractId, existingIds, onAdded, onClose }) => {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(null);
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
      const res = await apiProfile.searchProfiles(
        keyword.trim(),
        0,
        10,
        null,
        null,
        null,
        true,
      );
      setResults(res?.content ?? res ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (profile) => {
    const pid = profile.profileId ?? profile.id;
    setAdding(pid);
    try {
      await apiContract.addMember(contractId, pid);
      onAdded(profile);
    } catch (err) {
      const msg = err.response?.data?.message || "Không thể thêm thành viên!";
      alert(msg);
    } finally {
      setAdding(null);
    }
  };

  return (
    <div
      className="modal d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow-lg rounded-3">
          <div className="modal-header border-0 pb-0 px-4 pt-4">
            <h5 className="modal-title fw-bold">
              <FaUserPlus className="me-2 text-success" />
              Thêm thành viên
            </h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>

          <div className="modal-body px-4 pt-3">
            {/* Search input — same style as ListContract toolbar */}
            <form onSubmit={handleSearch} className="d-flex gap-2 mb-4">
              <div className="input-group">
                <span className="input-group-text bg-light border-0">
                  <FaSearch className="text-muted" />
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  className="form-control bg-light border-0 small"
                  placeholder="Nhập tên, số điện thoại hoặc CCCD..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="btn btn-dark shadow-sm"
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
              <div className="text-center py-5 text-muted">
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
              <div className="d-flex flex-column gap-2">
                {results.map((profile) => {
                  const pid = profile.profileId ?? profile.id;
                  const alreadyAdded = existingIds.includes(pid);
                  const isAdding = adding === pid;

                  return (
                    <div
                      key={pid}
                      className={`rounded-3 px-3 py-2 border d-flex align-items-center gap-3 ${
                        alreadyAdded
                          ? "bg-success-subtle border-success border-opacity-25"
                          : "bg-light border-0"
                      }`}
                    >
                      <div
                        className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ${
                          alreadyAdded
                            ? "bg-success text-white"
                            : "bg-white border text-muted"
                        }`}
                        style={{ width: 40, height: 40 }}
                      >
                        {alreadyAdded ? (
                          <FaCheck size={13} />
                        ) : (
                          <FaUser size={13} />
                        )}
                      </div>

                      <div className="flex-grow-1">
                        <div className="fw-semibold text-dark small">
                          {profile.fullName}
                        </div>
                        <div
                          className="d-flex gap-3 mt-1 text-muted"
                          style={{ fontSize: "0.75rem" }}
                        >
                          {profile.phone && (
                            <span>
                              <FaPhone className="me-1" size={10} />
                              {profile.phone}
                            </span>
                          )}
                          {profile.identityNumber && (
                            <span>
                              <FaIdCard className="me-1" size={10} />
                              {profile.identityNumber}
                            </span>
                          )}
                        </div>
                      </div>

                      {alreadyAdded ? (
                        <span className="badge bg-success-subtle text-success small">
                          Đã thêm
                        </span>
                      ) : (
                        <button
                          className="btn btn-sm btn-outline-success"
                          onClick={() => handleAdd(profile)}
                          disabled={isAdding}
                        >
                          {isAdding ? (
                            <span className="spinner-border spinner-border-sm" />
                          ) : (
                            <>
                              <FaUserPlus size={11} className="me-1" />
                              Thêm
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="modal-footer border-0 px-4 pb-4">
            <button className="btn btn-light" onClick={onClose}>
              <FaTimes className="me-1" /> Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ====================== MAIN COMPONENT ======================
const ContractMember = () => {
  const { id: contractId } = useParams();
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [representativeId, setRepresentativeId] = useState(null);
  const [contractCode, setContractCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  // ====================== FETCH ======================
  const fetchMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const contract = await apiContract.getContractById(contractId);
      setContractCode(formatContractCode(contract.contractId));
      setRepresentativeId(contract.representativeId ?? null);

      const memberIds = await apiContract.getMembers(contractId);
      const ids = Array.isArray(memberIds) ? memberIds : [];

      if (ids.length === 0) {
        setMembers([]);
        return;
      }

      const results = await Promise.allSettled(
        ids.map((pid) => apiProfile.getProfileById(pid)),
      );
      const profiles = results
        .filter((r) => r.status === "fulfilled")
        .map((r) => r.value);

      setMembers(profiles);
    } catch (err) {
      console.error("Lỗi tải thành viên:", err);
      setError("Không thể tải danh sách thành viên.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [contractId]);

  // ====================== HANDLERS ======================
  const handleMemberAdded = (profile) => {
    const pid = profile.profileId ?? profile.id;
    setMembers((prev) => {
      if (prev.find((m) => (m.profileId ?? m.id) === pid)) return prev;
      return [...prev, profile];
    });
  };

  const handleRemove = async (profile) => {
    const pid = profile.profileId ?? profile.id;
    if (
      !window.confirm(
        `Bạn có chắc muốn xóa "${profile.fullName}" khỏi hợp đồng?`,
      )
    )
      return;

    setRemovingId(pid);
    try {
      await apiContract.removeMember(contractId, pid);
      setMembers((prev) => prev.filter((m) => (m.profileId ?? m.id) !== pid));
    } catch (err) {
      const msg = err.response?.data?.message || "Không thể xóa thành viên!";
      alert(msg);
    } finally {
      setRemovingId(null);
    }
  };

  const existingIds = members.map((m) => m.profileId ?? m.id);

  // ====================== RENDER ======================
  return (
    <div className="container-fluid py-4">
      {/* Header — same layout as ListContract */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <button
            className="btn btn-light border-0 shadow-sm"
            onClick={() => navigate(`/contracts/${contractId}/detail`)}
          >
            <FaArrowLeft />
          </button>
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <FaFileContract className="text-secondary fs-5" />
              <h4 className="fw-bold text-dark mb-0">{contractCode}</h4>
            </div>
            <p className="text-muted small mb-0">Quản lý thành viên hợp đồng</p>
          </div>
        </div>

        <button
          className="btn btn-primary shadow-sm"
          onClick={() => setShowAddModal(true)}
        >
          <FaUserPlus className="me-2" /> Thêm thành viên
        </button>
      </div>

      {/* Main card — same card style as ListContract */}
      <div className="card border-0 shadow-sm rounded-3">
        {/* Card header — stats bar */}
        <div className="card-header bg-white py-3 border-0 d-flex align-items-center gap-3">
          <div className="d-flex align-items-center gap-2">
            <FaUsers className="text-secondary" />
            <span className="fw-semibold text-dark">Danh sách thành viên</span>
            <span className="badge bg-light text-dark border fw-normal ms-1">
              {members.length} thành viên
            </span>
          </div>
        </div>

        {/* Table body */}
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="text-muted small text-uppercase">
                <th className="ps-4 py-3">Họ và tên</th>
                <th>Số điện thoại</th>
                <th>CCCD</th>
                <th>Email</th>
                <th>Địa chỉ</th>
                <th className="text-center">Vai trò</th>
                <th className="text-end pe-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    <div className="spinner-border spinner-border-sm text-primary me-2" />
                    Đang tải...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-danger">
                    {error}
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    <FaUsers className="fs-3 mb-2 opacity-25 d-block mx-auto" />
                    Chưa có thành viên nào.{" "}
                    <button
                      className="btn btn-link btn-sm p-0 text-primary"
                      onClick={() => setShowAddModal(true)}
                    >
                      Thêm ngay
                    </button>
                  </td>
                </tr>
              ) : (
                members.map((profile) => {
                  const pid = profile.profileId ?? profile.id;
                  const isRep = pid === representativeId;
                  const isRemoving = removingId === pid;

                  return (
                    <tr key={pid}>
                      {/* Tên */}
                      <td className="ps-4">
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ${
                              isRep
                                ? "bg-success text-white"
                                : "bg-light border text-muted"
                            }`}
                            style={{ width: 34, height: 34 }}
                          >
                            <FaUser size={13} />
                          </div>
                          <span className="fw-semibold text-dark small">
                            {profile.fullName ?? "N/A"}
                          </span>
                        </div>
                      </td>

                      {/* SĐT */}
                      <td className="small text-muted">
                        {profile.phone ? (
                          <span>
                            <FaPhone size={11} className="me-1" />
                            {profile.phone}
                          </span>
                        ) : (
                          "N/A"
                        )}
                      </td>

                      {/* CCCD */}
                      <td className="small text-muted">
                        {profile.identityNumber ?? "N/A"}
                      </td>

                      {/* Email */}
                      <td className="small text-muted">
                        <span
                          className="text-truncate d-inline-block"
                          style={{ maxWidth: 160 }}
                        >
                          {profile.email ?? "N/A"}
                        </span>
                      </td>

                      {/* Địa chỉ */}
                      <td className="small text-muted">
                        <span
                          className="text-truncate d-inline-block"
                          style={{ maxWidth: 160 }}
                        >
                          {profile.address ?? "N/A"}
                        </span>
                      </td>

                      {/* Vai trò */}
                      <td className="text-center">
                        {isRep ? (
                          <span className="badge rounded-pill bg-success-subtle text-success">
                            Đại diện
                          </span>
                        ) : (
                          <span className="badge rounded-pill bg-light text-muted border">
                            Thành viên
                          </span>
                        )}
                      </td>

                      {/* Thao tác */}
                      <td className="text-end pe-4">
                        <div className="d-flex justify-content-end gap-1">
                          <button
                            className="btn btn-sm btn-light border-0"
                            title="Xem hồ sơ"
                            onClick={() => navigate(`/profile/${pid}/detail`)}
                          >
                            <FaEye className="text-info" />
                          </button>
                          <button
                            className="btn btn-sm btn-light border-0"
                            title="Xóa khỏi hợp đồng"
                            onClick={() => handleRemove(profile)}
                            disabled={isRemoving}
                          >
                            {isRemoving ? (
                              <span
                                className="spinner-border spinner-border-sm text-danger"
                                style={{ width: 12, height: 12 }}
                              />
                            ) : (
                              <FaTrash className="text-danger" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Card footer */}
        <div className="card-footer bg-white py-3 border-0">
          <small className="text-muted">
            Tổng: {members.length} thành viên
          </small>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <AddMemberModal
          contractId={contractId}
          existingIds={existingIds}
          onAdded={handleMemberAdded}
          onClose={() => setShowAddModal(false)}
        />
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin-icon { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};

export default ContractMember;
