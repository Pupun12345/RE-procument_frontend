// src/lib/auth.ts
export async function sendMagicLink(email: string) {
  const res = await fetch("http://localhost:5000/auth/send-link", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email }),
  });

  if (!res.ok) throw new Error("Failed to send magic link");
  return res.json();
}

export async function checkAuth() {
  const res = await fetch("http://localhost:5000/auth/check", {
    credentials: "include"
  });

  return res.ok;
}
//updated code