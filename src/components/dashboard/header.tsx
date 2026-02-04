"use client";

import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  isAdmin?: boolean;
}

interface HeaderProps {
  user: User;
  title: string;
  subtitle?: string;
}

export function Header({ user, title, subtitle }: HeaderProps) {
  const greeting = getGreeting();

  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <p className="text-blue-600 font-medium mb-1">
          {greeting}, {user.name || "אורח"}!
        </p>
        <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
        {subtitle && (
          <p className="text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="חיפוש..."
            className="w-64 pr-10 rounded-xl border-gray-200 bg-white/80 backdrop-blur-sm focus:bg-white transition-all"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2.5 rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute top-1.5 left-1.5 h-2 w-2 bg-blue-500 rounded-full"></span>
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-3 bg-white rounded-xl px-3 py-2 shadow-sm border border-gray-100">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || "User"}
              className="h-9 w-9 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold text-sm">
              {(user.name || user.email || "U")[0].toUpperCase()}
            </div>
          )}
          <div className="hidden sm:block">
            <p className="font-semibold text-gray-800 text-sm">{user.name || "משתמש"}</p>
            {user.isAdmin && (
              <p className="text-[10px] text-blue-600 font-medium">מנהל מערכת</p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "בוקר טוב";
  if (hour < 17) return "צהריים טובים";
  if (hour < 21) return "ערב טוב";
  return "לילה טוב";
}
