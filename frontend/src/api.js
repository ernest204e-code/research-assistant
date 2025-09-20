const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

export async function apiSearch(query, limit = 10) {
  const r = await fetch(`${API_BASE}/api/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, limit })
  });
  if (!r.ok) throw new Error("Search failed");
  return r.json();
}

export async function apiChat(message, context = "") {
  const r = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, context })
  });
  if (!r.ok) throw new Error("Chat failed");
  return r.json();
}

export function apiReport({ query, items, notes }) {
  const url = `${API_BASE}/api/report`;
  const w = window.open("", "_blank");
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, items, notes })
  }).then(async r => {
    const html = await r.text();
    if (w) {
      w.document.open();
      w.document.write(html);
      w.document.close();
    }
  });
}
