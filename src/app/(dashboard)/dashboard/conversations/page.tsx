"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, MessageSquare, User, Bot } from "lucide-react";
import { formatDistanceToNow } from "@/lib/date-utils";

interface Message {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  sessionId: string;
  createdAt: string;
  messages: Message[];
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">שיחות</h1>
        <p className="text-muted-foreground">
          צפה בכל השיחות עם הצ'אטבוט שלך
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Conversations list */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>רשימת שיחות</CardTitle>
            <CardDescription>{conversations.length} שיחות</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : conversations.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 px-4">
                עדיין אין שיחות
              </p>
            ) : (
              <ScrollArea className="h-[500px]">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full p-4 text-right border-b hover:bg-muted/50 transition-colors ${
                      selectedConversation?.id === conv.id ? "bg-muted" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {conv.messages[0]?.content.slice(0, 50) || "שיחה ריקה"}...
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {conv.messages.length} הודעות • {formatDistanceToNow(conv.createdAt)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Conversation details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>פרטי שיחה</CardTitle>
            <CardDescription>
              {selectedConversation
                ? `${selectedConversation.messages.length} הודעות`
                : "בחר שיחה לצפייה"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedConversation ? (
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {selectedConversation.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${
                        msg.role === "user" ? "flex-row-reverse" : ""
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {msg.role === "user" ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </div>
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            msg.role === "user"
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          }`}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString("he-IL")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center h-[500px] text-muted-foreground">
                <MessageSquare className="h-12 w-12 mb-4" />
                <p>בחר שיחה מהרשימה לצפייה</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
