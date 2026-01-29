import React, { useState } from "react";

function ArchitectGPT() {
  const [image, setImage] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Only show error if both inputs are empty
    if (!image && !prompt.trim()) {
      return alert("Please provide a prompt or upload an image.");
    }

    const formData = new FormData();
    if (image) formData.append("image", image);
    formData.append("prompt", prompt);

    setLoading(true);

    try {
      const res = await fetch("http://localhost:3001/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setOutput(data.output);
    } catch (err) {
      alert("Something went wrong.");
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20, fontFamily: "sans-serif" }}>
      <h2>🏛️ Architect GPT</h2>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
        style={{ marginBottom: 10 }}
      />

      <textarea
        rows={4}
        placeholder="Enter a design prompt, or upload an image (or both)"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 10 }}
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          padding: "10px 20px",
          fontWeight: "bold",
          backgroundColor: "#282c34",
          color: "white",
          border: "none",
          borderRadius: 5,
          cursor: "pointer",
        }}
      >
        {loading ? "Analyzing..." : "Analyze Architecture"}
      </button>

      {output && (
        <div style={{ marginTop: 20, padding: 15, background: "#f4f4f4", borderRadius: 8 }}>
          <h3>🧱 Gemini Output:</h3>
          <p>{output}</p>
        </div>
      )}
    </div>
  );
}

export default ArchitectGPT;
