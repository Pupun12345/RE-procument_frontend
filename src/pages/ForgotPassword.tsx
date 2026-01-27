import { useState } from "react";
import type { CSSProperties } from "react";
import { Button } from "antd";
import { FaUser, FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";

/* ---------------- Styles (SAME AS LOGIN) ---------------- */


const footerLinkStyle: CSSProperties = {
  color: "#cfe3ff",
  textDecoration: "none",
  cursor: "pointer",
};
const eyeIconStyle: CSSProperties = {
  position: "absolute",
  right: 14,
  top: "50%",
  transform: "translateY(-50%)",
  color: "#ddd",
  cursor: "pointer",
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

const loginBtnStyle: CSSProperties = {
  width: "100%",
  height: 44,
  borderRadius: 12,
  background: "linear-gradient(90deg,#4dafff,#b47bff)",
  fontWeight: 600,
  fontSize: 15,
};

/* ---------------- Component ---------------- */

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const sendOtp = async () => {
    if (!email) {
      toast.error("Please enter email");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/forgot-password", { email });
      toast.success("OTP sent to email");
      setStep(2);
    } catch {
      toast.error("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!otp || !newPassword) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/reset-password", {
        email,
        otp,
        newPassword,
      });
      toast.success("Password updated successfully");
      navigate("/");
    } catch {
      toast.error("Invalid OTP or expired");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        position: "relative",
        backgroundImage: "url('/background.jpg')", // 🔥 SAME AS LOGIN
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        paddingRight: "6%",
      }}
    >
      {/* 🔥 DARK OVERLAY */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          zIndex: 1,
        }}
      />

      {/* 🔥 LEFT BRAND */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: "6%",
          display: "flex",
          alignItems: "center",
          gap: 14,
          zIndex: 2,
          color: "#fff",
        }}
      >
        <img src="/ray-log.png" width={48} alt="Ray Engineering Logo" />
        <span
          style={{
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: "0.6px",
            whiteSpace: "nowrap",
          }}
        >
          RAY ENGINEERING
        </span>
      </div>

      {/* 🔥 FORGOT PASSWORD CARD (UNCHANGED) */}
      <div style={{ position: "relative", zIndex: 2 }}>
        <div
          style={{
            width: 420,
            height: 420,
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
            <p style={subtitleStyle}>
              {step === 1 ? "Reset your password" : "Enter OTP & new password"}
            </p>
          </div>

          {/* FORM */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {step === 1 && (
              <div style={{ position: "relative" }}>
                <FaUser style={{ paddingBottom: 8, height: 20, ...iconStyle}} />
                <input
                  placeholder="Registered Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                />
              </div>
            )}

            {step === 2 && (
              <>
                <div style={{ position: "relative" }}>
                  <FaLock style={iconStyle} />
                  <input
                    placeholder="OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                <div style={{ position: "relative" }}>
                  <FaLock style={iconStyle} />
                  <div style={{ position: "relative" }}>
                    <FaLock style={iconStyle} />

                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      style={inputStyle}
                    />

                    {showPassword ? (
                      <FaEyeSlash
                        style={eyeIconStyle}
                        onClick={() => setShowPassword(false)}
                      />
                    ) : (
                      <FaEye
                        style={eyeIconStyle}
                        onClick={() => setShowPassword(true)}
                      />
                    )}
                  </div>
                </div>
              </>
            )}

            <Button
              type="primary"
              loading={loading}
              onClick={step === 1 ? sendOtp : resetPassword}
              style={loginBtnStyle}
            >
              {step === 1 ? "Send OTP" : "Reset Password"}
            </Button>
          </div>

          {/* FOOTER */}
          <div style={{ textAlign: "center", fontSize: 12 }}>
            <a style={footerLinkStyle} onClick={() => navigate("/")}>
              Back to Login
            </a>
          </div>
        </div>
      </div>

      {/* 🔥 PAGE FOOTER */}
      <div
        style={{
          position: "absolute",
          bottom: 10,
          width: "100%",
          textAlign: "center",
          color: "#ffffffcc",
          fontSize: 13,
          zIndex: 2,
        }}
      >
        © {new Date().getFullYear()} RAY ENGINEERING RE-PROCUREMENT | Powered by
        SMARTNEXTechnologies
      </div>
    </div>
  );
}
