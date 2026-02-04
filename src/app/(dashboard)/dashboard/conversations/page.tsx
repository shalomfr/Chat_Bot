"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import {
  Loader2,
  MessageSquare,
  User,
  Bot,
  Trash2,
  MessagesSquare,
  Clock,
  AlertCircle,
} from "lucide-react";
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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

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

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selecting the conversation

    if (!confirm("האם אתה בטוח שברצונך למחוק שיחה זו?")) {
      return;
    }

    setDeletingId(id);

    try {
      const res = await fetch(`/api/conversations/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setConversations(conversations.filter((c) => c.id !== id));
        if (selectedConversation?.id === id) {
          setSelectedConversation(null);
        }
        toast({
          title: "השיחה נמחקה",
          description: "השיחה הוסרה בהצלחה",
        });
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן למחוק את השיחה",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm("האם אתה בטוח שברצונך למחוק את כל השיחות? פעולה זו בלתי הפיכה.")) {
      return;
    }

    setIsLoading(true);

    try {
      // Delete all conversations one by one
      for (const conv of conversations) {
        await fetch(`/api/conversations/${conv.id}`, {
          method: "DELETE",
        });
      }

      setConversations([]);
      setSelectedConversation(null);
      toast({
        title: "כל השיחות נמחקו",
        description: "היסטוריית השיחות נוקתה בהצלחה",
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן למחוק את כל השיחות",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
              <MessagesSquare className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">שיחות</h1>
              <p className="text-gray-500">צפה בכל השיחות עם הצ׳אטבוט שלך</p>
            </div>
          </div>
          {conversations.length > 0 && (
            <Button
              variant="outline"
              onClick={handleDeleteAll}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
            >
              <Trash2 className="h-4 w-4 ml-2" />
              מחק הכל
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/30">
                <MessagesSquare className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">סה״כ שיחות</p>
                <p className="text-2xl font-bold text-gray-800">{conversations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-green-100">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 shadow-lg shadow-emerald-500/30">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">סה״כ הודעות</p>
                <p className="text-2xl font-bold text-gray-800">
                  {conversations.reduce((acc, c) => acc + c.messages.length, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Conversations list */}
        <Card className="lg:col-span-1 border-0 shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-l from-blue-500 to-indigo-500"></div>
          <CardHeader>
            <CardTitle className="text-gray-800">רשימת שיחות</CardTitle>
            <CardDescription>{conversations.length} שיחות</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
                <p className="text-gray-500">טוען שיחות...</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 mb-4">
                  <MessagesSquare className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">עדיין אין שיחות</p>
                <p className="text-sm text-gray-400 mt-1">שיחות עם הצ׳אטבוט יופיעו כאן</p>
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="ps-2">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`group w-full p-4 text-right border-b border-gray-100 hover:bg-blue-50/50 transition-colors cursor-pointer ${
                      selectedConversation?.id === conv.id ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        selectedConversation?.id === conv.id
                          ? "bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/30"
                          : "bg-gray-100"
                      }`}>
                        <MessageSquare className={`h-5 w-5 ${
                          selectedConversation?.id === conv.id ? "text-white" : "text-gray-500"
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">
                          {conv.messages[0]?.content.slice(0, 40) || "שיחה ריקה"}...
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>{conv.messages.length} הודעות</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(conv.createdAt)}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDelete(conv.id, e)}
                        disabled={deletingId === conv.id}
                        className="opacity-0 group-hover:opacity-100 transition-opacity rounded-xl hover:bg-red-100"
                      >
                        {deletingId === conv.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-red-500" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Conversation details */}
        <Card className="lg:col-span-2 border-0 shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-l from-emerald-500 to-green-500"></div>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-gray-800">פרטי שיחה</CardTitle>
              <CardDescription>
                {selectedConversation
                  ? `${selectedConversation.messages.length} הודעות`
                  : "בחר שיחה לצפייה"}
              </CardDescription>
            </div>
            {selectedConversation && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => handleDelete(selectedConversation.id, e)}
                disabled={deletingId === selectedConversation.id}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
              >
                {deletingId === selectedConversation.id ? (
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                ) : (
                  <Trash2 className="h-4 w-4 ml-2" />
                )}
                מחק שיחה
              </Button>
            )}
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
                        className={`flex h-9 w-9 items-center justify-center rounded-xl shadow-lg ${
                          msg.role === "user"
                            ? "bg-gradient-to-br from-blue-500 to-indigo-500 shadow-blue-500/30"
                            : "bg-gradient-to-br from-emerald-500 to-green-500 shadow-emerald-500/30"
                        }`}
                      >
                        {msg.role === "user" ? (
                          <User className="h-4 w-4 text-white" />
                        ) : (
                          <Bot className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <div
                        className={`max-w-[80%] rounded-2xl p-4 ${
                          msg.role === "user"
                            ? "bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/20"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <p
                          className={`text-xs mt-2 ${
                            msg.role === "user"
                              ? "text-blue-100"
                              : "text-gray-500"
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
              <div className="flex flex-col items-center justify-center h-[500px]">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-100 mb-4">
                  <MessageSquare className="h-10 w-10 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">בחר שיחה מהרשימה</p>
                <p className="text-sm text-gray-400 mt-1">לחץ על שיחה כדי לצפות בפרטים</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
