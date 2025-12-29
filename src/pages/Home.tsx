import { Layout } from "antd";
import Login from "./Login";

const { Header, Content, Footer } = Layout;

export default function Home() {
  return (
    <Layout
      style={{
        height: "100vh",
        overflow: "hidden",
        position: "relative",
      }}
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

      <Header style={{ height: 0 }} />

      <Content
        style={{
          height: "100%",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          alignItems: "stretch", // ❌ no vertical centering
          padding: "0 6%",
          zIndex: 2,
        }}
      >
        {/* LEFT BRAND */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            paddingTop: 40,
            gap: 14,
          }}
        >
          <img src="/ray-log.png" width={48} alt="Ray Engineering Logo" />
          <span
            style={{
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: "0.6px",
              color: "#fff",
              whiteSpace: "nowrap",
            }}
          >
            RAY ENGINEERING
          </span>
        </div>

        {/* RIGHT LOGIN PANEL */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Login />
        </div>
      </Content>

      <Footer
        style={{
          position: "absolute",
          bottom: 10,
          width: "100%",
          textAlign: "center",
          background: "transparent",
          color: "#ffffffcc",
          fontSize: 13,
          zIndex: 2,
        }}
      >
        © {new Date().getFullYear()} RAY ENGINEERING RE-PROCUREMENT | Powered by
        SMARTNEXTechnologies
      </Footer>
    </Layout>
  );
}
