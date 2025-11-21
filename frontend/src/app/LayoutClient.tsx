"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { useAuthStore } from "@/store/authStore";

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate(); // <-- MAIN FIX
  }, []);

  const hideLayoutRoutes = ["/", "/login"];
  if (hideLayoutRoutes.includes(pathname)) return <>{children}</>;

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 hidden md:block bg-white border-r">
        <Sidebar />
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-10">
          <Navbar />
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
//updated code