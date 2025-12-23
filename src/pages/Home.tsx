import { Layout } from "antd";
import Login from "./Login";

const { Header, Content, Footer } = Layout;

export default function Home() {
  return (
    <Layout
      style={{ minHeight: "100vh", position: "relative", color: "white" }}
    >
      {/* Background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url('/background.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 0,
        }}
      />

      {/* Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          zIndex: 1,
        }}
      />

      <Header style={{ height: 0, padding: 0, background: "transparent" }} />

      <Content
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          padding: "90px 6%",
          gap: 60,
          zIndex: 2,
          flexWrap: "wrap",
        }}
      >
        {/* LEFT BRAND */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <img src="/ray-log.png" width={48} alt="Ray Engineering Logo" />
          <span
            style={{
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: "0.6px",
              color: "#ffffff", // ✅ PURE WHITE
              whiteSpace: "nowrap",
            }}
          >
            RAY ENGINEERING
          </span>
        </div>

        {/* RIGHT LOGIN */}
        <Login />
      </Content>

      <Footer
        style={{
          textAlign: "center",
          background: "transparent",
          color: "#ffffffdb",
          fontWeight: 600,
          marginBottom: 15,
          zIndex: 2,
        }}
      >
        © {new Date().getFullYear()} RAY ENGINEERING HRMS | Powered by SMARTNEX
        Technologies
      </Footer>
    </Layout>
  );
}
