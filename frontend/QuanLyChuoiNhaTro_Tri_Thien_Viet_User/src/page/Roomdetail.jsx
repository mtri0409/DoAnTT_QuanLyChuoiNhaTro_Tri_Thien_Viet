import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import RoomGridCard from '../components/RoomGridCard';
import { imgURL } from '../services/userConfig';

const statusMap = {
  available: {
    label: 'Còn phòng',
    bg: '#eaf7ea',
    border: '#9fd6a4',
    text: '#287a35',
  },
  occupied: {
    label: 'Đã thuê',
    bg: '#f4e5e3',
    border: '#e7aaa3',
    text: '#9b3026',
  },
  maintenance: {
    label: 'Bảo trì',
    bg: '#fff0dc',
    border: '#efc38e',
    text: '#a95a13',
  },
  shared: {
    label: 'Ở ghép',
    bg: '#fff0dc',
    border: '#efc38e',
    text: '#a95a13',
  },
};

const fmt = (p) => (p ? Number(p).toLocaleString("vi-VN") + "đ" : "—");

const detailCss = `
  .rd-page {
    min-height: 100vh;
    background: #fffaf5;
    color: #2f241d;
    padding: 30px 24px 52px;
    font-family: "Times New Roman", Times, serif;
  }

  .rd-wrap {
    max-width: 1120px;
    margin: 0 auto;
  }

  .rd-top {
    margin-bottom: 20px;
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  .rd-back {
    width: 40px;
    height: 40px;
    border-radius: 6px;
    background: #fff;
    border: 1px solid #eadfd4;
    color: #6f5f52;
    font-family: inherit;
    font-size: 20px;
    font-weight: 700;
    cursor: pointer;
    flex-shrink: 0;
  }

  .rd-back:hover {
    background: #fff4ea;
    color: #b85618;
  }

  .rd-crumb {
    color: #8b7665;
    font-size: 14px;
    margin-bottom: 4px;
  }

  .rd-crumb strong {
    color: #b85618;
  }

  .rd-title {
    margin: 0;
    color: #2f241d;
    font-size: 30px;
    line-height: 1.25;
    font-weight: 700;
  }

  .rd-status {
    margin-left: auto;
    border-radius: 5px;
    padding: 6px 12px;
    font-size: 14px;
    font-weight: 700;
    white-space: nowrap;
    border: 1px solid;
  }

  .rd-layout {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 22px;
    align-items: start;
  }

  .rd-left,
  .rd-right {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .rd-right {
    position: sticky;
    top: 104px;
  }

  .rd-card {
    background: #fff;
    border: 1px solid #eadfd4;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 10px rgba(102,64,35,.05);
  }

  .rd-gallery-main {
    position: relative;
    height: 430px;
    border-radius: 8px;
    overflow: hidden;
    background: #f2ebe5;
    border: 1px solid #f0e4d8;
  }

  .rd-gallery-main img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .rd-image-count {
    position: absolute;
    top: 12px;
    right: 12px;
    background: rgba(47,36,29,.82);
    color: #fff;
    padding: 5px 10px;
    border-radius: 5px;
    font-size: 13px;
    font-weight: 700;
  }

  .rd-arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 36px;
    height: 36px;
    border: 1px solid #eadfd4;
    background: rgba(255,255,255,.94);
    color: #3c2d23;
    border-radius: 5px;
    font-family: inherit;
    font-size: 22px;
    font-weight: 700;
    cursor: pointer;
  }

  .rd-arrow.left {
    left: 12px;
  }

  .rd-arrow.right {
    right: 12px;
  }

  .rd-dots {
    position: absolute;
    left: 50%;
    bottom: 14px;
    transform: translateX(-50%);
    display: flex;
    gap: 5px;
  }

  .rd-dot {
    width: 8px;
    height: 8px;
    border-radius: 4px;
    background: rgba(255,255,255,.52);
    cursor: pointer;
  }

  .rd-dot.active {
    width: 22px;
    background: #fff;
  }

  .rd-thumbs {
    display: flex;
    gap: 8px;
    margin-top: 10px;
    overflow-x: auto;
    padding-bottom: 2px;
  }

  .rd-thumb {
    width: 76px;
    height: 56px;
    object-fit: cover;
    border-radius: 6px;
    flex-shrink: 0;
    cursor: pointer;
    border: 2px solid transparent;
    opacity: .58;
  }

  .rd-thumb.active {
    border-color: #df7a35;
    opacity: 1;
  }

  .rd-price-card {
    background: #fff0dc;
    border: 1px solid #f0d8bd;
  }

  .rd-price-layout {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }

  .rd-small-label {
    color: #8b7665;
    font-size: 13px;
    font-weight: 700;
    margin-bottom: 4px;
  }

  .rd-price {
    color: #d86622;
    font-size: 34px;
    line-height: 1.15;
    font-weight: 700;
  }

  .rd-price span {
    color: #6f5f52;
    font-size: 16px;
    font-weight: 500;
  }

  .rd-deposit {
    background: #fff;
    border: 1px solid #eadfd4;
    border-radius: 8px;
    padding: 12px 16px;
    min-width: 136px;
  }

  .rd-deposit-value {
    color: #a95a13;
    font-size: 21px;
    font-weight: 700;
  }

  .rd-stat-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(138px, 1fr));
    gap: 10px;
  }

  .rd-stat {
    background: #fff;
    border: 1px solid #eadfd4;
    border-radius: 8px;
    padding: 14px;
    box-shadow: 0 2px 10px rgba(102,64,35,.04);
  }

  .rd-stat-label {
    color: #8b7665;
    font-size: 13px;
    font-weight: 700;
    margin-bottom: 4px;
  }

  .rd-stat-value {
    color: #2f241d;
    font-size: 17px;
    font-weight: 700;
  }

  .rd-section-head {
    display: flex;
    align-items: center;
    gap: 10px;
    padding-bottom: 12px;
    margin-bottom: 14px;
    border-bottom: 1px solid #f0e4d8;
  }

  .rd-section-title {
    color: #2f241d;
    font-size: 20px;
    font-weight: 700;
  }

  .rd-section-count {
    margin-left: auto;
    background: #fff0dc;
    border: 1px solid #f0d8bd;
    color: #b85618;
    border-radius: 5px;
    padding: 3px 8px;
    font-size: 14px;
    font-weight: 700;
  }

  .rd-desc {
    margin: 0;
    color: #6f5f52;
    font-size: 17px;
    line-height: 1.65;
    white-space: pre-line;
  }

  .rd-amenities {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 9px;
  }

  .rd-amenity {
    background: #fff8f0;
    border: 1px solid #f0e4d8;
    border-radius: 6px;
    padding: 9px 11px;
    color: #6f5f52;
    font-size: 15px;
    font-weight: 600;
  }

  .rd-contact {
    background: #fff0dc;
    border: 1px solid #f0d8bd;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 10px rgba(102,64,35,.05);
  }

  .rd-contact-title {
    color: #2f241d;
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 4px;
  }

  .rd-contact-sub {
    color: #8b7665;
    font-size: 15px;
    margin-bottom: 18px;
  }

  .rd-contact-label {
    color: #8b7665;
    font-size: 13px;
    font-weight: 700;
    margin-bottom: 7px;
  }

  .rd-phone-row {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 8px;
    background: #fff;
    border: 1px solid #eadfd4;
    border-radius: 6px;
    padding: 10px;
    align-items: center;
    margin-bottom: 14px;
  }

  .rd-phone-row a {
    color: #2f241d;
    text-decoration: none;
    font-size: 19px;
    font-weight: 700;
  }

  .rd-copy {
    border: 1px solid #eadfd4;
    background: #fff8f0;
    color: #6f5f52;
    border-radius: 5px;
    padding: 6px 10px;
    font-family: inherit;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
  }

  .rd-copy.done {
    background: #eaf7ea;
    color: #287a35;
    border-color: #9fd6a4;
  }

  .rd-action {
    width: 100%;
    border: 0;
    border-radius: 6px;
    background: #df7a35;
    color: #fff;
    padding: 11px 14px;
    font-family: inherit;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    text-align: center;
    text-decoration: none;
    display: block;
    box-sizing: border-box;
  }

  .rd-action:hover {
    background: #c96523;
  }

  .rd-action.secondary {
    background: #fff;
    color: #b85618;
    border: 1px solid #f0d8bd;
  }

  .rd-action.secondary:hover {
    background: #fff4ea;
  }

  .rd-summary-row {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 9px 0;
    border-bottom: 1px solid #f0e4d8;
    font-size: 15px;
  }

  .rd-summary-row:last-child {
    border-bottom: 0;
  }

  .rd-summary-row span:first-child {
    color: #8b7665;
  }

  .rd-summary-row span:last-child {
    color: #2f241d;
    font-weight: 700;
    text-align: right;
  }

  .rd-summary-row.highlight span:last-child {
    color: #d86622;
  }

  .rd-note {
    background: #fff8f0;
    border: 1px solid #f0e4d8;
    border-radius: 8px;
    padding: 18px;
  }

  .rd-note-title {
    color: #2f241d;
    font-size: 17px;
    font-weight: 700;
    margin-bottom: 10px;
  }

  .rd-note-row {
    color: #6f5f52;
    font-size: 15px;
    padding: 5px 0;
  }

  .rd-related {
    margin-top: 42px;
    margin-bottom: 36px;
  }

  .rd-related-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 18px;
  }

  .rd-related h2 {
    margin: 0;
    color: #2f241d;
    font-size: 24px;
    font-weight: 700;
  }

  .rd-related p {
    margin: 4px 0 0;
    color: #8b7665;
    font-size: 16px;
  }

  .rd-related-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 18px;
  }

  .rd-empty-related,
  .rd-error-box {
    background: #fff;
    border: 1px solid #eadfd4;
    border-radius: 8px;
    padding: 36px 20px;
    text-align: center;
    color: #6f5f52;
    box-shadow: 0 2px 10px rgba(102,64,35,.05);
  }

  .rd-error-box h2 {
    margin: 0 0 8px;
    color: #2f241d;
    font-size: 28px;
  }

  .rd-skeleton {
    background: linear-gradient(90deg,#f8f1ea 25%,#efe3d8 50%,#f8f1ea 75%);
    background-size: 200% 100%;
    animation: rd-shimmer 1.4s infinite;
    border-radius: 8px;
    border: 1px solid #eadfd4;
  }

  .rd-modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(47,36,29,.45);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  .rd-modal {
    background: #fff;
    border: 1px solid #eadfd4;
    border-radius: 8px;
    width: 100%;
    max-width: 480px;
    box-shadow: 0 22px 56px rgba(47,36,29,.22);
    overflow: hidden;
    animation: rd-pop .18s ease-out;
  }

  .rd-modal-head {
    background: #fff0dc;
    border-bottom: 1px solid #f0d8bd;
    padding: 20px 22px;
    display: flex;
    justify-content: space-between;
    gap: 16px;
  }

  .rd-modal-title {
    color: #2f241d;
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 3px;
  }

  .rd-modal-sub {
    color: #6f5f52;
    font-size: 15px;
  }

  .rd-modal-close {
    border: 1px solid #eadfd4;
    background: #fff;
    color: #6f5f52;
    border-radius: 5px;
    width: 30px;
    height: 30px;
    font-family: inherit;
    font-size: 18px;
    font-weight: 700;
    cursor: pointer;
    flex-shrink: 0;
  }

  .rd-modal-body {
    padding: 22px;
  }

  .rd-form {
    display: flex;
    flex-direction: column;
    gap: 13px;
  }

  .rd-form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .rd-label {
    display: block;
    color: #6f5f52;
    font-size: 14px;
    font-weight: 700;
    margin-bottom: 5px;
  }

  .rd-input {
    width: 100%;
    box-sizing: border-box;
    background: #fff;
    border: 1.5px solid #eadfd4;
    border-radius: 6px;
    padding: 10px 12px;
    color: #2f241d;
    font-family: inherit;
    font-size: 16px;
    outline: none;
  }

  .rd-input:focus {
    border-color: #df7a35;
    box-shadow: 0 0 0 3px rgba(223,122,53,.12);
  }

  .rd-error {
    background: #f4e5e3;
    border: 1px solid #e7aaa3;
    color: #9b3026;
    border-radius: 6px;
    padding: 10px 12px;
    font-size: 15px;
    font-weight: 700;
  }

  .rd-modal-actions {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 10px;
    margin-top: 4px;
  }

  .rd-cancel {
    border: 1px solid #eadfd4;
    background: #fff;
    color: #6f5f52;
    border-radius: 6px;
    padding: 11px 0;
    font-family: inherit;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
  }

  .rd-submit {
    border: 0;
    background: #df7a35;
    color: #fff;
    border-radius: 6px;
    padding: 11px 0;
    font-family: inherit;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
  }

  .rd-submit:disabled {
    opacity: .62;
    cursor: not-allowed;
  }

  .rd-success {
    text-align: center;
    padding: 18px 0;
  }

  .rd-success-title {
    color: #287a35;
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 8px;
  }

  .rd-success-text {
    color: #6f5f52;
    font-size: 16px;
    line-height: 1.55;
    margin-bottom: 20px;
  }

  .rd-spinner {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255,255,255,.45);
    border-top-color: #fff;
    border-radius: 50%;
    animation: rd-spin .7s linear infinite;
    margin-right: 7px;
    vertical-align: -2px;
  }

  @keyframes rd-shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  @keyframes rd-spin {
    to { transform: rotate(360deg); }
  }

  @keyframes rd-pop {
    from { opacity: 0; transform: translateY(10px) scale(.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  @media (max-width: 980px) {
    .rd-layout {
      grid-template-columns: 1fr;
    }

    .rd-right {
      position: static;
    }

    .rd-gallery-main {
      height: 390px;
    }
  }

  @media (max-width: 640px) {
    .rd-page {
      padding: 22px 14px 42px;
    }

    .rd-top {
      flex-wrap: wrap;
    }

    .rd-status {
      margin-left: 52px;
    }

    .rd-title {
      font-size: 26px;
    }

    .rd-gallery-main {
      height: 300px;
    }

    .rd-card {
      padding: 15px;
    }

    .rd-price {
      font-size: 29px;
    }

    .rd-form-grid,
    .rd-modal-actions {
      grid-template-columns: 1fr;
    }

    .rd-related-head {
      flex-direction: column;
    }
  }
`;

function DetailStyles() {
  return <style>{detailCss}</style>;
}

function InquiryModal({ roomName, onClose }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.phone.trim()) {
      setError('Vui lòng nhập họ tên và số điện thoại.');
      return;
    }

    const content = [
      `Họ tên   : ${form.name.trim()}`,
      `SĐT      : ${form.phone.trim()}`,
      form.email.trim() ? `Email    : ${form.email.trim()}` : null,
      `Nội dung : ${form.message.trim() || '(Không có nội dung thêm)'}`,
    ].filter(Boolean).join('\n');

    const payload = {
      title: `Khách hàng hỏi về phòng ${roomName || 'phòng'}`,
      content,
      type: 'GENERAL',
    };

    try {
      setSending(true);
      await userService.createManualNotification(0, 0, payload);
      setDone(true);
    } catch (err) {
      setError('Gửi thất bại, vui lòng thử lại sau.');
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const overlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="rd-modal-overlay" onClick={overlayClick}>
      <div className="rd-modal" onClick={e => e.stopPropagation()}>
        <div className="rd-modal-head">
          <div>
            <div className="rd-modal-title">Hỏi thông tin phòng</div>
            <div className="rd-modal-sub">
              {roomName ? `Phòng ${roomName}` : 'Để lại thông tin, chúng tôi sẽ liên hệ lại'}
            </div>
          </div>
          <button type="button" onClick={onClose} className="rd-modal-close">×</button>
        </div>

        <div className="rd-modal-body">
          {done ? (
            <div className="rd-success">
              <div className="rd-success-title">Gửi thành công</div>
              <div className="rd-success-text">
                Chúng tôi đã nhận được yêu cầu của bạn. Quản lý sẽ liên hệ lại sớm nhất có thể.
              </div>
              <button type="button" onClick={onClose} className="rd-submit" style={{ padding: '11px 28px' }}>
                Đóng
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="rd-form">
              <div className="rd-form-grid">
                <div>
                  <label className="rd-label">Họ tên *</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Nguyễn Văn A"
                    className="rd-input"
                  />
                </div>

                <div>
                  <label className="rd-label">Số điện thoại *</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="0912 345 678"
                    type="tel"
                    className="rd-input"
                  />
                </div>
              </div>

              <div>
                <label className="rd-label">Email, tùy chọn</label>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                  type="email"
                  className="rd-input"
                />
              </div>

              <div>
                <label className="rd-label">Nội dung, tùy chọn</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Bạn muốn hỏi gì về phòng này?"
                  className="rd-input"
                  style={{ resize: 'vertical', minHeight: 82, lineHeight: 1.55 }}
                />
              </div>

              {error && <div className="rd-error">{error}</div>}

              <div className="rd-modal-actions">
                <button type="button" onClick={onClose} className="rd-cancel">
                  Hủy
                </button>
                <button type="submit" disabled={sending} className="rd-submit">
                  {sending ? <><span className="rd-spinner" />Đang gửi...</> : 'Gửi yêu cầu'}
                </button>
              </div>

              <div style={{ textAlign: 'center', color: '#9a8776', fontSize: 13 }}>
                Thông tin của bạn chỉ dùng để liên hệ tư vấn.
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RoomDetail() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [copied, setCopied] = useState(false);

  const [relatedRooms, setRelatedRooms] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  const [allFloors, setAllFloors] = useState([]);
  const [allBranches, setAllBranches] = useState([]);

  const [branchName, setBranchName] = useState('');
  const [floorNumber, setFloorNumber] = useState('');
  const [managerPhone, setManagerPhone] = useState('0385018194');

  const [showInquiry, setShowInquiry] = useState(false);

  const abortRef = useRef(false);

  useEffect(() => {
    if (!roomId) {
      setLoading(false);
      return;
    }

    abortRef.current = false;

    const fetchRoom = async () => {
      try {
        setLoading(true);

        const res = await userService.getRoomById(roomId);
        if (abortRef.current) return;

        const raw = res.data || res;
        let data = null;

        if (raw?.roomId) data = raw;
        else if (raw?.data?.roomId) data = raw.data;
        else if (raw?.result?.roomId) data = raw.result;
        else data = raw;

        if (!data?.roomId) {
          setError("Dữ liệu phòng không hợp lệ.");
          setRoom(null);
        } else {
          setRoom(data);
          setError(null);
          setActiveImg(0);
        }
      } catch {
        if (!abortRef.current) {
          setError("Không thể tải thông tin phòng.");
          setRoom(null);
        }
      } finally {
        if (!abortRef.current) setLoading(false);
      }
    };

    fetchRoom();
    return () => {
      abortRef.current = true;
    };
  }, [roomId]);

  useEffect(() => {
    if (!room?.floorId) return;

    let cancelled = false;

    const fetchRelatedByBranch = async () => {
      try {
        setLoadingRelated(true);

        const [floorRes, branchRes] = await Promise.all([
          userService.getAllFloors(),
          userService.getAllBranches(1, 200),
        ]);

        if (cancelled) return;

        const floorRaw = floorRes.data || floorRes;
        const floors = Array.isArray(floorRaw)
          ? floorRaw
          : floorRaw?.content || floorRaw?.data || [];

        const branchRaw = branchRes.data || branchRes;
        const branches = branchRaw?.content ?? branchRaw?.data ?? (Array.isArray(branchRaw) ? branchRaw : []);

        setAllFloors(floors);
        setAllBranches(branches);

        const currentFloor = floors.find(f =>
          String(f.floorId ?? f.id) === String(room.floorId),
        );

        if (!currentFloor) {
          setFloorNumber('');
          setRelatedRooms([]);
          return;
        }

        setFloorNumber(currentFloor.floorNumber ?? '');

        const targetBranchId = currentFloor.branchId ?? currentFloor.branch?.branchId;

        if (targetBranchId == null) {
          console.log("Không tìm thấy floor hoặc branchId");
          setRelatedRooms([]);
          return;
        }
        const foundBranch = branches.find(
          b => String(b.branchId ?? b.id) === String(targetBranchId),
        );

        const resolvedBranchName =
          foundBranch?.branchName ??
          currentFloor.branchName ??
          currentFloor.branch?.branchName ??
          `Chi nhánh #${targetBranchId}`;

        setBranchName(resolvedBranchName);

        if (foundBranch?.managerId) {
          try {
            const profileRes = await userService.getProfileById(foundBranch.managerId);
            const profileData = profileRes.data || profileRes;
            const phone = profileData?.phone ?? profileData?.result?.phone;
            if (phone) setManagerPhone(phone);
          } catch (err) {
            console.error('Không lấy được thông tin Profile quản lý:', err);
          }
        }

        const floorIdsInSameBranch = floors
          .filter(f => String(f.branchId ?? f.branch?.branchId) === String(targetBranchId))
          .map(f => f.floorId ?? f.id);

        const roomRes = await userService.getAllRooms(0, 50);
        if (cancelled) return;

        const roomRaw = roomRes.data || roomRes;
        const rooms = roomRaw?.content ?? roomRaw?.data?.content ??
          (Array.isArray(roomRaw) ? roomRaw : []);

        const related = rooms.filter(r =>
          r.roomId !== room.roomId &&
          floorIdsInSameBranch.some(fid => String(fid) === String(r.floorId)),
        );

        console.log("=== Related Rooms ===", related);

        setRelatedRooms(related.slice(0, 3));
      } catch (err) {
        console.error('Fetch meta error:', err);
        if (!cancelled) {
          setBranchName('');
          setRelatedRooms([]);
          setAllFloors([]);
          setAllBranches([]);
        }
      } finally {
        if (!cancelled) setLoadingRelated(false);
      }
    };


    fetchRelatedByBranch();


    return () => {
      cancelled = true;
    };
  }, [room?.floorId, room?.roomId]);

  const normalizeImageUrl = (url) => {
    if (!url || url.includes('storage.troapp.vn')) return null;

    if (url.startsWith('/images')) return `${imgURL}${url}`;

    return url.startsWith('http') ? url : `${imgURL}${url}`;
  };

  const getImages = () => {
    const media = room?.roomMedia;

    if (!media || media.length === 0) {
      return [`${imgURL}/images/default.jpg`];
    }

    const urls = media
      .filter(m => {
        if (!m.mediaType) return true;

        const type = m.mediaType.toLowerCase();
        return type === 'image' || type.startsWith('image/');
      })
      .map(m => normalizeImageUrl(m.url ?? m.mediaUrl))
      .filter(Boolean);

    return urls.length ? urls : [`${imgURL}/images/default.jpg`];
  };


  const copyPhone = () => {
    if (!managerPhone) return;

    navigator.clipboard.writeText(managerPhone.replace(/\s/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="rd-page">
        <DetailStyles />
        <div className="rd-wrap">
          <div className="rd-skeleton" style={{ height: 50, width: 220, marginBottom: 20 }} />
          <div className="rd-layout">
            <div className="rd-left">
              <div className="rd-skeleton" style={{ height: 430 }} />
              <div className="rd-skeleton" style={{ height: 120 }} />
            </div>
            <div className="rd-right">
              <div className="rd-skeleton" style={{ height: 300 }} />
              <div className="rd-skeleton" style={{ height: 190 }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rd-page">
        <DetailStyles />
        <div className="rd-wrap">
          <div className="rd-error-box" style={{ marginTop: 70 }}>
            <h2>Không tìm thấy phòng</h2>
            <p style={{ margin: '0 0 22px', fontSize: 16 }}>{error}</p>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rd-action"
              style={{ width: 'auto', display: 'inline-block', padding: '10px 24px' }}
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!room) return null;

  const images = getImages();

  const statusKey = (room.Status ?? room.status ?? '').toLowerCase();
  const statusInfo = statusMap[statusKey] ?? null;

  const maxPeople = room.maxPeople ?? room.maxOccupants ?? null;
  const currentPeople = room.currentPeople ?? room.currentOccupants ?? null;
  const roomArea = room.area ?? room.roomArea ?? null;
  const roomPrice = room.price ?? room.roomPrice ?? null;
  const roomDeposit = room.depositAmount ?? room.deposit ?? null;
  const roomDesc = room.description ?? '';
  const roomName = room.roomName ?? room.name ?? roomId;
  const amenities = room.amenities ?? [];

  return (
    <div className="rd-page">
      <DetailStyles />

      {showInquiry && (
        <InquiryModal
          roomName={roomName}
          onClose={() => setShowInquiry(false)}
        />
      )}

      <div className="rd-wrap">
        <div className="rd-top">
          <button type="button" onClick={() => navigate(-1)} className="rd-back">
            ‹
          </button>

          <div>
            <div className="rd-crumb">
              {branchName && <><strong>{branchName}</strong> / </>}
              {floorNumber && <>Tầng {floorNumber} / </>}
              <span>Chi tiết phòng</span>
            </div>
            <h1 className="rd-title">Phòng {roomName}</h1>
          </div>

          {statusInfo && (
            <span
              className="rd-status"
              style={{
                background: statusInfo.bg,
                color: statusInfo.text,
                borderColor: statusInfo.border,
              }}
            >
              {statusInfo.label}
            </span>
          )}
        </div>

        <div className="rd-layout">
          <div className="rd-left">
            <div className="rd-card">
              <div className="rd-gallery-main">
                <img
                  key={images[activeImg]}
                  src={images[activeImg]}
                  alt={`Phòng ${roomName}`}
                  onError={e => {
                    e.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80';
                  }}
                />

                <div className="rd-image-count">
                  {activeImg + 1}/{images.length}
                </div>

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)}
                      className="rd-arrow left"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveImg(i => (i + 1) % images.length)}
                      className="rd-arrow right"
                    >
                      ›
                    </button>
                  </>
                )}

                {images.length > 1 && (
                  <div className="rd-dots">
                    {images.map((_, i) => (
                      <div
                        key={i}
                        onClick={() => setActiveImg(i)}
                        className={`rd-dot ${i === activeImg ? 'active' : ''}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className="rd-thumbs">
                  {images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`Ảnh phòng ${i + 1}`}
                      onClick={() => setActiveImg(i)}
                      onError={e => {
                        e.target.src = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=200&q=60';
                      }}
                      className={`rd-thumb ${i === activeImg ? 'active' : ''}`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="rd-card rd-price-card">
              <div className="rd-price-layout">
                <div>
                  <div className="rd-small-label">Giá thuê hàng tháng</div>
                  <div className="rd-price">
                    {fmt(roomPrice)}
                    <span> / tháng</span>
                  </div>
                </div>

                {roomDeposit && (
                  <div className="rd-deposit">
                    <div className="rd-small-label">Tiền cọc</div>
                    <div className="rd-deposit-value">{fmt(roomDeposit)}</div>
                    <div style={{ color: '#8b7665', fontSize: 13, marginTop: 2 }}>
                      Hoàn lại khi hết hợp đồng
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="rd-stat-grid">
              {branchName && <StatCard label="Chi nhánh" value={branchName} />}
              {floorNumber && <StatCard label="Tầng" value={`Tầng ${floorNumber}`} />}
              {roomArea && <StatCard label="Diện tích" value={`${roomArea} m²`} />}
              {maxPeople != null && <StatCard label="Tối đa" value={`${maxPeople} người`} />}
              {currentPeople != null && <StatCard label="Hiện tại" value={`${currentPeople} người`} />}
            </div>

            {roomDesc && (
              <div className="rd-card">
                <div className="rd-section-head">
                  <span className="rd-section-title">Mô tả</span>
                </div>
                <p className="rd-desc">{roomDesc}</p>
              </div>
            )}

            {amenities.length > 0 && (
              <div className="rd-card">
                <div className="rd-section-head">
                  <span className="rd-section-title">Tiện ích phòng</span>
                  <span className="rd-section-count">{amenities.length} tiện ích</span>
                </div>

                <div className="rd-amenities">
                  {amenities.map((a) => (
                    <div key={a.amenityId ?? a.amenityName} className="rd-amenity">
                      {a.amenityName}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="rd-right">
            <div className="rd-contact">
              <div className="rd-contact-title">Liên hệ đặt phòng</div>
              <div className="rd-contact-sub">Phản hồi nhanh trong ngày</div>

              <div className="rd-contact-label">Số điện thoại quản lý</div>
              <div className="rd-phone-row">
                <a href={`tel:${managerPhone.replace(/\s/g, '')}`}>
                  {managerPhone}
                </a>
                <button
                  type="button"
                  onClick={copyPhone}
                  className={`rd-copy ${copied ? 'done' : ''}`}
                >
                  {copied ? 'Đã copy' : 'Copy'}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <a
                  href={`https://zalo.me/${managerPhone.replace(/\s/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rd-action"
                >
                  Chat Zalo ngay
                </a>

                <button
                  type="button"
                  onClick={() => setShowInquiry(true)}
                  className="rd-action secondary"
                >
                  Hỏi thông tin phòng
                </button>
              </div>

              <div style={{ marginTop: 13, color: '#8b7665', fontSize: 13, textAlign: 'center' }}>
                Hỗ trợ 7:00 - 22:00, Thứ 2 - Chủ nhật
              </div>
            </div>

            <div className="rd-card">
              <div className="rd-section-head">
                <span className="rd-section-title">Tóm tắt</span>
              </div>

              <div>
                {roomName && <SummaryRow label="Tên phòng" value={roomName} />}
                {branchName && <SummaryRow label="Chi nhánh" value={branchName} />}
                {floorNumber && <SummaryRow label="Tầng" value={`Tầng ${floorNumber}`} />}
                {roomArea && <SummaryRow label="Diện tích" value={`${roomArea} m²`} />}
                {maxPeople != null && <SummaryRow label="Tối đa" value={`${maxPeople} người`} />}
                {currentPeople != null && <SummaryRow label="Hiện tại" value={`${currentPeople} người`} />}
                <SummaryRow label="Giá thuê" value={fmt(roomPrice)} highlight />
                {roomDeposit && <SummaryRow label="Tiền cọc" value={fmt(roomDeposit)} />}
                {statusInfo && <SummaryRow label="Trạng thái" value={statusInfo.label} />}
              </div>
            </div>

            <div className="rd-note">
              <div className="rd-note-title">Thông tin hỗ trợ</div>
              {['Giá cả minh bạch', 'Hỗ trợ tư vấn hằng ngày', 'Không phí trung gian', 'Có thể đặt lịch xem phòng'].map((text) => (
                <div key={text} className="rd-note-row">{text}</div>
              ))}
            </div>
          </aside>
        </div>

        {loadingRelated && (
          <div className="rd-related">
            <div className="rd-skeleton" style={{ height: 30, width: 270, marginBottom: 18 }} />
            <div className="rd-related-grid">
              {[1, 2, 3].map(i => (
                <div key={i} className="rd-skeleton" style={{ height: 330 }} />
              ))}
            </div>
          </div>
        )}

        {/* Actual related rooms */}
        {!loadingRelated && relatedRooms.length > 0 && (
          <div className="rd-related">
            <div className="rd-related-head">
              <div>
                <h2>Phòng cùng chi nhánh</h2>
                <p>
                  {relatedRooms.length} phòng khác tại <strong style={{ color: '#b85618' }}>{branchName}</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rd-action secondary"
                style={{ width: 'auto', padding: '9px 16px' }}
              >
                Xem tất cả
              </button>
            </div>

            <div className="rd-related-grid">
              {relatedRooms.map(r => (
                <RoomGridCard
                  key={r.roomId}
                  room={r}
                  floors={allFloors}
                  branches={allBranches}
                />
              ))}
            </div>
          </div>
        )}

        {!loadingRelated && relatedRooms.length === 0 && room && (
          <div className="rd-empty-related" style={{ marginTop: 42 }}>
            <div style={{ color: '#2f241d', fontSize: 18, fontWeight: 700, marginBottom: 5 }}>
              Không có phòng nào khác cùng chi nhánh
            </div>
            <div style={{ fontSize: 15 }}>
              Hãy xem thêm các phòng ở chi nhánh khác.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rd-stat">
      <div className="rd-stat-label">{label}</div>
      <div className="rd-stat-value">{value}</div>
    </div>
  );
}

function SummaryRow({ label, value, highlight }) {
  return (
    <div className={`rd-summary-row ${highlight ? 'highlight' : ''}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
