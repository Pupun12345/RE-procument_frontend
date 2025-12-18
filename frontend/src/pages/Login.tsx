import { useState, useEffect } from "react";
import type { CSSProperties } from "react";
import { Button } from "antd";
import { FaUser, FaLock, FaEye, FaEyeSlash, FaSyncAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import api from "../api/axios";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

interface LoginErrorResponse {
  message?: string;
}

/* ---------------- Styles ---------------- */

const footerLinkStyle: CSSProperties = {
  color: "#cfe3ff",
  textDecoration: "none",
  cursor: "pointer",
  transition: "all 0.25s ease",
};



export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const token = useAuthStore((s) => s.token);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [generatedCaptcha, setGeneratedCaptcha] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Redirect to dashboard if already logged in
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [token, navigate]);

  useEffect(() => {
    refreshCaptcha();
  }, []);

  const refreshCaptcha = () => {
    const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    let result = "";
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedCaptcha(result);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }

    if (captcha.trim().toUpperCase() !== generatedCaptcha) {
      toast.error("Incorrect Captcha");
      refreshCaptcha();
      return;
    }

    const toastId = toast.loading("Signing in...");

    try {
      setLoading(true);

      const res = await api.post("/auth/login", { email, password });

      const { role, username, token } = res.data;
      
      // Set auth in Zustand store (will persist to localStorage)
      setAuth(role, username, token);

      toast.success("Login Successful", { id: toastId });

      // Wait for Zustand persist to complete before navigating
      await new Promise(resolve => setTimeout(resolve, 150));
      
      navigate("/dashboard", { replace: true });
    } catch (error) {
      const err = error as AxiosError<LoginErrorResponse>;
      toast.error(err.response?.data?.message || "Login failed", {
        id: toastId,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        width: 430,
        background: "rgba(255,255,255,0.12)",
        backdropFilter: "blur(20px)",
        padding: 40,
        borderRadius: 22,
        boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
        color: "white",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          background: "linear-gradient(90deg,#4dafff,#b47bff)",
          WebkitBackgroundClip: "text",
          color: "transparent",
          fontSize: 28,
          fontWeight: 700,
        }}
      >
        E.PROCUREMENT
      </h2>

      <p style={{ textAlign: "center", marginTop: -5, color: "#eee" }}>
        Welcome back! Please sign in
      </p>

      <div
        style={{
          marginTop: 30,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {/* Email */}
        <div style={{ position: "relative" }}>
          <FaUser style={iconStyle} />
          <input
            placeholder="Username / Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Password */}
        <div style={{ position: "relative" }}>
          <FaLock style={iconStyle} />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={eyeStyle}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {/* Captcha */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={captchaBoxStyle}>{generatedCaptcha}</div>
          <button type="button" onClick={refreshCaptcha} style={refreshBtnStyle}>
            <FaSyncAlt />
          </button>
          <input
            placeholder="Enter Captcha"
            value={captcha}
            onChange={(e) => setCaptcha(e.target.value)}
            style={captchaInputStyle}
          />
        </div>

        {/* Button */}
        <Button
          type="primary"
          loading={loading}
          onClick={handleLogin}
          style={{
            width: "100%",
            height: 50,
            borderRadius: 12,
            background: "linear-gradient(90deg,#4dafff,#b47bff)",
            fontWeight: 600,
          }}
        >
          Sign In
        </Button>
        <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    marginTop: 18,
    fontSize: 13,
  }}
>
  <a
    href="#"
    style={footerLinkStyle}
    onMouseEnter={(e) => {
      e.currentTarget.style.color = "#4dafff";
      e.currentTarget.style.textShadow =
        "0 0 10px rgba(77,175,255,0.6)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.color = "#cfe3ff";
      e.currentTarget.style.textShadow = "none";
    }}
  >
    Forgot User ID?
  </a>

  <a
    href="#"
    style={footerLinkStyle}
    onMouseEnter={(e) => {
      e.currentTarget.style.color = "#4dafff";
      e.currentTarget.style.textShadow =
        "0 0 10px rgba(77,175,255,0.6)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.color = "#cfe3ff";
      e.currentTarget.style.textShadow = "none";
    }}
  >
    Forgot Password?
  </a>
</div>

        
      </div>
    </div>
  );
}

/* ---------------- Styles ---------------- */

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "12px 45px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.25)",
  background: "rgba(0,0,0,0.3)",
  color: "white",
  outline: "none",
};

const iconStyle: CSSProperties = {
  position: "absolute",
  left: 12,
  top: "50%",
  transform: "translateY(-50%)",
  color: "#ddd",
};

const eyeStyle: CSSProperties = {
  position: "absolute",
  right: 12,
  top: "50%",
  transform: "translateY(-50%)",
  background: "none",
  border: "none",
  color: "white",
  cursor: "pointer",
};

const captchaBoxStyle: CSSProperties = {
  width: 110,
  height: 45,
  background: "rgba(255,255,255,0.2)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 8,
  fontWeight: 700,
};

const refreshBtnStyle: CSSProperties = {
  width: 45,
  height: 45,
  borderRadius: 8,
  border: "none",
  background: "rgba(255,255,255,0.15)",
  color: "white",
  cursor: "pointer",
};

const captchaInputStyle: CSSProperties = {
  flex: 1,
  height: 45,
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.25)",
  background: "rgba(0,0,0,0.25)",
  color: "white",
};
