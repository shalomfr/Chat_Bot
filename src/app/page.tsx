"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Bot,
  Zap,
  Shield,
  Code,
  ArrowLeft,
  MessageSquare,
  Sparkles,
  Check,
  Send,
  User,
} from "lucide-react";

// Animated chat messages
const chatMessages = [
  { role: "user", text: "שלום! מה אתם מציעים?" },
  { role: "bot", text: "שלום! אנחנו מציעים פתרונות AI מתקדמים לעסקים. איך אוכל לעזור לך היום? 😊" },
  { role: "user", text: "כמה זה עולה?" },
  { role: "bot", text: "יש לנו תוכניות החל מחינם! תוכל להתחיל עכשיו ולשדרג בכל עת שתרצה." },
  { role: "user", text: "מעולה! איך מתחילים?" },
  { role: "bot", text: "פשוט לחץ על 'התחל עכשיו', העלה את התוכן שלך, והצ'אטבוט שלך יהיה מוכן תוך דקות! 🚀" },
];

function AnimatedChat() {
  const [visibleMessages, setVisibleMessages] = useState<number>(0);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (visibleMessages < chatMessages.length) {
      setIsTyping(true);
      const typingDelay = chatMessages[visibleMessages].role === "bot" ? 1500 : 800;

      const timer = setTimeout(() => {
        setIsTyping(false);
        setVisibleMessages((prev) => prev + 1);
      }, typingDelay);

      return () => clearTimeout(timer);
    } else {
      // Reset animation after a pause
      const resetTimer = setTimeout(() => {
        setVisibleMessages(0);
      }, 3000);
      return () => clearTimeout(resetTimer);
    }
  }, [visibleMessages]);

  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-md border border-gray-100">
      {/* Chat Header */}
      <div className="bg-gradient-to-l from-blue-500 to-blue-600 p-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
          <Bot className="h-6 w-6 text-white" />
        </div>
        <div className="text-white">
          <p className="font-semibold">הצ׳אטבוט שלך</p>
          <p className="text-xs text-blue-100">מוכן לעזור 24/7</p>
        </div>
        <div className="mr-auto flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
          <span className="text-xs text-blue-100">פעיל</span>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="p-4 h-80 overflow-y-auto bg-gray-50 space-y-3">
        {chatMessages.slice(0, visibleMessages).map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""} animate-fade-in`}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0 ${
                msg.role === "user"
                  ? "bg-gradient-to-br from-blue-500 to-blue-600"
                  : "bg-gradient-to-br from-emerald-500 to-green-500"
              }`}
            >
              {msg.role === "user" ? (
                <User className="h-4 w-4 text-white" />
              ) : (
                <Bot className="h-4 w-4 text-white" />
              )}
            </div>
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                msg.role === "user"
                  ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                  : "bg-white shadow-sm border border-gray-100 text-gray-800"
              }`}
            >
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && visibleMessages < chatMessages.length && (
          <div className={`flex gap-2 ${chatMessages[visibleMessages].role === "user" ? "flex-row-reverse" : ""}`}>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0 ${
                chatMessages[visibleMessages].role === "user"
                  ? "bg-gradient-to-br from-blue-500 to-blue-600"
                  : "bg-gradient-to-br from-emerald-500 to-green-500"
              }`}
            >
              {chatMessages[visibleMessages].role === "user" ? (
                <User className="h-4 w-4 text-white" />
              ) : (
                <Bot className="h-4 w-4 text-white" />
              )}
            </div>
            <div className="bg-white shadow-sm border border-gray-100 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-3">
          <input
            type="text"
            placeholder="הקלד הודעה..."
            className="flex-1 bg-transparent outline-none text-sm text-gray-600"
            readOnly
          />
          <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-bl from-blue-50 via-white to-gray-50">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-30"></div>
      </div>

      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/80 backdrop-blur-md shadow-sm" : ""
        }`}
      >
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-l from-blue-600 to-blue-500 bg-clip-text text-transparent">
                ChatBot
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">
                תכונות
              </a>
              <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors">
                איך זה עובד
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">
                מחירים
              </a>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="rounded-xl text-gray-600 hover:text-blue-600">
                  התחברות
                </Button>
              </Link>
              <Link href="/register">
                <Button className="rounded-xl bg-gradient-to-l from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/30">
                  הרשמה
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Right side - Text (RTL) */}
            <div className="text-right">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" />
                מבוסס בינה מלאכותית מתקדמת
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6 leading-tight">
                צ׳אטבוט חכם
                <br />
                <span className="bg-gradient-to-l from-blue-600 to-blue-500 bg-clip-text text-transparent">
                  לעסק שלך
                </span>
              </h1>

              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                צור צ׳אטבוט מותאם אישית תוך דקות. העלה מסמכים,
                הוסף לינקים, והטמע באתר שלך בשורת קוד אחת.
                הלקוחות שלך יקבלו מענה מיידי 24/7.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="rounded-xl bg-gradient-to-l from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/30 text-lg px-8 h-14"
                  >
                    התחל עכשיו - חינם
                    <ArrowLeft className="h-5 w-5 mr-2" />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-lg px-8 h-14"
                  >
                    איך זה עובד?
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  ללא כרטיס אשראי
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  הגדרה ב-5 דקות
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  תמיכה בעברית
                </div>
              </div>
            </div>

            {/* Left side - Animated Chat */}
            <div className="flex justify-center lg:justify-start">
              <div className="relative">
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-200 rounded-full blur-2xl opacity-50"></div>
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-200 rounded-full blur-2xl opacity-50"></div>

                <AnimatedChat />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              למה לבחור בנו?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              כל הכלים שאתה צריך ליצור צ׳אטבוט מקצועי לעסק שלך
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">מהיר ופשוט</h3>
              <p className="text-gray-600 leading-relaxed">
                העלה מסמכים או הוסף לינקים, והצ׳אטבוט שלך מוכן לשימוש תוך דקות ספורות
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">חכם ומדויק</h3>
              <p className="text-gray-600 leading-relaxed">
                מבוסס על טכנולוגיית AI מתקדמת שמבינה את התוכן שלך ועונה בצורה מדויקת
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/30">
                <Code className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">הטמעה קלה</h3>
              <p className="text-gray-600 leading-relaxed">
                שורת קוד אחת - זה כל מה שצריך כדי להוסיף את הצ׳אטבוט לאתר שלך
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              איך זה עובד?
            </h2>
            <p className="text-lg text-gray-600">
              ארבעה צעדים פשוטים להפעלת הצ׳אטבוט שלך
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { num: 1, title: "הירשם", desc: "צור חשבון חינמי תוך שניות" },
              { num: 2, title: "העלה תוכן", desc: "העלה מסמכים או הוסף לינקים" },
              { num: 3, title: "התאם אישית", desc: "הגדר את אופי הצ׳אטבוט" },
              { num: 4, title: "הטמע", desc: "הוסף שורת קוד לאתר שלך" },
            ].map((step) => (
              <div key={step.num} className="text-center group">
                <div className="relative mx-auto mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                    {step.num}
                  </div>
                  {step.num < 4 && (
                    <div className="hidden md:block absolute top-1/2 -left-8 w-8 h-0.5 bg-blue-200"></div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/register">
              <Button
                size="lg"
                className="rounded-xl bg-gradient-to-l from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/30 text-lg px-8"
              >
                התחל עכשיו
                <ArrowLeft className="h-5 w-5 mr-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwdjJoLTYweiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNhKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==')] opacity-50"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                מוכן להתחיל?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                הצטרף לאלפי עסקים שכבר משתמשים בצ׳אטבוט שלנו לשיפור שירות הלקוחות
              </p>
              <Link href="/register">
                <Button
                  size="lg"
                  className="rounded-xl bg-white text-blue-600 hover:bg-blue-50 shadow-lg text-lg px-8 h-14"
                >
                  התחל עכשיו - חינם
                  <ArrowLeft className="h-5 w-5 mr-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-l from-blue-600 to-blue-500 bg-clip-text text-transparent">
                ChatBot
              </span>
            </div>

            <div className="flex items-center gap-6 text-gray-500">
              <a href="#" className="hover:text-blue-600 transition-colors">תנאי שימוש</a>
              <a href="#" className="hover:text-blue-600 transition-colors">פרטיות</a>
              <a href="#" className="hover:text-blue-600 transition-colors">צור קשר</a>
            </div>

            <p className="text-gray-400 text-sm">
              © 2024 ChatBot. כל הזכויות שמורות.
            </p>
          </div>
        </div>
      </footer>

      {/* CSS for animations */}
      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
