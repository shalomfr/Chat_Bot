"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Trash2,
  Shield,
  ShieldOff,
  Loader2,
  Users,
  CheckCircle,
  XCircle,
  UserPlus,
  Clock,
  UserCheck,
} from "lucide-react";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  isAdmin: boolean;
  isApproved: boolean;
  createdAt: string;
  _count: {
    chatbots: number;
  };
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else if (res.status === 403) {
        toast({
          title: "אין הרשאה",
          description: "אין לך הרשאות מנהל",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לטעון את רשימת המשתמשים",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAdmin = async (userId: string, currentIsAdmin: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAdmin: !currentIsAdmin }),
      });

      if (res.ok) {
        const updated = await res.json();
        setUsers(users.map((u) => (u.id === userId ? updated : u)));
        toast({
          title: currentIsAdmin ? "הרשאת מנהל הוסרה" : "הפך למנהל",
          description: `המשתמש ${currentIsAdmin ? "כבר לא" : "הפך ל"}מנהל`,
        });
      } else {
        const error = await res.json();
        toast({
          title: "שגיאה",
          description: error.error || "לא ניתן לעדכן את המשתמש",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לעדכן את המשתמש",
        variant: "destructive",
      });
    }
  };

  const toggleApproval = async (userId: string, currentIsApproved: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: !currentIsApproved }),
      });

      if (res.ok) {
        const updated = await res.json();
        setUsers(users.map((u) => (u.id === userId ? updated : u)));
        toast({
          title: currentIsApproved ? "אישור בוטל" : "משתמש אושר",
          description: currentIsApproved
            ? "המשתמש יצטרך לחכות לאישור מחדש"
            : "המשתמש יכול עכשיו להשתמש במערכת",
        });
      } else {
        const error = await res.json();
        toast({
          title: "שגיאה",
          description: error.error || "לא ניתן לעדכן את המשתמש",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לעדכן את המשתמש",
        variant: "destructive",
      });
    }
  };

  const deleteUser = async (userId: string, userName: string | null) => {
    if (!confirm(`האם אתה בטוח שברצונך למחוק את ${userName || "משתמש זה"}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setUsers(users.filter((u) => u.id !== userId));
        toast({
          title: "משתמש נמחק",
          description: "המשתמש וכל הנתונים שלו נמחקו",
        });
      } else {
        const error = await res.json();
        toast({
          title: "שגיאה",
          description: error.error || "לא ניתן למחוק את המשתמש",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן למחוק את המשתמש",
        variant: "destructive",
      });
    }
  };

  const pendingUsers = users.filter((u) => !u.isApproved);
  const approvedUsers = users.filter((u) => u.isApproved);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-500">טוען משתמשים...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">ניהול משתמשים</h1>
            <p className="text-gray-500">צפה ונהל את כל המשתמשים במערכת</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-100">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/30">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">ממתינים לאישור</p>
                <p className="text-2xl font-bold text-gray-800">{pendingUsers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-green-100">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 shadow-lg shadow-emerald-500/30">
                <UserCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">משתמשים מאושרים</p>
                <p className="text-2xl font-bold text-gray-800">{approvedUsers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/30">
                <UserPlus className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">סה״כ משתמשים</p>
                <p className="text-2xl font-bold text-gray-800">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Users Section */}
      {pendingUsers.length > 0 && (
        <Card className="mb-6 border-0 shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-l from-amber-500 to-orange-500"></div>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Clock className="h-5 w-5 text-amber-500" />
              ממתינים לאישור ({pendingUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 bg-gradient-to-l from-amber-50 to-orange-50 rounded-xl border border-amber-100"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white font-semibold shadow-lg shadow-amber-500/20">
                      {(user.name || user.email || "?")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{user.name || "ללא שם"}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <p className="text-xs text-gray-400">
                        נרשם: {new Date(user.createdAt).toLocaleDateString("he-IL")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => toggleApproval(user.id, user.isApproved)}
                      className="bg-gradient-to-l from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-xl shadow-lg shadow-emerald-500/30"
                    >
                      <CheckCircle className="h-4 w-4 ml-1" />
                      אשר
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteUser(user.id, user.name)}
                      className="rounded-xl"
                    >
                      <Trash2 className="h-4 w-4 ml-1" />
                      דחה
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approved Users Section */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-l from-blue-500 to-indigo-500"></div>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <UserCheck className="h-5 w-5 text-blue-500" />
            משתמשים מאושרים ({approvedUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {approvedUsers.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 mx-auto mb-4">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500">אין משתמשים מאושרים</p>
            </div>
          ) : (
            <div className="space-y-3">
              {approvedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-blue-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl font-semibold shadow-lg ${
                        user.isAdmin
                          ? "bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-blue-500/20"
                          : "bg-gradient-to-br from-gray-400 to-gray-500 text-white shadow-gray-500/20"
                      }`}
                    >
                      {(user.name || user.email || "?")[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-800">{user.name || "ללא שם"}</p>
                        {user.isAdmin && (
                          <span className="text-[10px] bg-gradient-to-l from-blue-500 to-indigo-500 text-white px-2 py-0.5 rounded-full font-medium">
                            מנהל
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <p className="text-xs text-gray-400">
                        {user._count.chatbots} צ׳אטבוטים • נרשם:{" "}
                        {new Date(user.createdAt).toLocaleDateString("he-IL")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => toggleAdmin(user.id, user.isAdmin)}
                      title={user.isAdmin ? "הסר הרשאת מנהל" : "הפוך למנהל"}
                      className="rounded-xl hover:bg-blue-100"
                    >
                      {user.isAdmin ? (
                        <ShieldOff className="h-4 w-4 text-orange-500" />
                      ) : (
                        <Shield className="h-4 w-4 text-blue-500" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => toggleApproval(user.id, user.isApproved)}
                      title="בטל אישור"
                      className="rounded-xl hover:bg-amber-100"
                    >
                      <XCircle className="h-4 w-4 text-amber-500" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteUser(user.id, user.name)}
                      title="מחק משתמש"
                      className="rounded-xl hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
