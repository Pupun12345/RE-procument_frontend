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

const titleStyle: CSSProperties = {
  textAlign: "center",
  background: "linear-gradient(90deg,#4dafff,#b47bff)",
  WebkitBackgroundClip: "text",
  color: "transparent",
  fontSize: 26,
  fontWeight: 700,
  marginBottom: 4,
};

const subtitleStyle: CSSProperties = {
  textAlign: "center",
  color: "#eee",
  fontSize: 14,
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
    if (token) navigate("/dashboard", { replace: true });
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
      setAuth(role, username, token);
      toast.success("Login Successful", { id: toastId });
      await new Promise((r) => setTimeout(r, 150));
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
        width: 420,
        height: 440,
        background: "rgba(255,255,255,0.12)",
        backdropFilter: "blur(20px)",
        padding: "26px 32px",
        borderRadius: 22,
        boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* HEADER */}
      <div>
        <h2 style={titleStyle}>E.PROCUREMENT</h2>
        <p style={subtitleStyle}>Welcome back! Please sign in</p>
      </div>

      {/* FORM */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ position: "relative" }}>
          <FaUser style={iconStyle} />
          <input
            placeholder="Username / Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
        </div>

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

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={captchaBoxStyle}>{generatedCaptcha}</div>
          <button
            type="button"
            onClick={refreshCaptcha}
            style={refreshBtnStyle}
          >
            <FaSyncAlt />
          </button>
          <input
            placeholder="Enter Captcha"
            value={captcha}
            onChange={(e) => setCaptcha(e.target.value)}
            style={captchaInputStyle}
          />
        </div>

        <Button
          type="primary"
          loading={loading}
          onClick={handleLogin}
          style={loginBtnStyle}
        >
          Sign In
        </Button>
      </div>

      {/* FOOTER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
        }}
      >
        <a style={footerLinkStyle} onClick={() => navigate("/forgot-password")}>
          Forgot User ID?
        </a>
        <a style={footerLinkStyle} onClick={() => navigate("/forgot-password")}>
          Forgot Password?
        </a>
      </div>
    </div>
  );
}

/* ---------------- Input Styles ---------------- */

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "10px 42px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.25)",
  background: "rgba(0,0,0,0.3)",
  color: "white",
  fontSize: 14,
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
  width: 96,
  height: 38,
  borderRadius: 8,
  fontWeight: 700,
  fontSize: 13,
  background: "rgba(255,255,255,0.2)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const refreshBtnStyle: CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: 8,
  background: "rgba(255,255,255,0.15)",
  border: "none",
  color: "white",
  cursor: "pointer",
};

const captchaInputStyle: CSSProperties = {
  flex: 1,
  height: 38,
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.25)",
  background: "rgba(0,0,0,0.25)",
  color: "white",
  fontSize: 14,
};

const loginBtnStyle: CSSProperties = {
  width: "100%",
  height: 38,
  borderRadius: 12,
  background: "linear-gradient(90deg,#4dafff,#b47bff)",
  fontWeight: 600,
  fontSize: 15,
};
