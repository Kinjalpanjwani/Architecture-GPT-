
import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import "./App.css";

function ArchitectGPT() {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState(null);
  const [output, setOutput] = useState("");
  const [genImage, setGenImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("text");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [history, setHistory] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [newTitle, setNewTitle] = useState("");

  const userData = JSON.parse(localStorage.getItem("userData"));
  const dropdownRef = useRef(null);

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const saved = localStorage.getItem("history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAnalyze = async () => {
    if (!prompt.trim()) return alert("Please enter a prompt.");
    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("mode", mode);
    if (image) formData.append("image", image);

    setLoading(true);
    setOutput("");
    setGenImage(null);

    try {
      const res = await fetch("http://localhost:3001/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log("📦 Response JSON:", data);

      if (res.ok) {
        let base64Image = null;

        if (data.image && typeof data.image === "object") {
          base64Image = `data:image/${data.image.mime || "png"};base64,${data.image.image_base64}`;
        } else if (typeof data.image === "string") {
          const mime = data.mime || "png";
          base64Image = `data:image/${mime};base64,${data.image}`;
        }

        const item = {
          id: Date.now(),
          title: prompt.slice(0, 20) || "Untitled",
          prompt,
          description: data.output || "Image generated",
          imageURL: base64Image,
          timestamp: new Date().toLocaleString(),
        };

        const updated = [item, ...history];
        setHistory(updated);
        setSelectedChatId(item.id);
        localStorage.setItem("history", JSON.stringify(updated));

        if (mode === "text") setOutput(data.output || "");
        if (mode === "image") {
          if (!base64Image || base64Image.includes("undefined")) {
            alert("❌ Failed to load image. Check if quota or generation failed.");
          } else {
            setGenImage(base64Image);
          }
        }
      } else {
        const errorMsg = data?.error || "Server error";
        if (errorMsg.toLowerCase().includes("quota")) {
          alert("❌ OpenAI quota exceeded. Visit: https://platform.openai.com/account/usage");
        } else {
          alert("❌ " + errorMsg);
        }
      }
    } catch (err) {
      console.error("❌ Caught Request Error:", err);
      alert("❌ Network or server error. Please check console or backend logs.");
    }

    setLoading(false);
  };

  const handleNewChat = () => {
    setPrompt("");
    setOutput("");
    setGenImage(null);
    setImage(null);
    setSelectedChatId(null);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleRename = (id) => {
    const updated = history.map((chat) =>
      chat.id === id ? { ...chat, title: newTitle || chat.title } : chat
    );
    setHistory(updated);
    localStorage.setItem("history", JSON.stringify(updated));
    setDropdownOpen(null);
  };

  const handleDelete = (id) => {
    const updated = history.filter((chat) => chat.id !== id);
    setHistory(updated);
    localStorage.setItem("history", JSON.stringify(updated));
    if (selectedChatId === id) handleNewChat();
    setDropdownOpen(null);
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.removeItem("loginMessageDismissed");
    window.location.href = "/login";
  };

  return (
    <div className="gpt-container">
      <aside className="sidebar">
        <h2 className="logo">Architect AI</h2>
        <button onClick={handleNewChat} className="sidebar-btn">
          ➕ New Chat
        </button>
        <button
          onClick={() => setMode("text")}
          className={`sidebar-btn ${mode === "text" ? "active" : ""}`}
        >
          📄 Text Mode
        </button>
        <button
          onClick={() => setMode("image")}
          className={`sidebar-btn ${mode === "image" ? "active" : ""}`}
        >
          🎨 Image Mode
        </button>
        <button onClick={toggleTheme} className="sidebar-btn">
          {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
        </button>

        <div className="history-block">
          <h4>🕘 Chats</h4>
          {history.map((chat) => (
            <div
              key={chat.id}
              className={`history-item ${chat.id === selectedChatId ? "selected" : ""}`}
            >
              <div
                onClick={() => {
                  setSelectedChatId(chat.id);
                  setPrompt(chat.prompt);
                  setOutput(chat.description);
                  setGenImage(chat.imageURL);
                }}
                className="chat-title-area"
              >
                <strong>{chat.title}</strong>
                <br />
                <small>{chat.timestamp}</small>
              </div>
              <div className="menu-wrapper" ref={dropdownRef}>
                <button
                  className="rename-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen(dropdownOpen === chat.id ? null : chat.id);
                    setNewTitle(chat.title);
                  }}
                >
                  ⋮
                </button>
                {dropdownOpen === chat.id && (
                  <div className="dropdown-menu">
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="rename-input"
                      placeholder="New title..."
                    />
                    <button onClick={() => handleRename(chat.id)}>Rename</button>
                    <button onClick={() => handleDelete(chat.id)}>Delete</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <button onClick={handleLogout} className="logout-btn">
          🔓 Logout
        </button>
      </aside>

      <main className="main-panel">
        <header className="main-header center-title">
          <h1 className="main-title">Architectural Vision GPT</h1>
          {userData?.name && (
            <p className="user-tagline">{userData.name}'s Design Studio</p>
          )}
        </header>

        <div className="chat-box">
          <div className="input-with-upload">
            <label htmlFor="image-upload" className="upload-label">
              ➕
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              style={{ display: "none" }}
            />
            <textarea
              rows={4}
              placeholder="Enter your architectural idea..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="prompt-input"
            />
          </div>

          {image && (
            <div className="image-filename">
              📎 <small>{image.name}</small>
            </div>
          )}

          <button className="run-btn" onClick={handleAnalyze} disabled={loading}>
            {loading ? "Working..." : `Generate ${mode === "text" ? "Text" : "Image"}`}
          </button>

          {mode === "text" && output && (
            <div className="description-box">
              <ReactMarkdown>{output}</ReactMarkdown>
            </div>
          )}

          {mode === "image" && genImage && (
            <div className="image-preview">
              <img src={genImage} alt="Generated Design" />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default ArchitectGPT;
