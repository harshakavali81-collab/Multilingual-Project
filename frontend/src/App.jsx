import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000").replace(/\/$/, "");
const LANGUAGES = [
  { value: "auto", label: "Auto-detect" },
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi - हिन्दी" },
  { value: "te", label: "Telugu - తెలుగు" },
  { value: "ta", label: "Tamil - தமிழ்" },
  { value: "kn", label: "Kannada - ಕನ್ನಡ" },
];

async function apiRequest(path, options = {}) {
  let response;
  try {
    const headers = new Headers(options.headers || {});
    const apiKey = window.sessionStorage.getItem("kb-api-key");
    if (apiKey) headers.set("X-API-Key", apiKey);
    response = await fetch(API_BASE + path, { ...options, headers });
  } catch {
    throw new Error("Could not connect to the API at " + API_BASE + ". Start the backend and check VITE_API_BASE_URL.");
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = typeof data.detail === "string" ? data.detail : "The request could not be completed.";
    throw new Error(detail);
  }
  return data;
}

function formatDate(value) {
  if (!value) return "Just now";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toLocaleString();
}

function App() {
  const [question, setQuestion] = useState("");
  const [language, setLanguage] = useState("auto");
  const [answer, setAnswer] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ document_count: 0, question_count: 0, language_counts: {} });
  const [status, setStatus] = useState("checking");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [articleTitle, setArticleTitle] = useState("");
  const [articleCategory, setArticleCategory] = useState("General");
  const [articleContent, setArticleContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [apiKey, setApiKey] = useState(() => window.sessionStorage.getItem("kb-api-key") || "");
  const [analytics, setAnalytics] = useState({ daily: [], language_counts: {}, category_counts: {}, answer_modes: {} });
  const displayedDocuments = useMemo(() => documents.filter((doc) => {
    const term = searchText.trim().toLocaleLowerCase();
    return !term || [doc.title, doc.content, doc.language, doc.category].some((value) => (value || "").toLocaleLowerCase().includes(term));
  }), [documents, searchText]);

  const languageGraph = useMemo(() => {
    const entries = Object.entries(analytics.language_counts || {}).sort((a, b) => b[1] - a[1]);
    const high = Math.max(1, ...entries.map((entry) => entry[1]));
    return entries.map(([name, count]) => ({ name, count, width: 100 * count / high }));
  }, [analytics.language_counts]);

  const dailyGraph = useMemo(() => {
    const entries = analytics.daily || [];
    const high = Math.max(1, ...entries.map((entry) => entry.questions));
    return entries.map((entry) => ({ ...entry, height: Math.max(3, 100 * entry.questions / high) }));
  }, [analytics.daily]);

  const languageSummary = useMemo(() => {
    const entries = Object.entries(stats.language_counts || {});
    return entries.length ? entries.map(([name, count]) => name + ": " + count).join(" · ") : "No documents yet";
  }, [stats.language_counts]);

  const refreshDashboard = useCallback(async () => {
    try {
      const [documentData, historyData, statsData, healthData, analyticsData] = await Promise.all([
        apiRequest("/articles"), apiRequest("/history?limit=100"), apiRequest("/stats"), apiRequest("/health"), apiRequest("/analytics?days=14"),
      ]);
      setDocuments(documentData);
      setHistory(historyData);
      setStats(statsData);
      setAnalytics(analyticsData);
      setStatus(healthData.status === "operational" ? "online" : "offline");
      setError("");
    } catch (requestError) {
      setStatus("offline");
      setError(requestError.message || "Unable to load the knowledge base.");
    }
  }, []);

  useEffect(() => {
    // This async request synchronizes initial UI state with the external API.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshDashboard();
  }, [refreshDashboard]);

  const askQuestion = async (event) => {
    event.preventDefault();
    const cleanQuestion = question.trim();
    if (!cleanQuestion || busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await apiRequest("/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: cleanQuestion, preferred_language: language, top_k: 3 }),
      });
      setAnswer({ ...result, question: cleanQuestion });
      if (result.notice) setNotice(result.notice);
      setQuestion("");
      await refreshDashboard();
    } catch (requestError) {
      setError(requestError.message || "The question could not be answered.");
    } finally {
      setBusy(false);
    }
  };

  const uploadArticle = async (event) => {
    event.preventDefault();
    if (!articleTitle.trim() || !articleContent.trim() || busy) return;
    const formData = new FormData();
    formData.append("title", articleTitle.trim());
    formData.append("content", articleContent.trim());
    formData.append("category", articleCategory.trim() || "General");
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await apiRequest("/upload", { method: "POST", body: formData });
      setNotice(result.title + " was saved and indexed (" + result.detected_language + ").");
      setArticleTitle("");
      setArticleContent("");
      await refreshDashboard();
    } catch (requestError) {
      setError(requestError.message || "Could not save the article.");
    } finally {
      setBusy(false);
    }
  };

  const uploadFile = async (event) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    if (!selectedFile || busy) return;
    const formData = new FormData();
    formData.append("file", selectedFile);
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await apiRequest("/upload-file", { method: "POST", body: formData });
      setNotice(result.title + " uploaded and indexed (" + result.detected_language + ").");
      setSelectedFile(null);
      formElement.reset();
      await refreshDashboard();
    } catch (requestError) {
      setError(requestError.message || "Could not upload the file.");
    } finally {
      setBusy(false);
    }
  };

  const deleteDocument = async (documentId) => {
    setError("");
    setNotice("");
    try {
      await apiRequest("/documents/" + documentId, { method: "DELETE" });
      setNotice("Document deleted.");
      if (answer?.sources?.some((source) => source.id === documentId)) setAnswer(null);
      await refreshDashboard();
    } catch (requestError) {
      setError(requestError.message || "Could not delete the document.");
    }
  };

  const clearHistory = async () => {
    try {
      await apiRequest("/history", { method: "DELETE" });
      setHistory([]);
      setAnswer(null);
      setNotice("Chat history cleared.");
      setError("");
      await refreshDashboard();
    } catch (requestError) {
      setError(requestError.message || "Could not clear chat history.");
    }
  };

  const exportHistory = () => {
    const content = JSON.stringify(history, null, 2);
    const url = URL.createObjectURL(new Blob([content], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "multilingual-kb-chat-history.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="Bhasha Knowledge Hub home">
          <span className="brand-mark" aria-hidden="true">भ</span>
          <span><strong>Bhasha</strong><small>Knowledge Hub</small></span>
        </a>
        <div className="api-key-control">
          <label htmlFor="private-key">Private API key (optional)</label>
          <input id="private-key" type="password" autoComplete="off" value={apiKey}
            onChange={(event) => {
              setApiKey(event.target.value);
              if (event.target.value) window.sessionStorage.setItem("kb-api-key", event.target.value);
              else window.sessionStorage.removeItem("kb-api-key");
            }} placeholder="Only if protected" />
          <button type="button" onClick={() => { void refreshDashboard(); }}>Connect</button>
        </div>
        <div className={"connection-state " + status} role="status">
          <span className="status-dot" />
          {status === "online" ? "API connected" : status === "checking" ? "Connecting…" : "API offline"}
        </div>
      </header>

      <section className="hero" id="home">
        <div className="hero-copy">
          <p className="eyebrow">MULTILINGUAL KNOWLEDGE, ONE PLACE</p>
          <h1>Ask in your language.<br /><span>Find answers with context.</span></h1>
          <p className="hero-description">Upload your documents and explore information in English, Hindi, Telugu, Tamil, or Kannada. Answers include the source documents used.</p>
          <div className="language-chips" aria-label="Supported languages">
            <span>English</span><span>हिन्दी</span><span>తెలుగు</span><span>தமிழ்</span><span>ಕನ್ನಡ</span>
          </div>
        </div>
        <div className="hero-illustration" aria-hidden="true">
          <div className="orbit orbit-one" /><div className="orbit orbit-two" />
          <div className="globe">अ</div><span className="float-card card-a">Aa</span><span className="float-card card-b">అ</span><span className="float-card card-c">文</span>
        </div>
      </section>

      {error && <div className="message-banner error-banner" role="alert"><span>!</span><div><strong>Something needs attention</strong><p>{error}</p></div></div>}
      {notice && <div className="message-banner success-banner" role="status"><span>✓</span><p>{notice}</p><button type="button" className="icon-button" onClick={() => setNotice("")} aria-label="Dismiss notice">×</button></div>}

      <section className="metrics-grid" aria-label="Knowledge base statistics">
        <article className="metric-card"><span className="metric-icon violet">▤</span><div><p>Documents</p><strong>{stats.document_count ?? documents.length}</strong></div></article>
        <article className="metric-card"><span className="metric-icon blue">✧</span><div><p>Questions asked</p><strong>{stats.question_count ?? history.length}</strong></div></article>
        <article className="metric-card language-metric"><span className="metric-icon amber">文</span><div><p>Document languages</p><strong className="metric-language-text">{languageSummary}</strong></div></article>
      </section>

      <section className="panel analytics-panel" aria-labelledby="insights-heading">
        <div className="panel-heading"><span className="panel-icon blue">▥</span><div>
          <h2 id="insights-heading">Knowledge analytics</h2><p>Live counts from the database · last 14 days</p>
        </div></div>
        <div className="analytics-grid">
          <div className="analytics-chart">
            <h3>Documents by language</h3>
            {!languageGraph.length ? <p className="chart-empty">Upload documents to populate this graph.</p> :
              <div className="language-bars" role="img" aria-label={languageGraph.map((item) => item.name + ": " + item.count).join(", ")}>
                {languageGraph.map((item) => <div key={item.name} className="bar-line">
                  <span>{item.name}</span><div className="bar-track"><div className="bar-fill" style={{ width: item.width + "%" }} /></div><strong>{item.count}</strong>
                </div>)}
              </div>}
          </div>
          <div className="analytics-chart">
            <h3>Questions per day</h3>
            <div className="daily-bars" role="img" aria-label={(analytics.daily || []).map((item) => item.date + ": " + item.questions).join(", ")}>
              {dailyGraph.map((item) => <div className="daily-bar-column" key={item.date} title={item.date + ": " + item.questions + " questions"}>
                <div className="daily-bar-fill" style={{ height: item.height + "%" }} />
                <span>{item.date.slice(5)}</span>
              </div>)}
            </div>
            <p className="chart-footnote">Based on saved question history, including questions without matching documents.</p>
          </div>
          <div className="analytics-chart">
            <h3>Document categories</h3>
            {Object.keys(analytics.category_counts || {}).length === 0 ? <p className="chart-empty">No categories yet.</p> :
              <div className="category-chips">{Object.entries(analytics.category_counts).map(([name, count]) =>
                <span key={name}>{name} <strong>{count}</strong></span>)}</div>}
            <h3 className="sub-chart-heading">Answer modes</h3>
            <div className="category-chips">{Object.entries(analytics.answer_modes || {}).map(([name, count]) =>
              <span key={name}>{name} <strong>{count}</strong></span>)}</div>
          </div>
        </div>
      </section>

      <section className="workspace-grid">
        <div className="panel ask-panel">
          <div className="panel-heading"><span className="panel-icon violet">✧</span><div><h2>Ask the knowledge base</h2><p>Get a grounded answer from your uploaded content.</p></div></div>
          <form onSubmit={askQuestion} className="ask-form">
            <label htmlFor="question">Your question</label>
            <textarea id="question" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="e.g. What are the main benefits of solar energy?" rows={4} maxLength={4000} required />
            <div className="ask-controls">
              <label className="language-select-label" htmlFor="answer-language">Answer language
                <select id="answer-language" value={language} onChange={(event) => setLanguage(event.target.value)}>
                  {LANGUAGES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </label>
              <button type="submit" className="primary-button" disabled={busy || !question.trim() || status !== "online"}>{busy ? <><span className="spinner" /> Working…</> : <>Ask question <span aria-hidden="true">↗</span></>}</button>
            </div>
          </form>
          {answer && <div className="answer-card" aria-live="polite">
            <div className="answer-title-row"><h3>Answer</h3><span className={"mode-pill " + (answer.answer_mode === "groq-llm" ? "generated" : "local")}>{answer.answer_mode === "groq-llm" ? "AI-generated" : answer.answer_mode === "no-relevant-context" ? "No matching context" : answer.answer_mode === "empty-knowledge-base" ? "Empty knowledge base" : "Extractive answer"}</span></div>
            <p className="answer-question">{answer.question}</p><p className="answer-text">{answer.answer}</p>
            {answer.sources?.length > 0 && <div className="source-list"><h4>Sources used</h4>{answer.sources.map((source) => <a key={source.id} href={"#document-" + source.id} className="source-item"><span className="source-file-icon">▤</span><span><strong>{source.title}</strong><small>{source.language}{source.category ? " · " + source.category : ""}</small></span><span aria-hidden="true">↗</span></a>)}</div>}
            {answer.notice && <p className="answer-notice">{answer.notice}</p>}
          </div>}
          <p className="privacy-note"><span aria-hidden="true">ⓘ</span> Answers are grounded in matching documents. Verify important information against the original source.</p>
        </div>

        <div className="side-panels">
          <section className="panel upload-panel">
            <div className="panel-heading"><span className="panel-icon blue">↑</span><div><h2>Add a document</h2><p>Paste text or upload a file to index.</p></div></div>
            <form className="upload-form" onSubmit={uploadArticle}>
              <label htmlFor="article-title">Document title</label><input id="article-title" value={articleTitle} onChange={(event) => setArticleTitle(event.target.value)} placeholder="e.g. Solar energy overview" maxLength={255} required />
              <label htmlFor="article-category">Category</label><input id="article-category" value={articleCategory} onChange={(event) => setArticleCategory(event.target.value)} placeholder="General" maxLength={100} />
              <label htmlFor="article-content">Document content</label><textarea id="article-content" value={articleContent} onChange={(event) => setArticleContent(event.target.value)} placeholder="Paste your article or notes here…" rows={4} required />
              <button className="secondary-button full-width" type="submit" disabled={busy || status !== "online"}>Save text document <span aria-hidden="true">＋</span></button>
            </form>
            <div className="upload-divider"><span>OR UPLOAD A FILE</span></div>
            <form className="file-form" onSubmit={uploadFile}>
              <label className="file-picker" htmlFor="file-upload"><span className="file-picker-icon">↑</span><span><strong>{selectedFile?.name || "Choose a file"}</strong><small>PDF, DOCX, CSV, TXT or Markdown · max 10 MiB</small></span></label>
              <input id="file-upload" type="file" accept=".pdf,.docx,.csv,.txt,.md,application/pdf,text/plain,text/markdown,text/csv,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(event) => setSelectedFile(event.target.files?.[0] || null)} />
              <button className="primary-button full-width" type="submit" disabled={busy || !selectedFile || status !== "online"}>Upload and index</button>
            </form>
          </section>

          <section className="panel documents-panel">
            <div className="panel-heading panel-heading-compact"><span className="panel-icon amber">▤</span><div><h2>Library</h2><p>{documents.length} stored document{documents.length === 1 ? "" : "s"}</p></div></div>
            <label className="library-filter-label" htmlFor="library-filter">Search documents</label>
            <input id="library-filter" type="search" value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="Filter by title, content, language…" className="library-filter" />
            {documents.length === 0 ? <div className="empty-state"><span>▤</span><strong>Your library is ready</strong><p>Add your first document to get started.</p></div> : displayedDocuments.length === 0 ? <p className="chart-empty">No documents match your filter.</p> : <div className="document-list">{displayedDocuments.map((document) => <article className="document-item" id={"document-" + document.id} key={document.id}><span className="document-icon">▤</span><div className="document-info"><strong>{document.title}</strong><small>{document.language} · {document.category || "General"}</small><p>{(document.content || "").slice(0, 110)}{(document.content || "").length > 110 ? "…" : ""}</p></div><button className="delete-button" type="button" onClick={() => deleteDocument(document.id)} aria-label={"Delete " + document.title} title="Delete document">×</button></article>)}</div>}
          </section>
        </div>
      </section>

      <section className="panel history-panel">
        <div className="history-heading"><div className="panel-heading"><span className="panel-icon violet">◷</span><div><h2>Recent conversations</h2><p>Questions and answers are stored by the backend.</p></div></div><div className="history-actions"><button type="button" className="secondary-button" onClick={exportHistory} disabled={!history.length}>Export JSON ↓</button><button type="button" className="text-button" onClick={clearHistory} disabled={!history.length}>Clear history</button></div></div>
        {!history.length ? <div className="empty-history"><span>◷</span><p>Your recent questions will appear here.</p></div> : <div className="history-list">{history.map((item) => <article className="history-item" key={item.id}><div className="history-meta"><span>{item.language || "English"}</span><time>{formatDate(item.created_at)}</time></div><h3>{item.question}</h3><p>{item.answer}</p>{item.sources?.length > 0 && <small className="history-sources">Sources: {item.sources.map((source) => source.title).join(", ")}</small>}</article>)}</div>}
      </section>

      <footer className="footer"><a className="footer-brand" href="#home">Bhasha Knowledge Hub</a><p>Multilingual Indian Language Knowledge Base Platform · Built with React, FastAPI and SQLAlchemy</p><a href={API_BASE + "/docs"} target="_blank" rel="noreferrer">API documentation ↗</a></footer>
    </main>
  );
}

export default App;
