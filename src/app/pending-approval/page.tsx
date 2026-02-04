"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, LogOut, RefreshCcw, Bot } from "lucide-react";

export default function PendingApprovalPage() {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-bl from-blue-50 via-white to-gray-50 p-4">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-30 translate-y-1/2 -translate-x-1/2"></div>
      </div>

      <Card className="w-full max-w-md border-0 shadow-2xl bg-white/80 backdrop-blur-sm overflow-hidden relative z-10">
        <div className="h-1.5 bg-gradient-to-l from-amber-400 to-orange-500"></div>
        <CardContent className="p-8 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
              <Bot className="h-9 w-9 text-white" />
            </div>
          </div>

          {/* Status Icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-orange-100">
            <Clock className="h-10 w-10 text-amber-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-3">ממתין לאישור</h1>

          <p className="text-gray-500 leading-relaxed mb-8">
            החשבון שלך ממתין לאישור מנהל המערכת.
            <br />
            תקבל גישה לאחר שמנהל יאשר את הבקשה שלך.
          </p>

          {/* Info Box */}
          <div className="bg-gradient-to-l from-blue-50 to-indigo-50 rounded-2xl p-4 mb-6">
            <p className="text-sm text-blue-700">
              💡 בדרך כלל, תהליך האישור אורך עד 24 שעות. אם יש לך שאלות, צור קשר עם מנהל המערכת.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleRefresh}
              className="w-full bg-gradient-to-l from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/30 h-12"
            >
              <RefreshCcw className="h-4 w-4 ml-2" />
              בדוק שוב
            </Button>

            <Button
              variant="ghost"
              className="w-full text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl h-12"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 ml-2" />
              התנתק
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
