"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Upload, Link as LinkIcon, Trash2, FileText, Globe, CheckCircle, XCircle, Clock } from "lucide-react";

interface KnowledgeSource {
  id: string;
  type: string;
  name: string;
  url: string | null;
  status: string;
  error: string | null;
  createdAt: string;
}

export default function KnowledgePage() {
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isAddingUrl, setIsAddingUrl] = useState(false);
  const [url, setUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    try {
      const res = await fetch("/api/knowledge");
      if (res.ok) {
        const data = await res.json();
        setSources(data);
      }
    } catch (error) {
      console.error("Error fetching sources:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setIsUploading(true);
    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      const res = await fetch("/api/knowledge/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        toast({
          title: "הועלה בהצלחה!",
          description: "הקבצים נוספו למאגר הידע",
        });
        fetchSources();
      } else {
        const data = await res.json();
        throw new Error(data.error || "שגיאה בהעלאה");
      }
    } catch (error: any) {
      toast({
        title: "שגיאה",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleAddUrl = async () => {
    if (!url.trim()) return;

    setIsAddingUrl(true);
    try {
      const res = await fetch("/api/knowledge/url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (res.ok) {
        toast({
          title: "נוסף בהצלחה!",
          description: "הלינק נוסף למאגר הידע",
        });
        setUrl("");
        fetchSources();
      } else {
        const data = await res.json();
        throw new Error(data.error || "שגיאה בהוספת לינק");
      }
    } catch (error: any) {
      toast({
        title: "שגיאה",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsAddingUrl(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/knowledge/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setSources(sources.filter((s) => s.id !== id));
        toast({
          title: "נמחק!",
          description: "המקור הוסר ממאגר הידע",
        });
      }
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן למחוק את המקור",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ready":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "processing":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ready":
        return "מוכן";
      case "failed":
        return "נכשל";
      case "processing":
        return "מעבד...";
      default:
        return "ממתין";
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">מאגר ידע</h1>
        <p className="text-muted-foreground">
          הוסף מסמכים ולינקים כדי שהצ'אטבוט יוכל לענות עליהם
        </p>
      </div>

      <Tabs defaultValue="files" className="space-y-6">
        <TabsList>
          <TabsTrigger value="files">העלאת קבצים</TabsTrigger>
          <TabsTrigger value="urls">הוספת לינק</TabsTrigger>
        </TabsList>

        <TabsContent value="files">
          <Card>
            <CardHeader>
              <CardTitle>העלאת קבצים</CardTitle>
              <CardDescription>
                העלה קבצי PDF, TXT או DOCX
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt,.docx"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  {isUploading ? (
                    <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
                  ) : (
                    <Upload className="h-10 w-10 text-muted-foreground" />
                  )}
                  <p className="mt-2 text-sm text-muted-foreground">
                    {isUploading
                      ? "מעלה..."
                      : "לחץ לבחירת קבצים או גרור לכאן"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF, TXT, DOCX עד 10MB
                  </p>
                </label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="urls">
          <Card>
            <CardHeader>
              <CardTitle>הוספת לינק</CardTitle>
              <CardDescription>
                הוסף כתובת URL ונמשוך את התוכן אוטומטית
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/page"
                  dir="ltr"
                />
                <Button onClick={handleAddUrl} disabled={isAddingUrl || !url.trim()}>
                  {isAddingUrl ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <LinkIcon className="h-4 w-4 ml-2" />
                      הוסף
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>מקורות ידע ({sources.length})</CardTitle>
          <CardDescription>כל המקורות שנוספו לצ'אטבוט</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : sources.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              עדיין לא נוספו מקורות ידע
            </p>
          ) : (
            <div className="space-y-3">
              {sources.map((source) => (
                <div
                  key={source.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {source.type === "file" ? (
                      <FileText className="h-5 w-5 text-blue-500" />
                    ) : (
                      <Globe className="h-5 w-5 text-green-500" />
                    )}
                    <div>
                      <p className="font-medium">{source.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {getStatusIcon(source.status)}
                        <span>{getStatusText(source.status)}</span>
                        {source.error && (
                          <span className="text-red-500">({source.error})</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(source.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
