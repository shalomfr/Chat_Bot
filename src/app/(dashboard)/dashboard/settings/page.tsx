"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Save } from "lucide-react";

interface ChatbotSettings {
  id: string;
  name: string;
  systemPrompt: string | null;
  welcomeMessage: string | null;
  primaryColor: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<ChatbotSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/chatbot");
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לטעון את ההגדרות",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/chatbot", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        toast({
          title: "נשמר!",
          description: "ההגדרות עודכנו בהצלחה",
        });
      } else {
        throw new Error();
      }
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור את ההגדרות",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">לא נמצא צ'אטבוט</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">הגדרות צ'אטבוט</h1>
          <p className="text-muted-foreground">
            התאם את הצ'אטבוט לצרכים שלך
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              שומר...
            </>
          ) : (
            <>
              <Save className="ml-2 h-4 w-4" />
              שמור שינויים
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>פרטים בסיסיים</CardTitle>
            <CardDescription>שם הצ'אטבוט והודעת הפתיחה</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">שם הצ'אטבוט</Label>
              <Input
                id="name"
                value={settings.name}
                onChange={(e) =>
                  setSettings({ ...settings, name: e.target.value })
                }
                placeholder="שם הצ'אטבוט"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="welcomeMessage">הודעת פתיחה</Label>
              <Input
                id="welcomeMessage"
                value={settings.welcomeMessage || ""}
                onChange={(e) =>
                  setSettings({ ...settings, welcomeMessage: e.target.value })
                }
                placeholder="שלום! איך אוכל לעזור?"
              />
              <p className="text-sm text-muted-foreground">
                ההודעה שתוצג למשתמש כשהצ'אט נפתח
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Prompt</CardTitle>
            <CardDescription>
              הוראות לצ'אטבוט - איך להתנהג ולענות
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="systemPrompt">הוראות</Label>
              <Textarea
                id="systemPrompt"
                value={settings.systemPrompt || ""}
                onChange={(e) =>
                  setSettings({ ...settings, systemPrompt: e.target.value })
                }
                placeholder="אתה עוזר וירטואלי מועיל. ענה על שאלות בצורה ברורה ומועילה."
                rows={6}
              />
              <p className="text-sm text-muted-foreground">
                כתוב הוראות ברורות לצ'אטבוט: באיזו שפה לענות, איזה סגנון לשמור, ומה להימנע ממנו
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>עיצוב</CardTitle>
            <CardDescription>התאם את המראה של הווידג'ט</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="primaryColor">צבע ראשי</Label>
              <div className="flex gap-3">
                <Input
                  id="primaryColor"
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) =>
                    setSettings({ ...settings, primaryColor: e.target.value })
                  }
                  className="w-16 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={settings.primaryColor}
                  onChange={(e) =>
                    setSettings({ ...settings, primaryColor: e.target.value })
                  }
                  placeholder="#3B82F6"
                  dir="ltr"
                  className="max-w-32"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
