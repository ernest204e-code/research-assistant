export default function ResultsList({ items = [], onAddToContext }) {
  if (!items.length) return <div className="card"><small>No results yet. Try a search.</small></div>;

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Results</h3>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {items.map((it, idx) => (
          <li key={idx} style={{ padding: "10px 0", borderTop: idx ? "1px solid #1f2a37" : "none" }}>
            <div style={{ fontWeight: 700 }}>{it.title || "Untitled"}</div>
            <div><small>{(it.authors || []).join(", ")} {it.year ? `• ${it.year}` : ""} {it.venue ? `• ${it.venue}` : ""}</small></div>
            {it.abstract && <div style={{ marginTop: 6 }}>{it.abstract.slice(0, 300)}{it.abstract.length > 300 ? "..." : ""}</div>}
            <div style={{ marginTop: 6 }}>
              {it.url && <a href={it.url} target="_blank" rel="noreferrer">Open</a>} •{" "}
              <button onClick={() => onAddToContext(it)}>Add to context</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
