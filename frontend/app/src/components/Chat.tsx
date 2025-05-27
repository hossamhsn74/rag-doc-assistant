import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import FileDropUploader from "./FileDropUploader";
import FileManagerModal from "./FileManagerModal";

const Chat: React.FC = () => {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const responseRef = useRef<HTMLDivElement>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [uploaderDragActive, setUploaderDragActive] = useState(false);

  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [messages, response]);

  const handleStream = () => {
    if (!query.trim()) return;
    setResponse("");
    setIsStreaming(true);
    setMessages((prev) => [...prev, { role: "user", content: query }]);

    let streamedAnswer = "";
    const eventSource = new EventSource(`http://localhost:8000/stream?query=${encodeURIComponent(query)}`);

    eventSource.onmessage = (event) => {
      streamedAnswer += " " + event.data;
      setResponse(streamedAnswer);
    };

    eventSource.onerror = () => {
      eventSource.close();
      setIsStreaming(false);
      setMessages((prev) => [...prev, { role: "assistant", content: streamedAnswer }]);
      setResponse("");
      setQuery("");
    };
  };


  return (
    <>
      {/* File Uploader Modal (single instance, styled) */}
      <div className={`chat-upload-modal-overlay${showUploader ? ' chat-upload-modal-overlay-visible' : ''}`}
        style={{ pointerEvents: showUploader ? 'auto' : 'none', opacity: showUploader ? 1 : 0, transition: 'opacity 0.25s' }}>
        <div className="chat-upload-modal">
          {showUploader && (
            <>
              <div className="chat-upload-header">
                <span className="chat-upload-title">Upload Documents</span>
                <button className="chat-upload-close-fixed" onClick={() => { setShowUploader(false); setUploaderDragActive(false); }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="12" fill="#f87171" />
                    <path d="M8 8l8 8M16 8l-8 8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <FileDropUploader
                onUploadSuccess={() => {
                  setRefreshKey(prev => prev + 1);
                  setShowUploader(false);
                  setUploaderDragActive(false);
                }}
                forceActive={uploaderDragActive}
                onDragActiveChange={setUploaderDragActive}
              />
            </>
          )}
        </div>
      </div>

      {/* File Manager Modal (wider, rich style) */}
      <FileManagerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        refreshKey={refreshKey}
        richStyle
      />

      <div className="chat-root">
        <div className="chat-messages" ref={responseRef}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-bubble chat-bubble-${msg.role}`}
            >
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          ))}
          {isStreaming && (
            <div className="chat-bubble chat-bubble-assistant chat-bubble-streaming">
              <ReactMarkdown>{response || " "}</ReactMarkdown>
              <span className="chat-stream-cursor"></span>
            </div>
          )}
        </div>
        <form
          className="chat-input-row"
          onSubmit={e => {
            e.preventDefault();
            if (!isStreaming) handleStream();
          }}
          autoComplete="off"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question..."
            className="chat-input"
            disabled={isStreaming}
          />
          <div className="chat-input-actions chat-input-actions-row">
            <button
              type="button"
              className="chat-action-btn"
              onClick={() => setModalOpen(true)}
              title="View Uploaded Files"
              tabIndex={-1}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-label="Files">
                <rect x="3" y="6" width="18" height="14" rx="3" fill="#fbbf24" />
                <path d="M3 10h18" stroke="#f59e42" strokeWidth="2" />
                <rect x="7" y="2" width="10" height="6" rx="2" fill="#fde68a" />
              </svg>
            </button>
            <button
              type="button"
              className="chat-action-btn"
              onClick={() => setShowUploader(true)}
              title="Upload Files"
              tabIndex={-1}
            >
              {/* New upload icon: upward arrow in a circle */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-label="Upload">
                <circle cx="12" cy="12" r="10" fill="#6366f1" />
                <path d="M12 16V8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                <path d="M8 12l4-4 4 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="submit"
              className="chat-send-btn"
              disabled={isStreaming || !query.trim()}
              aria-label="Send"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="12" fill="#6366f1" />
                <path d="M7 12l5-5v3h4v4h-4v3l-5-5z" fill="#fff" />
              </svg>
            </button>
          </div>
        </form>
      </div>
      {/* Custom styles for new color scheme and modal */}
      <style>{`
        .chat-root {
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          border-radius: 20px;
          box-shadow: 0 6px 32px 0 rgba(99,102,241,0.10);
        }
        .chat-bubble-user {
          background: linear-gradient(90deg,#6366f1 0%,#818cf8 100%);
          color: #fff;
        }
        .chat-bubble-assistant {
          background: #fff;
          color: #6366f1;
          border: 1.5px solid #6366f1;
        }
        .chat-bubble-streaming {
          background: #ede9fe;
        }
        .chat-input-row {
          background: #fff;
          border-radius: 14px;
          box-shadow: 0 2px 12px 0 rgba(99,102,241,0.08);
        }
        .chat-input {
          color: #6366f1;
        }
        .chat-action-btn {
          color: #6366f1;
        }
        .chat-action-btn:hover {
          background: #ede9fe;
        }
        .chat-send-btn {
          background: none;
        }
        .chat-send-btn svg circle {
          fill: #6366f1;
        }
        .chat-upload-modal {
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 8px 40px 0 rgba(99,102,241,0.13);
          min-width: 440px;
          max-width: 640px;
          padding: 2.5rem 2.5rem 2rem 2.5rem;
          position: relative;
        }
        .chat-upload-close {
          position: absolute;
          top: 18px;
          right: 18px;
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #6366f1;
          cursor: pointer;
          transition: color 0.2s;
        }
        .chat-upload-close:hover svg circle {
          fill: #a5b4fc;
        }
        .chat-upload-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(99,102,241,0.10);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .chat-upload-modal-overlay-visible {
          opacity: 1;
          pointer-events: auto;
        }
      `}</style>
    </>
  );
};

export default Chat;
