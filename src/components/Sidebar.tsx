"use client";

import { useState } from "react";
import Link from "next/link";

import {
  Users,
  Clock,
  Home,
  UserCog,
  FileText,
  Cog,
  ClipboardList,
  Layers,
  FileCheck2,
  ClipboardSignature,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function Sidebar() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const menuItems = [
    { title: "Dashboard", icon: Home, href: "/dashboard" },
    { title: "Employees", icon: Users, href: "/employees" },
    { title: "Manage Shifts", icon: Layers, href: "/shifts", badge: "New" },
    { title: "Leaves & Holidays", icon: ClipboardList, href: "/leaves" },
    { title: "Approval Requests", icon: FileCheck2, href: "/approvals" },
    { title: "Payroll", icon: FileText, href: "/payroll" },
    { title: "Loans & Advances", icon: ClipboardSignature, href: "/loans" },
    { title: "Reports", icon: FileText, href: "/reports" },
    { title: "Dynamic Reports", icon: FileText, href: "/reports/dynamic" },
    { title: "User Management", icon: UserCog, href: "/users" },
    { title: "Activity Logs", icon: Clock, href: "/logs" },
    { title: "Configuration", icon: Cog, href: "/config" },
  ];

  return (
    <div className="w-64 bg-white min-h-screen border-r px-4 py-6">
      <h2 className="text-lg font-semibold mb-4 text-slate-700 px-2">Menu</h2>

      <nav className="space-y-1">
        {menuItems.map((item, idx) => {
          const Icon = item.icon;
          const isOpen = openIndex === idx;

          return (
            <div key={idx}>
              <div className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-700 select-none">

                {/* LEFT SIDE — NAVIGATION */}
                <Link href={item.href} className="flex items-center gap-3">
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.title}</span>
                </Link>

                {/* RIGHT SIDE — CHEVRON TOGGLE */}
                <div
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="cursor-pointer"
                >
                  {item.badge ? (
                    <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  ) : isOpen ? (
                    <ChevronUp className="h-4 w-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  )}
                </div>
              </div>

              {/* SUBMENU */}
              {isOpen && (
                <div className="ml-10 text-xs text-slate-500 py-1">
                  {/* future submenu */}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
