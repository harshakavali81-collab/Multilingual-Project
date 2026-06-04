import { useState } from "react";

function App() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState([]);

  const [history, setHistory] = useState(
    JSON.parse(localStorage.getItem("history")) || []
  );

  const [file, setFile] = useState(null);

  const askQuestion = async () => {
    if (!message.trim()) return;

    try {
      setLoading(true);

      const res = await fetch("http://127.0.0.1:8000/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: message,
          preferred_language: language,
        }),
      });

      const data = await res.json();

      const answer = data.answer || "No answer found";

      setResponse(answer);
      setSources(data.sources || []);
      setLoading(false);

      const newHistory = [
        {
          question: message,
          answer: answer,
        },
        ...history,
      ];

      setHistory(newHistory);

      localStorage.setItem(
        "history",
        JSON.stringify(newHistory)
      );

      setMessage("");
    } catch (err) {
      setLoading(false);
      setResponse("Error connecting to backend");
      console.error(err);
    }
  };

  const uploadFile = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);

      const res = await fetch(
        "http://127.0.0.1:8000/upload-file",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      alert(data.message || "File Uploaded Successfully");

      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error(err);
      alert("Upload Failed");
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("history");
    setResponse("");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0f172a",
        color: "white",
        padding: "40px",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "48px" }}>
        Multilingual Knowledge Base
      </h1>

      <div style={{ marginTop: "30px" }}>
        <input
          type="text"
          placeholder="Ask a question..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              askQuestion();
            }
          }}
          style={{
            width: "400px",
            padding: "12px",
            borderRadius: "8px",
          }}
        />

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={{
            padding: "12px",
            marginLeft: "10px",
          }}
        >
          <option value="auto">Auto Detect</option>
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="te">Telugu</option>
          <option value="ta">Tamil</option>
          <option value="kn">Kannada</option>
        </select>

        <button
          onClick={askQuestion}
          style={{
            marginLeft: "10px",
            padding: "12px 20px",
            cursor: "pointer",
          }}
        >
          Ask
        </button>
      </div>

      <div style={{ marginTop: "20px" }}>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button
          onClick={uploadFile}
          style={{
            marginLeft: "10px",
            padding: "10px 20px",
            cursor: "pointer",
          }}
        >
          Upload File
        </button>
      </div>

      {loading && (
        <div
          style={{
            marginTop: "20px",
            backgroundColor: "#1e293b",
            padding: "15px",
            borderRadius: "10px",
            maxWidth: "900px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <h3
            style={{
              color: "#38bdf8",
              textAlign: "center",
            }}
          >
            🤖 Thinking...
          </h3>
        </div>
      )}

      <div
        style={{
          marginTop: "30px",
          maxWidth: "900px",
          marginLeft: "auto",
          marginRight: "auto",
          textAlign: "left",
        }}
      >
        <h2>Response</h2>

        <div
          style={{
            backgroundColor: "#1e293b",
            padding: "20px",
            borderRadius: "10px",
          }}
        >
          {response}
        </div>
      </div>
      <div
  style={{
    marginTop: "20px",
  }}
>
  <h2>Sources</h2>

  {[...new Map(
    sources.map(item => [item.title, item])
  ).values()].map((source, index) => (
    <div
      key={index}
      style={{
        backgroundColor: "#1e293b",
        padding: "10px",
        marginBottom: "10px",
        borderRadius: "8px",
      }}
    >
      📄 {source.title}
    </div>
  ))}
</div>
      
          

      <div
        style={{
          background: "#1e293b",
          padding: "15px",
          borderRadius: "10px",
          marginTop: "20px",
          maxWidth: "900px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <h3>Total Questions</h3>
        <h2>{history.length}</h2>
      </div>

      <div
        style={{
          marginTop: "30px",
          maxWidth: "900px",
          marginLeft: "auto",
          marginRight: "auto",
          textAlign: "left",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <h2>Chat History</h2>

          <button onClick={clearHistory}>
            Clear History
          </button>
        </div>

        {history.map((item, index) => (
          <div
            key={index}
            style={{
              border: "1px solid gray",
              borderRadius: "10px",
              padding: "15px",
              marginBottom: "15px",
              backgroundColor: "#1e293b",
            }}
          >
            <strong>Question:</strong>
            <p>{item.question}</p>

            <strong>Answer:</strong>
            <p>{item.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;