import { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'

const languages = [
  ['auto', 'Auto detect'], ['en', 'English'], ['hi', 'हिन्दी'],
  ['te', 'తెలుగు'], ['ta', 'தமிழ்'], ['kn', 'ಕನ್ನಡ'],
]

async function api(path, options = {}) {
  let response
  try {
    response = await fetch('/api' + path, options)
  } catch {
    throw new Error('Cannot reach the backend. Check that the API server is running.')
  }
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const detail = data.detail
    throw new Error(typeof detail === 'string' ? detail : 'Request failed (' + response.status + ')')
  }
  return data
}

const Flag = ({ children }) => <span className="pill">{children}</span>

function App() {
  const [tab, setTab] = useState('ask')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [question, setQuestion] = useState('')
  const [language, setLanguage] = useState('auto')
  const [busy, setBusy] = useState(false)
  const [fileBusy, setFileBusy] = useState(false)
  const [history, setHistory] = useState([])
  const [documents, setDocuments] = useState([])
  const [stats, setStats] = useState({ documents: 0, questions: 0, chunks: 0, by_language: {} })
  const [health, setHealth] = useState(null)
  const [selected, setSelected] = useState(null)
  const [docBusy, setDocBusy] = useState(false)
  const [file, setFile] = useState(null)
  const [manual, setManual] = useState({ title: '', content: '', category: 'General' })
  const fileRef = useRef(null)

  const refresh = useCallback(async () => {
    try {
      const [docs, chats, overview, engine] = await Promise.all([
        api('/articles'), api('/history'), api('/stats'), api('/health'),
      ])
      setDocuments(docs)
      setHistory(chats)
      setStats(overview)
      setHealth(engine)
      setError('')
    } catch (exc) {
      setError(exc.message)
    }
  }, [])

  useEffect(() => {
    const task = window.setTimeout(() => { void refresh() }, 0)
    return () => window.clearTimeout(task)
  }, [refresh])

  async function ask(event) {
    event.preventDefault()
    if (!question.trim() || busy) return
    setBusy(true)
    setError('')
    try {
      const result = await api('/ask', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: question.trim(), preferred_language: language }),
      })
      setQuestion('')
      setStatus(result.mode === 'extractive' ? 'Answer found in a source document.' : 'Question processed.')
      await refresh()
    } catch (exc) {
      setError(exc.message)
    } finally {
      setBusy(false)
    }
  }

  async function upload(event) {
    event.preventDefault()
    if (!file) return
    setFileBusy(true)
    setError('')
    setStatus('')
    try {
      const form = new FormData()
      form.append('file', file)
      const result = await api('/upload-file', { method: 'POST', body: form })
      setStatus(result.title + ' uploaded and indexed.')
      setFile(null)
      if (fileRef.current) fileRef.current.value = ''
      await refresh()
    } catch (exc) {
      setError(exc.message)
    } finally {
      setFileBusy(false)
    }
  }

  async function addText(event) {
    event.preventDefault()
    setDocBusy(true)
    setError('')
    try {
      await api('/upload', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(manual),
      })
      setManual({ title: '', content: '', category: 'General' })
      setStatus('Text document added.')
      await refresh()
    } catch (exc) {
      setError(exc.message)
    } finally {
      setDocBusy(false)
    }
  }

  async function inspect(id) {
    try {
      setSelected(await api('/articles/' + id))
    } catch (exc) {
      setError(exc.message)
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this document permanently?')) return
    try {
      await api('/articles/' + id, { method: 'DELETE' })
      if (selected?.id === id) setSelected(null)
      setStatus('Document deleted.')
      await refresh()
    } catch (exc) {
      setError(exc.message)
    }
  }

  async function clearHistory() {
    if (!window.confirm('Clear all stored questions and answers?')) return
    try {
      await api('/history', { method: 'DELETE' })
      setStatus('Chat history cleared.')
      await refresh()
    } catch (exc) {
      setError(exc.message)
    }
  }

  function exportHistory() {
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const element = document.createElement('a')
    element.href = url
    element.download = 'multilingual-chat-history.json'
    element.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-logo">अ</span><span>Lingua<span className="brand-accent">Base</span><small>Knowledge without borders</small></span></div>
        <nav aria-label="Main navigation">
          <button className={tab === 'ask' ? 'nav active' : 'nav'} onClick={() => setTab('ask')}>◈ <span>AI Workspace</span></button>
          <button className={tab === 'library' ? 'nav active' : 'nav'} onClick={() => setTab('library')}>▣ <span>Document Library</span><em>{stats.documents}</em></button>
          <button className={tab === 'insights' ? 'nav active' : 'nav'} onClick={() => setTab('insights')}>▤ <span>Analytics</span></button>
        </nav>
        <div className="sidebar-bottom">
          <div className="engine-status"><span className="status-dot" />{health ? 'API connected' : 'Waiting for API'}</div>
          <p>Supports English, Hindi, Telugu, Tamil & Kannada.</p>
          <a href="https://github.com/harshakavali81-collab/Multilingual-Project" target="_blank" rel="noreferrer">View GitHub repository ↗</a>
        </div>
      </aside>

      <main className="main">
        <header className="topbar"><div><span className="eyebrow">MULTILINGUAL INTELLIGENCE PLATFORM</span><h1>{tab === 'ask' ? 'Ask your knowledge.' : tab === 'library' ? 'Your documents.' : 'Knowledge insights.'}</h1><p>{tab === 'ask' ? 'Find answers across Indian languages, grounded in the content you upload.' : tab === 'library' ? 'Manage, preview and upload knowledge in one place.' : 'Explore usage and language distribution across your workspace.'}</p></div><Flag>5 languages</Flag></header>

        {error && <div className="alert error" role="alert">{error}<button onClick={() => setError('')} aria-label="Dismiss error">×</button></div>}
        {status && <div className="alert success" role="status">{status}<button onClick={() => setStatus('')} aria-label="Dismiss notification">×</button></div>}

        {tab === 'ask' && <>
          <section className="metrics" aria-label="Workspace statistics">
            <div><span>Documents indexed</span><strong>{stats.documents}</strong><small>Ready to search</small></div>
            <div><span>Questions asked</span><strong>{stats.questions}</strong><small>Saved in your history</small></div>
            <div><span>Knowledge chunks</span><strong>{stats.chunks}</strong><small>Searchable passages</small></div>
          </section>
          <section className="panel ask-panel">
            <div className="panel-heading"><div><h2>Ask a question</h2><p>Type in any supported language. Results include original citations.</p></div><span className="square-icon">✦</span></div>
            <form onSubmit={ask}>
              <label className="field-label" htmlFor="question">Your question</label>
              <textarea id="question" rows="3" placeholder="e.g. ఈ పత్రంలో ముఖ్యమైన అంశాలు ఏమిటి?" value={question} onChange={event => setQuestion(event.target.value)} maxLength="2000" />
              <div className="form-footer"><label className="language-label">Answer language <select value={language} onChange={event => setLanguage(event.target.value)}>{languages.map(([code, label]) => <option key={code} value={code}>{label}</option>)}</select></label><button className="primary" disabled={busy || !question.trim()} type="submit">{busy ? 'Searching…' : 'Ask knowledge base →'}</button></div>
            </form>
            <p className="helper">{health?.generative_answers_enabled ? 'AI generation enabled: answers are composed from retrieved evidence.' : 'Extractive mode: answers show source text. Add GROQ_API_KEY for generated answers in your selected language.'} {health?.semantic_search_enabled ? 'Cross-language semantic retrieval enabled.' : 'Enable EMBEDDING_MODEL for cross-language search.'}</p>
          </section>
          <section className="section-spaced">
            <div className="section-title"><div><h2>Recent conversations</h2><p>Evidence-backed results stored on the server.</p></div><div className="actions"><button className="subtle" disabled={!history.length} onClick={exportHistory}>Export JSON</button><button className="subtle danger" disabled={!history.length} onClick={clearHistory}>Clear history</button></div></div>
            {history.length === 0 ? <div className="empty"><span>✧</span><h3>Your questions will appear here</h3><p>Upload a document in the library, then ask something about it.</p><button className="text-link" onClick={() => setTab('library')}>Go to document library →</button></div> :
              <div className="conversation-list">{history.map(item => <article className="conversation" key={item.id}>
                <div className="conversation-top"><strong>{item.question}</strong><Flag>{item.mode}</Flag></div>
                <p className="answer">{item.answer}</p>
                {item.mode === 'extractive' && <small className="note">Source excerpt, not an AI-generated translation or summary.</small>}
                {!!item.sources?.length && <div className="sources"><span>Sources</span>{item.sources.map(source => <button key={source.id} title={source.excerpt} onClick={() => { setTab('library'); inspect(source.id) }}>▤ {source.title} · {source.language.toUpperCase()}</button>)}</div>}
              </article>)}</div>}
          </section>
        </>}

        {tab === 'library' && <>
          <div className="library-grid">
            <section className="panel"><div className="panel-heading"><div><h2>Upload a file</h2><p>PDF, DOCX, TXT, MD or CSV · up to 5 MB</p></div><span className="square-icon">↥</span></div>
              <form onSubmit={upload}><label className="file-area" htmlFor="file-input"><span>⇧</span><strong>{file?.name || 'Choose a document'}</strong><small>{file ? (file.size / 1024).toFixed(1) + ' KB selected' : 'Click here to browse files'}</small></label><input id="file-input" ref={fileRef} type="file" accept=".pdf,.docx,.txt,.md,.csv" onChange={event => setFile(event.target.files?.[0] || null)} /><button className="primary full" type="submit" disabled={!file || fileBusy}>{fileBusy ? 'Processing…' : 'Upload & index →'}</button></form>
            </section>
            <section className="panel"><div className="panel-heading"><div><h2>Add text directly</h2><p>Save notes as a searchable document.</p></div><span className="square-icon">✎</span></div>
              <form onSubmit={addText} className="manual-form"><label htmlFor="doc-title">Title</label><input id="doc-title" value={manual.title} maxLength="255" required onChange={event => setManual({ ...manual, title: event.target.value })} placeholder="Document title" /><label htmlFor="doc-content">Content</label><textarea id="doc-content" rows="4" required value={manual.content} onChange={event => setManual({ ...manual, content: event.target.value })} placeholder="Paste your content here…" /><button className="primary full" disabled={docBusy || !manual.title.trim() || !manual.content.trim()} type="submit">{docBusy ? 'Saving…' : 'Save document →'}</button></form>
            </section>
          </div>
          <section className="section-spaced"><div className="section-title"><div><h2>Indexed documents</h2><p>{documents.length} document{documents.length === 1 ? '' : 's'} available for retrieval.</p></div><button className="subtle" onClick={refresh}>Refresh</button></div>
            {documents.length === 0 ? <div className="empty"><span>▤</span><h3>No documents yet</h3><p>Upload a file or save a note to populate your knowledge base.</p></div> : <div className="document-list">{documents.map(doc => <div className="document" key={doc.id}><span className="doc-icon">▤</span><div className="doc-details"><strong>{doc.title}</strong><p>{doc.preview || 'No preview available'}</p><small>{doc.category} · {doc.language.toUpperCase()} · {new Date(doc.created_at).toLocaleDateString()}</small></div><div className="actions"><button className="subtle" onClick={() => inspect(doc.id)}>Preview</button><button className="subtle danger" onClick={() => remove(doc.id)}>Delete</button></div></div>)}</div>}
          </section>
          {selected && <section className="panel preview" aria-label="Document preview"><div className="section-title"><div><h2>{selected.title}</h2><p>{selected.category} · {selected.language.toUpperCase()}</p></div><button className="subtle" onClick={() => setSelected(null)}>Close ✕</button></div><pre>{selected.content}</pre></section>}
        </>}

        {tab === 'insights' && <><section className="metrics"><div><span>Documents</span><strong>{stats.documents}</strong><small>Total indexed</small></div><div><span>Questions</span><strong>{stats.questions}</strong><small>Total asked</small></div><div><span>Searchable passages</span><strong>{stats.chunks}</strong><small>Document chunks</small></div></section>
          <section className="panel section-spaced"><div className="panel-heading"><div><h2>Document languages</h2><p>Automatically detected from document scripts.</p></div><span className="square-icon">◉</span></div>
            {Object.keys(stats.by_language).length === 0 ? <p className="muted">Add documents to view language usage.</p> : <div className="bars">{Object.entries(stats.by_language).sort((a, b) => b[1] - a[1]).map(([code, count]) => <div key={code} className="bar-row"><span>{languages.find(l => l[0] === code)?.[1] || code}</span><div className="track"><div style={{ width: (count / Math.max(stats.documents, 1) * 100) + '%' }} /></div><strong>{count}</strong></div>)}</div>}
          </section><section className="panel section-spaced"><h2>AI configuration</h2><div className="configuration"><span>API server <Flag>{health ? 'Connected' : 'Offline'}</Flag></span><span>Cross-language semantic embeddings <Flag>{health?.semantic_search_enabled ? 'Configured' : 'Optional'}</Flag></span><span>Groq generated answers <Flag>{health?.generative_answers_enabled ? 'Configured' : 'Optional'}</Flag></span></div><p className="helper">Without optional AI integrations, the project still supports local document uploads, same-language keyword retrieval and source excerpts.</p></section>
        </>}
        <footer>LinguaBase · Local-first knowledge discovery · Built with React + FastAPI</footer>
      </main>
    </div>
  )
}

export default App
