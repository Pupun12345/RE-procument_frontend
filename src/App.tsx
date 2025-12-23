import { Toaster } from "react-hot-toast";
import AppRouter from "../router/AppRouter";

export default function App() {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2500,
          style: {
            fontSize: "14px",
            borderRadius: "8px",
          },
          success: {
            style: {
              background: "#6b6ef9",
              color: "#fff",
            },
            icon: "✅",
          },
          error: {
            style: {
              background: "#ef4444",
              color: "#fff",
            },
            icon: "❌",
          },
        }}
      />
      <AppRouter />
    </>
  );
}
