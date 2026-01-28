"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Settings,
  Database,
  MessagesSquare,
  Play,
  Code,
  LogOut,
  Home,
} from "lucide-react";

interface User {
  id: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
}

const navigation = [
  { name: "דשבורד", href: "/dashboard", icon: Home },
  { name: "הגדרות", href: "/dashboard/settings", icon: Settings },
  { name: "מאגר ידע", href: "/dashboard/knowledge", icon: Database },
  { name: "שיחות", href: "/dashboard/conversations", icon: MessagesSquare },
  { name: "בדיקה", href: "/dashboard/playground", icon: Play },
  { name: "הטמעה", href: "/dashboard/embed", icon: Code },
];

export function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="flex h-full w-64 flex-col border-l bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <MessageSquare className="h-6 w-6 text-primary" />
        <span className="text-lg font-bold">ChatBot SaaS</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t p-4">
        <div className="mb-3 flex items-center gap-3">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name || "User"}
              className="h-10 w-10 rounded-full"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              {(user.name || user.email)[0].toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate">{user.name || "משתמש"}</p>
            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          התנתק
        </Button>
      </div>
    </div>
  );
}
