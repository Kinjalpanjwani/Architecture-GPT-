import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

function LoginPage() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const [showMessage, setShowMessage] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const dismissed = sessionStorage.getItem("loginMessageDismissed");
    setShowMessage(dismissed !== "true");
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      alert("Please enter both name and email.");
      return;
    }

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userData", JSON.stringify(formData));

    // ✅ Clear dismiss flag so message box shows again next login
    sessionStorage.removeItem("loginMessageDismissed");

    navigate("/", { replace: true });
  };

  const dismissMessage = () => {
    setShowMessage(false);
    sessionStorage.setItem("loginMessageDismissed", "true");
  };

  return (
    <div className="arch-hero login-page">
      {showMessage && (
        <div className="login-message-box">
          <button className="close-msg-btn" onClick={dismissMessage}>✖</button>
          <p className="message-text">
            <strong style={{ fontSize: "22px" }}>
              Welcome to Architectural Vision GPT
            </strong>
            <br />
            <span style={{ fontSize: "17px", fontFamily: "Times New Roman" }}>
              This tool is built for early-stage architects, real estate startups, or green home designers who want fast inspiration and rough feasibility.
            </span>
          </p>
        </div>
      )}

      <header className="header">
        <div className="header-content">
          <h1 style={{ fontSize: "3rem", fontFamily: "Times New Roman", color: "#fff", textShadow: "2px 2px 5px rgba(0,0,0,0.6)" }}>
            Architectural Vision GPT
          </h1>
          <p className="subtitle" style={{ fontFamily: "Times New Roman", color: "#eaeaea" }}>
            Start your design journey
          </p>
        </div>
      </header>

      <div className="login-container">
        <form onSubmit={handleSubmit} className="login-form">
          <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Access Studio</h2>

          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name"
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Phone (Optional)</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (___) ___-____"
            />
          </div>

          <button type="submit" className="submit-btn">Enter Studio</button>
        </form>
      </div>

      <footer className="footer">
        <p>©️ {new Date().getFullYear()} Architectural Vision AI</p>
      </footer>
    </div>
  );
}

export default LoginPage;

