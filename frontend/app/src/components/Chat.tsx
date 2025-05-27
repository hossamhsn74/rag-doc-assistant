import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

const Chat: React.FC = () => {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const responseRef = useRef<HTMLDivElement>(null);

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

  // Remove the effect that pushes the assistant message again after streaming ends

  return (
    <div className="chat-root">
      <div className="chat-messages" ref={responseRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-bubble chat-bubble-${msg.role}`}
            style={{ animation: "fadeIn 0.5s" }}>
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
        <button
          type="submit"
          className="chat-send-btn"
          disabled={isStreaming || !query.trim()}
          aria-label="Send"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="12" fill="#38bdf8" />
            <path d="M7 12l5-5v3h4v4h-4v3l-5-5z" fill="#fff" />
          </svg>
        </button>
      </form>
      <style>{`
        .chat-root {
          background: #f8fafc;
          border-radius: 18px;
          box-shadow: 0 4px 24px 0 rgba(0,0,0,0.08);
          padding: 2rem;
          position: relative;
          min-width: 600px;
          max-width: 600px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          height: 600px;
        }
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding-bottom: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }
        .chat-bubble {
          max-width: 80%;
          padding: 1rem 1.3rem;
          border-radius: 16px;
          font-size: 1.08rem;
          line-height: 1.6;
          box-shadow: 0 2px 12px 0 rgba(14,165,233,0.10);
          word-break: break-word;
          animation: fadeIn 0.5s;
        }
        .chat-bubble-user {
          background: linear-gradient(90deg,#38bdf8 0%,#0ea5e9 100%);
          color: #fff;
          align-self: flex-end;
          border-bottom-right-radius: 4px;
        }
        .chat-bubble-assistant {
          background: #fff;
          color: #0ea5e9;
          align-self: flex-start;
          border-bottom-left-radius: 4px;
          border: 1.5px solid #38bdf8;
        }
        .chat-bubble-streaming {
          position: relative;
        }
        .chat-stream-cursor {
          display: inline-block;
          width: 10px;
          height: 1.2em;
          background: #38bdf8;
          margin-left: 2px;
          border-radius: 2px;
          animation: blink 1s steps(2, start) infinite;
          vertical-align: middle;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .chat-input-row {
          display: flex;
          align-items: center;
          margin-top: auto;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 8px 0 rgba(56,189,248,0.08);
          padding: 0.5rem 1rem;
          position: relative;
        }
        .chat-input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 1.1rem;
          padding: 0.8rem 1rem 0.8rem 0.2rem;
          background: transparent;
          color: #0ea5e9;
        }
        .chat-input:disabled {
          background: #f1f5f9;
        }
        .chat-send-btn {
          background: none;
          border: none;
          position: absolute;
          right: 1.2rem;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          transition: opacity 0.2s;
          opacity: 1;
        }
        .chat-send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Chat;
