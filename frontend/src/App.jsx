import { useMemo, useState } from "react";
import "./styles.css";
import SearchBar from "./components/SearchBar.jsx";
import ResultsList from "./components/ResultsList.jsx";
import ChatBox from "./components/ChatBox.jsx";
import { apiSearch, apiChat, apiReport } from "./api.js";

export default function App() {
  const [items, setItems] = useState([]);
  const [contextPapers, setContextPapers] = useState([]);
  const [query, setQuery] = useState("");

  const contextText = useMemo(() => {
    return contextPapers.map(p =>
      `Title: ${p.title}\nAuthors: ${(p.authors || []).join(", ")}\nAbstract: ${p.abstract || ""}`
    ).join("\n\n");
  }, [contextPapers]);

  async function doSearch(q) {
    setQuery(q);
    const { items } = await apiSearch(q, 10);
    setItems(items);
  }

  async function ask(message, context) {
    const { reply } = await apiChat(message, context);
    return reply;
  }

  function addToContext(p) {
    setContextPapers(prev => prev.find(x => x.id === p.id) ? prev : [...prev, p]);
  }

  function generateReport() {
    apiReport({ query, items: contextPapers.length ? contextPapers : items, notes: "" });
  }

  return (
    <div className="container">
      <h2 style={{ marginTop: 0 }}>Research Assistant</h2>
      <div className="card" style={{ marginBottom: 12 }}>
        <SearchBar onSearch={doSearch} />
        <small>Tip: Add relevant papers to context, then ask the assistant to summarize or compare.</small>
      </div>
      <div className="row" style={{ alignItems: "flex-start" }}>
        <div style={{ flex: 2 }}>
          <ResultsList items={items} onAddToContext={addToContext} />
        </div>
        <div style={{ flex: 1 }}>
          <ChatBox contextText={contextText} onAsk={ask} />
          <div className="card" style={{ marginTop: 12 }}>
            <h3 style={{ marginTop: 0 }}>Report</h3>
            <small>Compiles selected papers into a formatted HTML report.</small><br/>
            <button onClick={generateReport} style={{ marginTop: 8 }}>Generate report</button>
          </div>
        </div>
      </div>
    </div>
  );
}
