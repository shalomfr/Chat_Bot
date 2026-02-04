"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Users,
  Database,
  TrendingUp,
  ArrowLeft,
  Settings,
  Play,
  Code,
  Sparkles,
  Bot,
  Zap
} from "lucide-react";

interface Stats {
  totalConversations: number;
  totalMessages: number;
  knowledgeSources: number;
  recentConversations: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalConversations: 0,
    totalMessages: 0,
    knowledgeSources: 0,
    recentConversations: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        if (data.userName) {
          setUserName(data.userName);
        }
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "בוקר טוב";
    if (hour < 17) return "צהריים טובים";
    if (hour < 21) return "ערב טוב";
    return "לילה טוב";
  };

  const statCards = [
    {
      title: "סה״כ שיחות",
      value: stats.totalConversations,
      icon: Users,
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
      shadowColor: "shadow-blue-500/20",
    },
    {
      title: "סה״כ הודעות",
      value: stats.totalMessages,
      icon: MessageSquare,
      gradient: "from-emerald-500 to-emerald-600",
      bgGradient: "from-emerald-50 to-emerald-100",
      shadowColor: "shadow-emerald-500/20",
    },
    {
      title: "מקורות ידע",
      value: stats.knowledgeSources,
      icon: Database,
      gradient: "from-violet-500 to-violet-600",
      bgGradient: "from-violet-50 to-violet-100",
      shadowColor: "shadow-violet-500/20",
    },
    {
      title: "שיחות היום",
      value: stats.recentConversations,
      icon: TrendingUp,
      gradient: "from-amber-500 to-orange-500",
      bgGradient: "from-amber-50 to-orange-100",
      shadowColor: "shadow-amber-500/20",
    },
  ];

  const quickActions = [
    {
      title: "הגדרות הצ׳אטבוט",
      description: "עדכן שם, הוראות ועיצוב",
      icon: Settings,
      href: "/dashboard/settings",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "מאגר ידע",
      description: "הוסף מסמכים וקישורים",
      icon: Database,
      href: "/dashboard/knowledge",
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      title: "בדיקת הצ׳אטבוט",
      description: "נסה לשוחח עם הבוט",
      icon: Play,
      href: "/dashboard/playground",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "הטמעה באתר",
      description: "קבל קוד להטמעה",
      icon: Code,
      href: "/dashboard/embed",
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-blue-600 font-medium mb-1">
          {getGreeting()}! 👋
        </p>
        <h1 className="text-3xl font-bold text-gray-800">דשבורד</h1>
        <p className="text-gray-500 mt-1">סקירה כללית של הצ׳אטבוט שלך</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((stat) => (
          <Card
            key={stat.title}
            className={`bg-gradient-to-br ${stat.bgGradient} border-0 shadow-lg ${stat.shadowColor} hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <div className="text-3xl font-bold text-gray-800">
                    {isLoading ? (
                      <div className="h-9 w-16 animate-pulse rounded-lg bg-gray-200/50"></div>
                    ) : (
                      stat.value.toLocaleString()
                    )}
                  </div>
                </div>
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.gradient} shadow-lg ${stat.shadowColor}`}>
                  <stat.icon className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Zap className="h-5 w-5 text-amber-500" />
                פעולות מהירות
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {quickActions.map((action) => (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-white hover:shadow-lg hover:border-transparent transition-all duration-300"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${action.bg} group-hover:scale-110 transition-transform`}>
                    <action.icon className={`h-6 w-6 ${action.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-500">{action.description}</p>
                  </div>
                  <ArrowLeft className="h-5 w-5 text-gray-300 group-hover:text-blue-500 group-hover:-translate-x-1 transition-all" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Getting Started / Tips */}
        <div className="space-y-6">
          {/* Pro Tips Card */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwdjJoLTYweiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNhKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==')] opacity-50"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg">טיפים לשימוש</h3>
              </div>
              <ul className="space-y-3 text-blue-100 text-sm">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-200 flex-shrink-0"></span>
                  <span>כתוב System Prompt ברור ומדויק לתשובות טובות יותר</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-200 flex-shrink-0"></span>
                  <span>העלה מסמכים מגוונים להרחבת הידע</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-200 flex-shrink-0"></span>
                  <span>עקוב אחר שיחות לקוחות לשיפור מתמיד</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Bot Status Card */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-500 shadow-lg shadow-emerald-500/30">
                  <Bot className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">הצ׳אטבוט שלך</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-sm text-emerald-600 font-medium">פעיל ומוכן</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">מקורות ידע</span>
                  <span className="font-semibold text-gray-800">{stats.knowledgeSources}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-l from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                    style={{ width: stats.knowledgeSources > 0 ? '100%' : '0%' }}
                  ></div>
                </div>
              </div>
              <Link href="/dashboard/playground">
                <Button className="w-full mt-4 bg-gradient-to-l from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl">
                  <Play className="h-4 w-4 ml-2" />
                  בדוק עכשיו
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
