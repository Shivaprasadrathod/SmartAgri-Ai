import { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Sprout,
  Droplets,
  CloudSun,
  Bug,
  Sparkles,
  Languages,
  TrendingUp,
  RefreshCw,
  CheckCircle2
} from "lucide-react";
import { api } from "../services/api";

export default function AIAssistant() {
  const [message, setMessage] = useState("");
  const [language, setLanguage] = useState("en"); // "en" or "kn"
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      type: "ai",
      text: "Hello Farmer! 👋 I am your SmartAgri AI Advisor. You can ask me about today's market rates, whether to sell or hold your harvest, fertilizer schedules, or disease management in English or Kannada (ಕನ್ನಡ)."
    }
  ]);

  const suggestions = [
    { label: "What is today's tomato market price?", crop: "Tomato" },
    { label: "Should I sell my onions today or wait?", crop: "Onion" },
    { label: "Which fertilizer is best for wheat?", crop: "Wheat" },
    { label: "How to prevent early blight in tomato?", crop: "Tomato" },
    { label: "ಇಂದಿನ ಟೊಮೆಟೊ ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ಎಷ್ಟು?", lang: "kn", crop: "Tomato" },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend = message) => {
    const query = (textToSend || "").trim();
    if (!query) return;

    // Detect if Kannada is typed or chosen
    const isKannada = /[\u0C80-\u0CFF]/.test(query) || language === "kn";
    const currentLang = isKannada ? "kn" : "en";

    // Append user message
    const userMsg = { type: "user", text: query };
    setMessages((prev) => [...prev, userMsg]);
    setMessage("");
    setLoading(true);

    try {
      const res = await api.chatAssistant(query, null, null, currentLang);
      const aiMsg = {
        type: "ai",
        text: res.reply || "Sorry, I could not process your query at this moment.",
        sources: res.sources_used || []
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          type: "ai",
          text: "I am having trouble connecting to the advisory server. Please check that the backend is running.",
          isError: true,
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell" style={{ padding: "1.5rem", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Hero Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #15803d 0%, #166534 100%)",
          color: "#fff",
          padding: "1.75rem",
          borderRadius: "16px",
          marginBottom: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem"
        }}
      >
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.2)", padding: "4px 10px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "700", marginBottom: "0.5rem" }}>
            <Sparkles size={14} /> AI Agri-Scientist & Mandi Oracle
          </div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: "800", margin: "0 0 0.5rem 0" }}>
            SmartAgri AI Agricultural Assistant
          </h1>
          <p style={{ margin: 0, opacity: 0.9, fontSize: "0.95rem" }}>
            Context-aware responses powered by verified APMC prices, agronomic guidelines, and bilingual support.
          </p>
        </div>

        {/* Language Toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(0,0,0,0.2)", padding: "6px 12px", borderRadius: "10px" }}>
          <Languages size={18} />
          <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>Language:</span>
          <button
            onClick={() => setLanguage("en")}
            style={{
              background: language === "en" ? "#fff" : "transparent",
              color: language === "en" ? "#166534" : "#fff",
              border: "none",
              padding: "4px 10px",
              borderRadius: "6px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            English
          </button>
          <button
            onClick={() => setLanguage("kn")}
            style={{
              background: language === "kn" ? "#fff" : "transparent",
              color: language === "kn" ? "#166534" : "#fff",
              border: "none",
              padding: "4px 10px",
              borderRadius: "6px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            ಕನ್ನಡ (Kannada)
          </button>
        </div>
      </div>

      {/* Main Chat Box */}
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          border: "1px solid #e5e7eb",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
          display: "flex",
          flexDirection: "column",
          height: "620px",
        }}
      >
        {/* Messages Stream */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
          {messages.map((m, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                gap: "12px",
                marginBottom: "1.25rem",
                justifyContent: m.type === "user" ? "flex-end" : "flex-start",
              }}
            >
              {m.type === "ai" && (
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "#dcfce7",
                    color: "#166534",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Bot size={20} />
                </div>
              )}

              <div
                style={{
                  maxWidth: "80%",
                  padding: "1rem 1.25rem",
                  borderRadius: "16px",
                  background: m.type === "user" ? "#166534" : "#f8fafc",
                  color: m.type === "user" ? "#fff" : "#1f2937",
                  border: m.type === "user" ? "none" : "1px solid #e2e8f0",
                  whiteSpace: "pre-line",
                  lineHeight: "1.6",
                  fontSize: "0.95rem",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                }}
              >
                {m.text}

                {m.sources && m.sources.length > 0 && (
                  <div style={{ marginTop: "0.75rem", paddingTop: "0.5rem", borderTop: "1px solid #e2e8f0", fontSize: "0.75rem", color: "#64748b" }}>
                    <strong>Sources verified:</strong> {m.sources.join(" • ")}
                  </div>
                )}
              </div>

              {m.type === "user" && (
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "#f3f4f6",
                    color: "#4b5563",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <User size={20} />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", gap: "12px", alignItems: "center", color: "#166534" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Bot size={20} />
              </div>
              <div style={{ fontStyle: "italic", fontSize: "0.9rem" }}>
                SmartAgri AI is consulting market feeds & crop guidelines...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Pills */}
        <div style={{ padding: "0.5rem 1rem", borderTop: "1px solid #f3f4f6", display: "flex", gap: "8px", overflowX: "auto" }}>
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(s.label)}
              style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                color: "#166534",
                padding: "6px 12px",
                borderRadius: "20px",
                fontSize: "0.8rem",
                fontWeight: "600",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div style={{ padding: "1rem 1.25rem", borderTop: "1px solid #e5e7eb", background: "#fbfcfd" }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{ display: "flex", gap: "10px" }}
          >
            <input
              type="text"
              placeholder={language === "kn" ? "ನಿಮ್ಮ ಕೃಷಿ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ..." : "Ask about crop rates, fertilizers, diseases, or sell decisions..."}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
              style={{
                flex: 1,
                padding: "0.85rem 1.25rem",
                borderRadius: "12px",
                border: "1px solid #d1d5db",
                fontSize: "0.95rem",
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={loading || !message.trim()}
              style={{
                background: "#166534",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                padding: "0 1.5rem",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: loading || !message.trim() ? "not-allowed" : "pointer",
                opacity: loading || !message.trim() ? 0.6 : 1,
              }}
            >
              <Send size={18} />
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
