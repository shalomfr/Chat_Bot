"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2,
  BarChart3,
  DollarSign,
  Zap,
  Users,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  User,
  Bot,
  X,
  Eye,
} from "lucide-react";

interface UserUsage {
  id: string;
  name: string | null;
  email: string | null;
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  totalCost: number;
  conversationsCount: number;
  messagesCount: number;
  lastActivity: string | null;
}

interface Totals {
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  totalCost: number;
  totalConversations: number;
  totalMessages: number;
  activeUsers: number;
}

interface Message {
  id: string;
  role: string;
  content: string;
  contentPreview?: string;
  promptTokens: number | null;
  completionTokens: number | null;
  totalTokens: number | null;
  cost: number | null;
  model: string | null;
  createdAt: string;
}

interface ConversationDetail {
  id: string;
  chatbotName: string;
  messagesCount: number;
  assistantMessagesCount: number;
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  cost: number;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

interface UserDetails {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    createdAt: string;
  };
  totals: {
    totalTokens: number;
    promptTokens: number;
    completionTokens: number;
    totalCost: number;
    conversationsCount: number;
  };
  conversations: ConversationDetail[];
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

function formatCost(cost: number): string {
  if (cost === 0) return "$0";
  if (cost < 0.01) {
    return "$" + cost.toFixed(6);
  }
  return "$" + cost.toFixed(4);
}

export default function AdminUsagePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [users, setUsers] = useState<UserUsage[]>([]);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<ConversationDetail | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      const res = await fetch("/api/admin/usage");
      if (res.ok) {
        const data = await res.json();
        setTotals(data.totals);
        setUsers(data.users);
      } else if (res.status === 403) {
        toast({
          title: "אין הרשאה",
          description: "אין לך הרשאות מנהל לצפות בנתוני שימוש",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching usage:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לטעון את נתוני השימוש",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserDetails = async (userId: string) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
      setUserDetails(null);
      return;
    }

    setExpandedUser(userId);
    setLoadingDetails(true);
    setUserDetails(null);

    try {
      const res = await fetch(`/api/admin/usage/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setUserDetails(data);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לטעון את פרטי המשתמש",
        variant: "destructive",
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-blue-500 mx-auto mb-3 sm:mb-4" />
          <p className="text-gray-500 text-sm sm:text-base">טוען נתוני שימוש...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-start sm:items-center gap-3 mb-2">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/30 flex-shrink-0">
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">שימוש בטוקנים</h1>
            <p className="text-sm sm:text-base text-gray-500">מעקב שימוש ועלויות OpenRouter לכל המשתמשים</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      {totals && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100">
            <CardContent className="p-3 sm:p-5">
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/30 flex-shrink-0">
                  <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">סה״כ טוקנים</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800">{formatNumber(totals.totalTokens)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-green-100">
            <CardContent className="p-3 sm:p-5">
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 shadow-lg shadow-emerald-500/30 flex-shrink-0">
                  <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">עלות כוללת</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800">{formatCost(totals.totalCost)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-violet-50 to-purple-100">
            <CardContent className="p-3 sm:p-5">
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-lg shadow-violet-500/30 flex-shrink-0">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">משתמשים פעילים</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800">{totals.activeUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-100">
            <CardContent className="p-3 sm:p-5">
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/30 flex-shrink-0">
                  <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 truncate">שיחות</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800">{totals.totalConversations}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Token Breakdown */}
      {totals && (
        <Card className="mb-6 border-0 shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-l from-blue-500 to-indigo-500"></div>
          <CardHeader className="pb-3 p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl text-gray-800">פירוט טוקנים</CardTitle>
            <CardDescription className="text-sm">חלוקה בין טוקני קלט לפלט</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-blue-600 mb-1">טוקני קלט (Input)</p>
                <p className="text-2xl font-bold text-blue-700">{formatNumber(totals.promptTokens)}</p>
                <p className="text-xs text-blue-500 mt-1">$0.000003 / טוקן</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4">
                <p className="text-sm text-emerald-600 mb-1">טוקני פלט (Output)</p>
                <p className="text-2xl font-bold text-emerald-700">{formatNumber(totals.completionTokens)}</p>
                <p className="text-xs text-emerald-500 mt-1">$0.000015 / טוקן</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users List */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-l from-emerald-500 to-green-500"></div>
        <CardHeader className="pb-3 p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-gray-800 text-lg sm:text-xl">
            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />
            שימוש לפי משתמש ({users.length})
          </CardTitle>
          <CardDescription className="text-sm">לחץ על משתמש לצפייה בפרטי השיחות, ואז על שיחה לצפייה בהודעות</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          {users.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-gray-100 mx-auto mb-3 sm:mb-4">
                <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium text-sm sm:text-base">אין נתוני שימוש עדיין</p>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">נתונים יופיעו כאן לאחר שמשתמשים ישלחו הודעות</p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {users.map((user) => (
                <div key={user.id}>
                  <div
                    onClick={() => fetchUserDetails(user.id)}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-xl cursor-pointer transition-colors gap-3 ${
                      expandedUser === user.id
                        ? "bg-blue-50 border border-blue-200"
                        : "bg-gray-50 hover:bg-blue-50/50"
                    }`}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-semibold shadow-lg shadow-blue-500/20 flex-shrink-0 text-sm sm:text-base">
                        {(user.name || user.email || "?")[0].toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                          {user.name || "ללא שם"}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
                      <div className="text-right">
                        <p className="text-sm sm:text-base font-semibold text-gray-800">
                          {formatNumber(user.totalTokens)} טוקנים
                        </p>
                        <p className="text-xs text-emerald-600">{formatCost(user.totalCost)}</p>
                      </div>
                      <div className="text-right hidden sm:block">
                        <p className="text-sm text-gray-500">{user.conversationsCount} שיחות</p>
                        <p className="text-xs text-gray-400">{user.messagesCount} הודעות</p>
                      </div>
                      <Button variant="ghost" size="icon" className="rounded-xl h-8 w-8">
                        {expandedUser === user.id ? (
                          <ChevronUp className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded User Details */}
                  {expandedUser === user.id && (
                    <div className="mt-2 mr-4 sm:mr-14 bg-white rounded-xl border border-gray-100 shadow-sm">
                      {loadingDetails ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                        </div>
                      ) : userDetails ? (
                        <div className="p-4">
                          {/* User Summary */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                            <div className="bg-gray-50 rounded-lg p-3 text-center">
                              <p className="text-xs text-gray-500">טוקני קלט</p>
                              <p className="text-sm font-semibold">{formatNumber(userDetails.totals.promptTokens)}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3 text-center">
                              <p className="text-xs text-gray-500">טוקני פלט</p>
                              <p className="text-sm font-semibold">{formatNumber(userDetails.totals.completionTokens)}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3 text-center">
                              <p className="text-xs text-gray-500">סה״כ טוקנים</p>
                              <p className="text-sm font-semibold">{formatNumber(userDetails.totals.totalTokens)}</p>
                            </div>
                            <div className="bg-emerald-50 rounded-lg p-3 text-center">
                              <p className="text-xs text-emerald-600">עלות</p>
                              <p className="text-sm font-semibold text-emerald-700">{formatCost(userDetails.totals.totalCost)}</p>
                            </div>
                          </div>

                          {/* Conversations */}
                          <p className="text-sm font-medium text-gray-700 mb-2">שיחות ({userDetails.conversations.length})</p>
                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {userDetails.conversations.length === 0 ? (
                              <p className="text-sm text-gray-400 text-center py-4">אין שיחות</p>
                            ) : (
                              userDetails.conversations.map((conv) => (
                                <div
                                  key={conv.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedConversation(conv);
                                  }}
                                  className="bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-blue-50 transition-colors group"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-gray-600">{conv.chatbotName}</span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-gray-400">
                                        {new Date(conv.updatedAt).toLocaleDateString("he-IL")}
                                      </span>
                                      <Eye className="h-3.5 w-3.5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <span>{conv.messagesCount} הודעות</span>
                                    <span>{formatNumber(conv.totalTokens)} טוקנים</span>
                                    <span className="text-emerald-600">{formatCost(conv.cost)}</span>
                                  </div>
                                  {/* Preview of first message */}
                                  {conv.messages.length > 0 && (
                                    <p className="text-xs text-gray-400 mt-2 truncate">
                                      {conv.messages[0].contentPreview || conv.messages[0].content.slice(0, 100)}...
                                    </p>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conversation History Modal */}
      <Dialog open={!!selectedConversation} onOpenChange={() => setSelectedConversation(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              היסטוריית שיחה - {selectedConversation?.chatbotName}
            </DialogTitle>
            <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
              <span>{selectedConversation?.messagesCount} הודעות</span>
              <span>{formatNumber(selectedConversation?.totalTokens || 0)} טוקנים</span>
              <span className="text-emerald-600">{formatCost(selectedConversation?.cost || 0)}</span>
              <span>
                {selectedConversation?.updatedAt && new Date(selectedConversation.updatedAt).toLocaleDateString("he-IL", {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto mt-4 space-y-4 pr-2">
            {selectedConversation?.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0 ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-blue-500 to-indigo-500"
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
                  className={`flex-1 rounded-xl p-4 ${
                    msg.role === "user"
                      ? "bg-blue-50 border border-blue-100"
                      : "bg-gray-50 border border-gray-100"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500">
                      {msg.role === "user" ? "משתמש" : "בוט"}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(msg.createdAt).toLocaleTimeString("he-IL", {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">{msg.content}</p>
                  {msg.role === "assistant" && msg.totalTokens && (
                    <div className="flex items-center gap-3 mt-3 pt-2 border-t border-gray-200 text-xs text-gray-400">
                      <span>קלט: {msg.promptTokens}</span>
                      <span>פלט: {msg.completionTokens}</span>
                      <span>סה״כ: {msg.totalTokens}</span>
                      {msg.cost && <span className="text-emerald-500">{formatCost(msg.cost)}</span>}
                      {msg.model && <span className="text-gray-300">{msg.model.split('/')[1]}</span>}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
