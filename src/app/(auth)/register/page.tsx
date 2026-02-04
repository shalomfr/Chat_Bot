"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Bot, Loader2, UserPlus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "שגיאה",
        description: "הסיסמאות לא תואמות",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "שגיאה",
        description: "הסיסמה חייבת להכיל לפחות 6 תווים",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data.details ? `${data.error} (${data.details})` : (data.error || "שגיאה בהרשמה");
        throw new Error(msg);
      }

      toast({
        title: "נרשמת בהצלחה!",
        description: "מעביר אותך לעמוד ההתחברות...",
      });

      router.push("/login?registered=true");
    } catch (error: any) {
      toast({
        title: "שגיאה",
        description: error.message || "אירעה שגיאה בהרשמה",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-bl from-blue-50 via-white to-gray-50 p-4">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-30 translate-y-1/2 -translate-x-1/2"></div>
      </div>

      <Card className="w-full max-w-md border-0 shadow-2xl bg-white/80 backdrop-blur-sm overflow-hidden relative z-10">
        <div className="h-1.5 bg-gradient-to-l from-emerald-500 to-green-500"></div>
        <CardContent className="p-8">
          {/* Logo */}
          <Link href="/" className="flex items-center justify-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
              <Bot className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-l from-blue-600 to-blue-500 bg-clip-text text-transparent">
              ChatBot
            </span>
          </Link>

          <div className="text-center mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 shadow-lg shadow-emerald-500/30 mx-auto mb-4">
              <UserPlus className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">צור חשבון חדש</h1>
            <p className="text-gray-500 mt-1">הצטרף אלינו והתחל ליצור צ׳אטבוטים</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">שם</label>
              <Input
                id="name"
                type="text"
                placeholder="השם שלך"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-12 rounded-xl border-gray-200 focus:border-blue-300"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">אימייל</label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                dir="ltr"
                className="h-12 rounded-xl border-gray-200 focus:border-blue-300"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">סיסמה</label>
              <Input
                id="password"
                type="password"
                placeholder="לפחות 6 תווים"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                dir="ltr"
                className="h-12 rounded-xl border-gray-200 focus:border-blue-300"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">אימות סיסמה</label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="הזן שוב את הסיסמה"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                dir="ltr"
                className="h-12 rounded-xl border-gray-200 focus:border-blue-300"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 rounded-xl bg-gradient-to-l from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg shadow-emerald-500/30"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                  נרשם...
                </>
              ) : (
                "הרשמה"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            כבר יש לך חשבון?{" "}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              התחבר
            </Link>
          </p>
        </CardContent>
        <CardFooter className="justify-center pb-8">
          <Link href="/" className="text-sm text-gray-400 hover:text-blue-600 transition-colors">
            חזרה לדף הבית
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
