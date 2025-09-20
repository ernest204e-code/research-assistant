import { useState } from "react";

export default function SearchBar({ onSearch }) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!q.trim()) return;
    setLoading(true);
    await onSearch(q.trim());
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="row" style={{ marginBottom: 12 }}>
      <input
        placeholder="Search research topic (e.g., 'LLMs for education')"
        value={q}
        onChange={e => setQ(e.target.value)}
      />
      <button disabled={loading}>{loading ? "Searching..." : "Search"}</button>
    </form>
  );
}
