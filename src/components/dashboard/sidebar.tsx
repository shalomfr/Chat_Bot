"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Settings,
  Database,
  MessagesSquare,
  Play,
  Code,
  LogOut,
  Users,
  Bot,
} from "lucide-react";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  isAdmin?: boolean;
}

const navigation = [
  { name: "דשבורד", href: "/dashboard", icon: LayoutDashboard },
  { name: "הגדרות", href: "/dashboard/settings", icon: Settings },
  { name: "מאגר ידע", href: "/dashboard/knowledge", icon: Database },
  { name: "שיחות", href: "/dashboard/conversations", icon: MessagesSquare },
  { name: "בדיקה", href: "/dashboard/playground", icon: Play },
  { name: "הטמעה", href: "/dashboard/embed", icon: Code },
];

const adminNavigation = [
  { name: "ניהול משתמשים", href: "/dashboard/admin", icon: Users },
];

export function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/");
    router.refresh();
  };

  const allNavigation = user.isAdmin
    ? [...navigation, ...adminNavigation]
    : navigation;

  return (
    <div className="flex h-full w-64 flex-col bg-white shadow-sm">
      {/* Logo */}
      <div className="flex h-20 items-center gap-3 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
          <Bot className="h-6 w-6 text-white" />
        </div>
        <span className="text-xl font-bold bg-gradient-to-l from-blue-600 to-blue-500 bg-clip-text text-transparent">
          ChatBot
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 px-4 py-4">
        {allNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-gradient-to-l from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30"
                  : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-gray-100 p-4">
        <div className="mb-3 flex items-center gap-3">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || "User"}
              className="h-11 w-11 rounded-xl object-cover shadow-sm"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold shadow-lg shadow-blue-500/20">
              {(user.name || user.email || "U")[0].toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-gray-800 truncate">{user.name || "משתמש"}</p>
              {user.isAdmin && (
                <span className="text-[10px] bg-gradient-to-l from-blue-500 to-blue-600 text-white px-2 py-0.5 rounded-full font-medium">
                  מנהל
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          התנתק
        </Button>
      </div>
    </div>
  );
}
