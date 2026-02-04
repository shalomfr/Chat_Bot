"use client";

import { useState, useEffect } from "react";
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
  HelpCircle,
  Menu,
  X,
  BarChart3,
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
  { name: "עזרה", href: "/dashboard/help", icon: HelpCircle },
];

const adminNavigation = [
  { name: "ניהול משתמשים", href: "/dashboard/admin", icon: Users },
  { name: "שימוש כללי", href: "/dashboard/admin/usage", icon: BarChart3 },
];

export function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/");
    router.refresh();
  };

  const allNavigation = user.isAdmin
    ? [...navigation, ...adminNavigation]
    : navigation;

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex h-16 sm:h-20 items-center gap-3 px-4 sm:px-6">
        <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
          <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
        </div>
        <span className="text-lg sm:text-xl font-bold bg-gradient-to-l from-blue-600 to-blue-500 bg-clip-text text-transparent">
          ChatBot
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 sm:space-y-1.5 px-3 sm:px-4 py-3 sm:py-4 overflow-y-auto">
        {allNavigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-gradient-to-l from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30"
                  : "text-gray-600 hover:bg-blue-50 hover:text-blue-600 active:bg-blue-100"
              )}
              onClick={() => setIsOpen(false)}
            >
              <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-gray-100 p-3 sm:p-4">
        <div className="mb-2 sm:mb-3 flex items-center gap-2 sm:gap-3">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || "User"}
              className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl object-cover shadow-sm"
            />
          ) : (
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold shadow-lg shadow-blue-500/20">
              {(user.name || user.email || "U")[0].toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-gray-800 truncate text-sm sm:text-base">
                {user.name || "משתמש"}
              </p>
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
          className="w-full justify-start gap-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl text-sm"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          התנתק
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header with Hamburger */}
      <div className="lg:hidden fixed top-0 right-0 left-0 z-40 flex h-14 items-center justify-between bg-white/95 backdrop-blur-sm px-4 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-l from-blue-600 to-blue-500 bg-clip-text text-transparent">
            ChatBot
          </span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors"
          aria-label={isOpen ? "סגור תפריט" : "פתח תפריט"}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Sidebar (Drawer) */}
      <div
        className={cn(
          "lg:hidden fixed top-0 right-0 z-50 h-full w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <SidebarContent />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex h-full w-64 flex-col bg-white shadow-sm">
        <SidebarContent />
      </div>
    </>
  );
}
