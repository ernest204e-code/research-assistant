export function buildReport({ query, items, notes, timestamp = new Date().toISOString() }) {
  const rows = items.map((it, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td><strong>${escapeHtml(it.title || "Untitled")}</strong><br/>
        <em>${escapeHtml(it.authors?.join(", ") || "Unknown authors")}</em><br/>
        ${it.year || ""} • ${escapeHtml(it.venue || "")}<br/>
        <a href="${it.url}" target="_blank" rel="noopener">Link</a>
      </td>
      <td>${escapeHtml(it.abstract || "").slice(0, 800)}</td>
      <td>${it.citations ?? ""}</td>
    </tr>
  `).join("");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Research Report - ${escapeHtml(query)}</title>
  <style>
    body { font-family: system-ui, Arial, sans-serif; margin: 24px; }
    h1 { margin-bottom: 4px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; vertical-align: top; }
    th { background: #f8f8f8; }
    .meta { color: #666; margin-bottom: 16px; }
  </style>
</head>
<body>
  <h1>Research Report</h1>
  <div class="meta">Query: <strong>${escapeHtml(query)}</strong> • Generated: ${new Date(timestamp).toLocaleString()}</div>
  ${notes ? `<p><strong>Notes:</strong> ${escapeHtml(notes)}</p>` : ""}
  <table>
    <thead>
      <tr>
        <th>#</th><th>Paper</th><th>Abstract</th><th>Citations</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`;
}

function escapeHtml(s = "") {
  return s.replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
}
