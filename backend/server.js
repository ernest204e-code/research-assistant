import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { config } from "dotenv";
import { summarizeText } from "./summarizer.js";
import { buildReport } from "./reportTemplate.js";

config();
const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const OPENALEX_BASE = process.env.OPENALEX_BASE || "https://api.openalex.org";
const SEMANTIC_BASE = process.env.SEMANTIC_BASE || "https://api.semanticscholar.org/graph/v1";

function invertAbstract(inv) {
  const positions = [];
  for (const [word, idxs] of Object.entries(inv)) {
    for (const i of idxs) positions[i] = word;
  }
  return positions.join(" ");
}

async function searchOpenAlex(query, perPage = 10) {
  const url = `${OPENALEX_BASE}/works?search=${encodeURIComponent(query)}&per-page=${perPage}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`OpenAlex error: ${r.status}`);
  const j = await r.json();
  return (j.results || []).map(w => ({
    id: w.id,
    doi: w.doi,
    title: w.title,
    url: w.primary_location?.source?.homepage_url || w.primary_location?.landing_page_url || w.doi || w.id,
    year: w.publication_year,
    venue: w.primary_location?.source?.display_name,
    authors: (w.authorships || []).map(a => a.author?.display_name).filter(Boolean),
    abstract: w.abstract_inverted_index ? invertAbstract(w.abstract_inverted_index) : "",
    citations: w.cited_by_count
  }));
}

async function fetchSemantic(item) {
  try {
    if (item.doi) {
      const u = `${SEMANTIC_BASE}/paper/DOI:${encodeURIComponent(item.doi)}?fields=title,abstract,citationCount,url`;
      const r = await fetch(u);
      if (r.ok) return await r.json();
    }
    if (item.title) {
      const u = `${SEMANTIC_BASE}/paper/search?query=${encodeURIComponent(item.title)}&limit=1&fields=title,abstract,citationCount,url`;
      const r = await fetch(u);
      if (r.ok) {
        const j = await r.json();
        return j?.data?.[0];
      }
    }
  } catch {}
  return null;
}

async function enrichWithSemanticScholar(items) {
  const out = [];
  for (const it of items) {
    let e = { ...it };
    if (!it.abstract || it.citations == null || !it.url) {
      const data = await fetchSemantic(it);
      if (data) {
        e.abstract = e.abstract || data.abstract || "";
        e.citations = e.citations ?? data.citationCount;
        e.url = e.url || data.url || "";
      }
    }
    out.push(e);
  }
  return out;
}

app.get("/api/health", (_, res) => res.json({ ok: true }));

app.post("/api/search", async (req, res) => {
  try {
    const { query, limit = 10 } = req.body || {};
    if (!query) return res.status(400).json({ error: "Missing query" });
    const base = await searchOpenAlex(query, Math.min(limit, 20));
    const items = await enrichWithSemanticScholar(base);
    res.json({ query, items });
  } catch (e) {
    res.status(500).json({ error: "Search failed", details: e.message });
  }
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message, context = "" } = req.body || {};
    if (!message) return res.status(400).json({ error: "Missing message" });
    const combined = `${context}\n\n${message}`.slice(0, 10000);
    const reply = summarizeText(combined, 5);
    res.json({ reply, mode: "local-extractive" });
  } catch (e) {
    res.status(500).json({ error: "Chat failed", details: e.message });
  }
});

app.post("/api/report", async (req, res) => {
  try {
    const { query, items = [], notes = "" } = req.body || {};
    const html = buildReport({ query, items, notes });
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  } catch (e) {
    res.status(500).send("<p>Failed to generate report.</p>");
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`API listening on :${port}`));
