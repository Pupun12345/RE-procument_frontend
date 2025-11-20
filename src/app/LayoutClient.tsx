// src/app/LayoutClient.tsx
"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const noLayoutRoutes = ["/", "/login", "/signup"];
  const isNoLayout = noLayoutRoutes.includes(pathname);

  if (isNoLayout) return <>{children}</>;

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
