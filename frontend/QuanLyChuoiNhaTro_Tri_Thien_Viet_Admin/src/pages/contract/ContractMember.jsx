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
  const [adding, setAdding] = useState(null); // profileId đang được thêm
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
      onAdded(profile); // callback cập nhật danh sách ngay
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
        <div className="modal-content border-0 shadow-lg rounded-4">
          <div className="modal-header border-0 pb-0 px-4 pt-4">
            <h5 className="modal-title fw-bold">
              <FaUserPlus className="me-2 text-success" />
              Thêm thành viên
            </h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>

          <div className="modal-body px-4 pt-3">
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
                <p className="small">Không tìm thấy kết quả phù hợp.</p>
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
                      {/* Avatar */}
                      <div
                        className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ${
                          alreadyAdded
                            ? "bg-success text-white"
                            : "bg-white border text-muted"
                        }`}
                        style={{ width: 44, height: 44 }}
                      >
                        {alreadyAdded ? (
                          <FaCheck size={14} />
                        ) : (
                          <FaUser size={14} />
                        )}
                      </div>

                      {/* Info */}
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

                      {/* Action */}
                      {alreadyAdded ? (
                        <span className="badge bg-success text-white small">
                          Đã thêm
                        </span>
                      ) : (
                        <button
                          className="btn btn-sm btn-success shadow-sm"
                          onClick={() => handleAdd(profile)}
                          disabled={isAdding}
                        >
                          {isAdding ? (
                            <span className="spinner-border spinner-border-sm" />
                          ) : (
                            <>
                              <FaUserPlus size={12} className="me-1" /> Thêm
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
            <button className="btn btn-light fw-semibold" onClick={onClose}>
              <FaTimes className="me-1" /> Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ====================== MEMBER CARD ======================
const MemberCard = ({
  profile,
  isRepresentative,
  onRemove,
  onViewDetail,
  removing,
}) => (
  <div
    className={`card border-0 rounded-4 shadow-sm overflow-hidden h-100 ${
      isRepresentative ? "border border-success border-opacity-50" : ""
    }`}
  >
    {/* Top accent bar */}
    <div
      className={`${isRepresentative ? "bg-success" : "bg-light"}`}
      style={{ height: 4 }}
    />

    <div className="card-body p-4">
      {/* Avatar + name */}
      <div className="d-flex align-items-center gap-3 mb-3">
        <div
          className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ${
            isRepresentative
              ? "bg-success text-white"
              : "bg-light border text-muted"
          }`}
          style={{ width: 52, height: 52 }}
        >
          <FaUser size={20} />
        </div>
        <div className="flex-grow-1 min-width-0">
          <div className="fw-bold text-dark text-truncate">
            {profile.fullName ?? "N/A"}
          </div>
          {isRepresentative && (
            <span
              className="badge bg-success text-white mt-1"
              style={{ fontSize: "0.65rem" }}
            >
              Người đại diện
            </span>
          )}
        </div>

        {/* Status dot */}
        <div title={profile.isActive ? "Đang hoạt động" : "Không hoạt động"}>
          {profile.isActive ? (
            <FaCheckCircle className="text-success" size={16} />
          ) : (
            <FaTimesCircle className="text-secondary" size={16} />
          )}
        </div>
      </div>

      {/* Info rows */}
      <div className="d-flex flex-column gap-2 mb-3">
        {profile.phone && (
          <div className="d-flex align-items-center gap-2 small text-muted">
            <FaPhone size={12} className="flex-shrink-0" />
            <span>{profile.phone}</span>
          </div>
        )}
        {profile.email && (
          <div className="d-flex align-items-center gap-2 small text-muted">
            <FaEnvelope size={12} className="flex-shrink-0" />
            <span className="text-truncate">{profile.email}</span>
          </div>
        )}
        {profile.identityNumber && (
          <div className="d-flex align-items-center gap-2 small text-muted">
            <FaIdCard size={12} className="flex-shrink-0" />
            <span>{profile.identityNumber}</span>
          </div>
        )}
        {profile.address && (
          <div className="d-flex align-items-center gap-2 small text-muted">
            <FaMapMarkerAlt size={12} className="flex-shrink-0" />
            <span className="text-truncate">{profile.address}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="d-flex gap-2 mt-auto">
        <button
          className="btn btn-sm btn-outline-primary flex-grow-1"
          onClick={onViewDetail}
        >
          Xem hồ sơ
        </button>
        <button
          className="btn btn-sm btn-outline-danger"
          onClick={onRemove}
          disabled={removing}
          title="Xóa khỏi hợp đồng"
        >
          {removing ? (
            <span className="spinner-border spinner-border-sm" />
          ) : (
            <FaTrash size={12} />
          )}
        </button>
      </div>
    </div>
  </div>
);

// ====================== MAIN COMPONENT ======================
const ContractMember = () => {
  const { id: contractId } = useParams();
  const navigate = useNavigate();

  const [members, setMembers] = useState([]); // array of ProfileDTO
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
      // Lấy contract info để hiển thị mã HĐ
      const contract = await apiContract.getContractById(contractId);
      setContractCode(formatContractCode(contract.contractId));

      // getMembers trả về List<Long> (profileId)
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
  // Thêm thành viên: cập nhật local ngay không cần refetch
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

  // ====================== EXISTING IDS (cho modal) ======================
  const existingIds = members.map((m) => m.profileId ?? m.id);

  // ====================== RENDER ======================
  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
        <div className="d-flex align-items-center gap-3">
          <button
            className="btn btn-light border-0 shadow-sm rounded-3"
            onClick={() => navigate(`/contracts/${contractId}/detail`)}
          >
            <FaArrowLeft />
          </button>
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <FaFileContract className="text-primary fs-5" />
              <h4 className="fw-bold text-dark mb-0">{contractCode}</h4>
            </div>
            <p className="text-muted small mb-0">
              <FaUsers className="me-1" />
              Quản lý thành viên hợp đồng
            </p>
          </div>
        </div>

        <button
          className="btn btn-success shadow-sm"
          onClick={() => setShowAddModal(true)}
        >
          <FaUserPlus className="me-2" /> Thêm thành viên
        </button>
      </div>

      {/* Stats bar */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="bg-success-subtle rounded-3 p-3 text-success">
            <FaUsers size={20} />
          </div>
          <div>
            <div className="fw-bold fs-4 text-dark lh-1">{members.length}</div>
            <div className="small text-muted mt-1">
              Thành viên trong hợp đồng
            </div>
          </div>
          {members.length > 0 && (
            <div className="ms-auto text-end">
              <div className="small text-muted">Người đại diện</div>
              <div className="fw-semibold text-dark small">
                {members[0]?.fullName ?? "N/A"}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: 300 }}
        >
          <div className="text-center text-muted">
            <div className="spinner-border text-primary mb-3" />
            <p className="small">Đang tải danh sách thành viên...</p>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger rounded-4 shadow-sm">{error}</div>
      ) : members.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center text-muted">
          <FaUsers className="fs-1 mb-3 opacity-25 mx-auto" />
          <p className="fw-semibold mb-1">Chưa có thành viên nào</p>
          <p className="small mb-3">
            Thêm thành viên vào hợp đồng để bắt đầu quản lý.
          </p>
          <div>
            <button
              className="btn btn-success shadow-sm"
              onClick={() => setShowAddModal(true)}
            >
              <FaUserPlus className="me-2" /> Thêm thành viên đầu tiên
            </button>
          </div>
        </div>
      ) : (
        <div className="row g-3">
          {members.map((profile, idx) => {
            const pid = profile.profileId ?? profile.id;
            return (
              <div key={pid} className="col-sm-6 col-lg-4 col-xl-3">
                <MemberCard
                  profile={profile}
                  isRepresentative={idx === 0}
                  removing={removingId === pid}
                  onRemove={() => handleRemove(profile)}
                  onViewDetail={() => navigate(`/profile/${pid}/detail`)}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <AddMemberModal
          contractId={contractId}
          existingIds={existingIds}
          onAdded={handleMemberAdded}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
};

export default ContractMember;
