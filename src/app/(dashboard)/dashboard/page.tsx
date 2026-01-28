"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Users, Database, TrendingUp } from "lucide-react";

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

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: "סה\"כ שיחות",
      value: stats.totalConversations,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "סה\"כ הודעות",
      value: stats.totalMessages,
      icon: MessageSquare,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "מקורות ידע",
      value: stats.knowledgeSources,
      icon: Database,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "שיחות היום",
      value: stats.recentConversations,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">דשבורד</h1>
        <p className="text-muted-foreground">
          סקירה כללית של הצ'אטבוט שלך
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={cn(stat.bgColor, "rounded-lg p-2")}>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <div className="h-8 w-16 animate-pulse rounded bg-gray-200"></div>
                ) : (
                  stat.value.toLocaleString()
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>מתחילים?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                1
              </div>
              <div>
                <h3 className="font-medium">הגדר את הצ'אטבוט</h3>
                <p className="text-sm text-muted-foreground">
                  עדכן את השם, ההוראות והעיצוב
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                2
              </div>
              <div>
                <h3 className="font-medium">הוסף מקורות ידע</h3>
                <p className="text-sm text-muted-foreground">
                  העלה קבצים או הוסף לינקים
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                3
              </div>
              <div>
                <h3 className="font-medium">בדוק את הצ'אטבוט</h3>
                <p className="text-sm text-muted-foreground">
                  נסה לשאול שאלות ב-Playground
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                4
              </div>
              <div>
                <h3 className="font-medium">הטמע באתר שלך</h3>
                <p className="text-sm text-muted-foreground">
                  העתק את קוד ההטמעה לאתר
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>טיפים</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">System Prompt מדויק:</span>{" "}
              כתוב הוראות ברורות לצ'אטבוט כדי לקבל תשובות טובות יותר.
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">מקורות ידע מגוונים:</span>{" "}
              העלה מסמכים שונים כדי להרחיב את הידע של הצ'אטבוט.
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">עקוב אחר שיחות:</span>{" "}
              צפה בשיחות עם לקוחות כדי להבין מה הם שואלים ולשפר.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
