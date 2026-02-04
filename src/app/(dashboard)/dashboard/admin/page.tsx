"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Trash2, Shield, ShieldOff, Loader2, Users, CheckCircle, XCircle } from "lucide-react";

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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">ניהול משתמשים</h1>
        <p className="text-muted-foreground">
          צפה ונהל את כל המשתמשים במערכת
        </p>
      </div>

      {/* Pending Users Section */}
      {pendingUsers.length > 0 && (
        <Card className="mb-6 border-yellow-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <Users className="h-5 w-5" />
              ממתינים לאישור ({pendingUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500 text-white">
                      {(user.name || user.email || "?")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{user.name || "ללא שם"}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        נרשם: {new Date(user.createdAt).toLocaleDateString("he-IL")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => toggleApproval(user.id, user.isApproved)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 ml-1" />
                      אשר
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteUser(user.id, user.name)}
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            משתמשים מאושרים ({approvedUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {approvedUsers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              אין משתמשים מאושרים
            </p>
          ) : (
            <div className="space-y-3">
              {approvedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        user.isAdmin
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted-foreground/20"
                      }`}
                    >
                      {(user.name || user.email || "?")[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{user.name || "ללא שם"}</p>
                        {user.isAdmin && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                            מנהל
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {user._count.chatbots} צ'אטבוטים • נרשם:{" "}
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
                    >
                      <XCircle className="h-4 w-4 text-yellow-500" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteUser(user.id, user.name)}
                      title="מחק משתמש"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
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
