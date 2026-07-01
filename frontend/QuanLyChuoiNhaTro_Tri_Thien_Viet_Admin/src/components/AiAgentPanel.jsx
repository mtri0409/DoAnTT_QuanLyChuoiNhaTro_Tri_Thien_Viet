import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import _XLSX from "xlsx-js-style";
const XLSX = _XLSX.default || _XLSX;
import { socketURL } from "../api/config";

/**
 * Component AI Agent Side Panel (Bootstrap 5)
 * - Hiển thị panel chat AI cố định bên phải màn hình.
 * - Kết nối WebSocket STOMP tới Java Backend (/ws).
 * - Nhận tin nhắn từ người dùng, gửi qua WebSocket, hiển thị phản hồi Markdown từ AI.
 *
 * Props:
 *  - isOpen: boolean -> Trạng thái mở/đóng panel
 *  - onClose: () => void -> Callback khi đóng panel
 */
const formatTimestamp = (timestamp) => {
  try {
    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    }).format(new Date(timestamp));
  } catch {
    return "";
  }
};

const formatAgentMessage = (content = "") => {
  if (!content) return "";

  return content
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const MarkdownTable = ({ children }) => {
  const tableRef = useRef(null);
  const handleExport = () => {
    if (!tableRef.current) return;
    try {
      const ws = XLSX.utils.table_to_sheet(tableRef.current);

      const headerStyle = {
        font: { name: 'Arial', sz: 11, bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '2563EB' } },
        alignment: { vertical: 'center', horizontal: 'center', wrapText: true },
        border: {
          top: { style: 'thin', color: { rgb: 'CCCCCC' } },
          bottom: { style: 'thin', color: { rgb: 'CCCCCC' } },
          left: { style: 'thin', color: { rgb: 'CCCCCC' } },
          right: { style: 'thin', color: { rgb: 'CCCCCC' } }
        }
      };

      const bodyStyle = {
        font: { name: 'Arial', sz: 10 },
        alignment: { vertical: 'center', horizontal: 'left' },
        border: {
          top: { style: 'thin', color: { rgb: 'E5E7EB' } },
          bottom: { style: 'thin', color: { rgb: 'E5E7EB' } },
          left: { style: 'thin', color: { rgb: 'E5E7EB' } },
          right: { style: 'thin', color: { rgb: 'E5E7EB' } }
        }
      };

      if (ws['!ref']) {
        const range = XLSX.utils.decode_range(ws['!ref']);
        const colWidths = [];
        for (let C = range.s.c; C <= range.e.c; ++C) colWidths[C] = 10;

        for (const key in ws) {
          if (key[0] === '!') continue;
          const cell = ws[key];
          const cellRef = XLSX.utils.decode_cell(key);

          if (cellRef.r === 0) {
            cell.s = { ...headerStyle };
          } else {
            cell.s = { ...bodyStyle };
            if (typeof cell.v === 'number') {
              cell.s.alignment = { ...bodyStyle.alignment, horizontal: 'right' };
            }
          }

          const valStr = cell.v ? String(cell.v) : '';
          if (colWidths[cellRef.c] < valStr.length + 3) {
            colWidths[cellRef.c] = valStr.length + 5;
          }
        }
        ws['!cols'] = colWidths.map(w => ({ wch: w }));
      }

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Báo cáo");
      const formattedDate = new Date().toLocaleDateString('vi-VN').replace(/\//g, '-');
      XLSX.writeFile(wb, `Bao_Cao_AI_${formattedDate}.xlsx`);
    } catch (e) {
      console.error(e);
      alert("Lỗi xuất Excel từ bảng");
    }
  };
  return (
    <div className="position-relative my-2 border rounded p-1 bg-white">
      <div className="d-flex justify-content-end mb-1">
        <button
          className="btn btn-sm btn-outline-success py-0 px-2 fw-semibold"
          style={{ fontSize: "0.68rem" }}
          onClick={handleExport}
        >
          Xuất Excel 📊
        </button>
      </div>
      <div className="overflow-auto">
        <table ref={tableRef} className="table table-sm table-bordered align-middle mb-0" style={{ fontSize: "0.78rem" }}>
          {children}
        </table>
      </div>
    </div>
  );
};

export default function AiAgentPanel({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "agent",
      content:
        "Xin chào! Tôi là trợ lý ảo phân tích tài chính của hệ thống quản lý nhà trọ. Bạn có thể hỏi như: Danh sách khách đang nợ tiền? hoặc Doanh thu tháng 6/2026 của chi nhánh ...?",
      timestamp: new Date().toISOString(),
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const stompClientRef = useRef(null);
  const bottomRef = useRef(null);

  const SOCKET_URL = socketURL;

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(SOCKET_URL),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => console.log("[STOMP]", str),
    });

    stompClientRef.current = client;

    client.onConnect = (frame) => {
      console.log("Đã kết nối tới AI WebSocket Gateway", frame);

      client.subscribe("/user/queue/agent-response", (message) => {
        const aiResponse = message.body;
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            role: "agent",
            content: aiResponse,
            timestamp: new Date().toISOString(),
          },
        ]);
        setIsLoading(false);
      });
    };

    client.onDisconnect = () => {
      console.log("Đã ngắt kết nối AI WebSocket");
    };

    client.onStompError = (frame) => {
      console.error("STOMP error:", frame.headers["message"], frame.body);
    };

    client.onWebSocketError = (event) => {
      console.error("WebSocket error:", event);
    };

    client.activate();

    return () => {
      if (client.active) {
        client.deactivate();
      }
      if (stompClientRef.current === client) {
        stompClientRef.current = null;
      }
    };
  }, [SOCKET_URL]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        role: "user",
        content: userMessage,
        timestamp: new Date().toISOString(),
      },
    ]);

    setInput("");
    setIsLoading(true);

    if (stompClientRef.current?.active) {
      stompClientRef.current.publish({
        destination: "/app/dashboard/agent",
        body: userMessage,
      });
    } else {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: "agent",
            content: "Không thể kết nối tới máy chủ AI. Vui lòng kiểm tra kết nối mạng hoặc làm mới trang.",
            timestamp: new Date().toISOString(),
          },
        ]);
        setIsLoading(false);
      }, 500);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <style>{`
        .typing-dots {
          display: flex;
          align-items: center;
          gap: 4px;
          height: 16px;
        }
        .typing-dots span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #94a3b8;
          animation: typing-blink 1.4s infinite both;
        }
        .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typing-blink {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark"
          style={{ zIndex: 1040, opacity: 0.5 }}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Panel chính */}
      <div
        className="position-fixed top-0 end-0 vh-100 bg-light text-dark d-flex flex-column shadow"
        style={{
          width: "100%",
          maxWidth: "560px",
          zIndex: 1050,
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s ease-in-out",
          borderLeft: "1px solid #e5e7eb",
        }}
        aria-label="AI Agent Side Panel"
      >
        {/* Header */}
        <header className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom bg-white">
          <div className="d-flex align-items-center gap-2">
            <div
              className="d-flex align-items-center justify-content-center rounded-circle"
              style={{ width: 32, height: 32, background: "linear-gradient(135deg, #2563eb, #38bdf8)", flexShrink: 0 }}
            >
              <span className="text-white fw-bold" style={{ fontSize: "0.75rem" }}>AI</span>
            </div>
            <div>
              <h6 className="mb-0 fw-bold text-dark" style={{ fontSize: "0.9rem" }}>Trợ lý phân tích tài chính</h6>
              <small className="text-muted" style={{ fontSize: "0.72rem" }}>AI Agent • Dữ liệu thực tế</small>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-link text-secondary text-decoration-none p-1"
            aria-label="Đóng panel"
          >
            <span className="fs-5">×</span>
          </button>
        </header>

        {/* Body chat */}
        <div className="flex-grow-1 overflow-auto px-2 py-2 d-flex flex-column gap-2" style={{ backgroundColor: "#f8fafc" }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`d-flex ${msg.role === "user" ? "justify-content-end" : "justify-content-start"}`}
            >
              {msg.role === "agent" ? (
                <div
                  style={{
                    maxWidth: "88%",
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    padding: "6px 10px",
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-1 gap-2">
                    <small className="fw-semibold text-primary" style={{ fontSize: "0.72rem" }}>AI Agent</small>
                    <small className="text-muted" style={{ fontSize: "0.68rem", whiteSpace: "nowrap" }}>
                      {formatTimestamp(msg.timestamp)}
                    </small>
                  </div>
                  <div style={{ fontSize: "0.88rem", lineHeight: 1.35, overflowWrap: "anywhere" }}>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        table: MarkdownTable,
                        thead: ({ children }) => <thead className="table-light">{children}</thead>,
                        th: ({ children }) => <th className="p-1">{children}</th>,
                        td: ({ children }) => <td className="p-1">{children}</td>,
                        strong: ({ children }) => <strong className="text-primary fw-bold" style={{ fontWeight: "bold" }}>{children}</strong>,
                        p: ({ children }) => <p className="mb-1">{children}</p>,
                        ul: ({ children }) => <ul className="mb-1 ps-3">{children}</ul>,
                        ol: ({ children }) => <ol className="mb-1 ps-3">{children}</ol>,
                      }}
                    >
                      {formatAgentMessage(msg.content)}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    maxWidth: "78%",
                    backgroundColor: "#2563eb",
                    color: "#fff",
                    borderRadius: "10px",
                    padding: "6px 10px",
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-1 gap-2">
                    <small className="text-white-50" style={{ fontSize: "0.72rem" }}>Bạn</small>
                    <small className="text-white-50" style={{ fontSize: "0.68rem", whiteSpace: "nowrap" }}>
                      {formatTimestamp(msg.timestamp)}
                    </small>
                  </div>
                  <p className="mb-0" style={{ whiteSpace: "pre-wrap", fontSize: "0.88rem", lineHeight: 1.35 }}>
                    {msg.content}
                  </p>
                </div>
              )}
            </div>
          ))}

          {/* Loading - chấm nhấp nháy */}
          {isLoading && (
            <div className="d-flex justify-content-start">
              <div
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "10px",
                  padding: "8px 12px",
                }}
              >
                <small className="fw-semibold text-primary d-block mb-1" style={{ fontSize: "0.72rem" }}>
                  AI Agent
                </small>
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Footer nhập liệu */}
        <footer className="p-2 border-top bg-white">
          <div className="d-flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập câu hỏi... (Shift + Enter để xuống dòng)"
              rows={1}
              className="form-control bg-light text-dark border-primary-subtle"
              style={{ resize: "none", minHeight: "38px", maxHeight: "100px", fontSize: "0.88rem" }}
              disabled={isLoading}
            />

            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={`btn ${input.trim() && !isLoading ? "btn-primary" : "btn-outline-secondary"} d-flex align-items-center justify-content-center`}
              style={{ minWidth: "42px" }}
              aria-label="Gửi tin nhắn"
            >
              {isLoading ? (
                <span className="spinner-border spinner-border-sm" />
              ) : (
                <span>➤</span>
              )}
            </button>
          </div>
        </footer>
      </div>
    </>
  );
}