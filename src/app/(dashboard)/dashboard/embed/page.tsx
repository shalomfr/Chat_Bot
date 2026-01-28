"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Copy, Check, Code, Eye } from "lucide-react";

export default function EmbedPage() {
  const [chatbotId, setChatbotId] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  useEffect(() => {
    fetchChatbotId();
  }, []);

  const fetchChatbotId = async () => {
    try {
      const res = await fetch("/api/chatbot");
      if (res.ok) {
        const data = await res.json();
        setChatbotId(data.id);
      }
    } catch (error) {
      console.error("Error fetching chatbot:", error);
    }
  };

  const embedCode = `<script
  src="${appUrl}/widget/chatbot.js"
  data-chatbot-id="${chatbotId}"
  async
></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    toast({
      title: "הועתק!",
      description: "קוד ההטמעה הועתק ללוח",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">הטמעת הצ'אטבוט</h1>
        <p className="text-muted-foreground">
          הוסף את הצ'אטבוט לאתר שלך בקלות
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              קוד הטמעה
            </CardTitle>
            <CardDescription>
              העתק את הקוד הזה והדבק אותו לפני תג ה-{"</body>"} באתר שלך
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm" dir="ltr">
                <code>{embedCode}</code>
              </pre>
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-2 left-2"
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 ml-1" />
                    הועתק
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 ml-1" />
                    העתק
                  </>
                )}
              </Button>
            </div>

            <div className="mt-6 space-y-4">
              <h4 className="font-medium">הוראות הטמעה:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>העתק את קוד ההטמעה למעלה</li>
                <li>פתח את קובץ ה-HTML של האתר שלך</li>
                <li>הדבק את הקוד לפני תג ה-{"</body>"}</li>
                <li>שמור ורענן את הדף</li>
                <li>הווידג'ט יופיע בפינה הימנית התחתונה</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              תצוגה מקדימה
            </CardTitle>
            <CardDescription>
              ראה איך הווידג'ט ייראה באתר שלך
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg h-[400px] overflow-hidden">
              {/* Simulated website */}
              <div className="p-4">
                <div className="h-8 w-32 bg-gray-300 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-300 rounded"></div>
                  <div className="h-4 w-3/4 bg-gray-300 rounded"></div>
                  <div className="h-4 w-5/6 bg-gray-300 rounded"></div>
                </div>
              </div>

              {/* Widget preview */}
              {showPreview ? (
                <div className="absolute bottom-4 left-4 w-80 bg-white rounded-lg shadow-xl border">
                  <div className="bg-primary text-primary-foreground p-3 rounded-t-lg flex items-center justify-between">
                    <span className="font-medium">צ'אטבוט</span>
                    <button
                      onClick={() => setShowPreview(false)}
                      className="text-primary-foreground/70 hover:text-primary-foreground"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="p-4 h-48 flex items-center justify-center text-muted-foreground text-sm">
                    תצוגה מקדימה של הצ'אט
                  </div>
                  <div className="p-3 border-t flex gap-2">
                    <input
                      type="text"
                      placeholder="כתוב הודעה..."
                      className="flex-1 px-3 py-2 border rounded-md text-sm"
                      disabled
                    />
                    <button className="bg-primary text-primary-foreground px-3 py-2 rounded-md text-sm">
                      שלח
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowPreview(true)}
                  className="absolute bottom-4 left-4 w-14 h-14 bg-primary rounded-full shadow-lg flex items-center justify-center text-primary-foreground hover:scale-110 transition-transform"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </button>
              )}
            </div>

            <p className="text-sm text-muted-foreground mt-4 text-center">
              לחץ על הכפתור לפתיחת הצ'אט
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>מזהה הצ'אטבוט</CardTitle>
          <CardDescription>
            השתמש במזהה זה אם אתה צריך לגשת ל-API ישירות
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <code className="bg-muted px-3 py-2 rounded font-mono text-sm" dir="ltr">
              {chatbotId || "טוען..."}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(chatbotId);
                toast({ title: "הועתק!" });
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
