import { useState } from "react";
import VoiceButton from "./VoiceButton.jsx";

export default function ChatBox({ contextText, onAsk }) {
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  async function send(m) {
    const content = (m ?? msg).trim();
    if (!content) return;
    setLoading(true);
    const res = await onAsk(content, contextText);
    setHistory(h => [...h, { role: "user", content }, { role: "assistant", content: res }]);
    setMsg("");
    setLoading(false);
  }

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Assistant</h3>
      <div style={{ height: 180, overflow: "auto", border: "1px solid #1f2a37", borderRadius: 8, padding: 8, background: "#0f141a" }}>
        {history.length === 0 && <small>Ask questions about the results. The assistant will summarize context.</small>}
        {history.map((m, i) => (
          <div key={i} style={{ margin: "6px 0" }}>
            <strong>{m.role === "user" ? "You:" : "Assistant:"}</strong> {m.content}
          </div>
        ))}
      </div>
      <div className="row" style={{ marginTop: 8 }}>
        <input placeholder="Ask a question…" value={msg} onChange={e => setMsg(e.target.value)} />
        <VoiceButton onText={txt => setMsg(txt)} />
        <button disabled={loading} onClick={() => send()}>{loading ? "Thinking…" : "Send"}</button>
      </div>
    </div>
  );
}
