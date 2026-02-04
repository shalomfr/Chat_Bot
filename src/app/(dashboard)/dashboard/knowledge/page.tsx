"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import {
  Loader2,
  Upload,
  Link as LinkIcon,
  Trash2,
  FileText,
  Globe,
  CheckCircle,
  XCircle,
  Clock,
  Database,
  FolderOpen,
  Plus,
  RefreshCw,
} from "lucide-react";

interface KnowledgeSource {
  id: string;
  type: string;
  name: string;
  url: string | null;
  status: string;
  error: string | null;
  createdAt: string;
}

// Polling interval in milliseconds
const POLL_INTERVAL = 3000;

export default function KnowledgePage() {
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isAddingUrl, setIsAddingUrl] = useState(false);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Check if there are sources being processed
  const hasProcessingSources = sources.some(
    s => s.status === "processing" || s.status === "pending"
  );

  // Fetch sources
  const fetchSources = useCallback(async () => {
    try {
      const res = await fetch("/api/knowledge");
      if (res.ok) {
        const data = await res.json();
        setSources(data);
        return data;
      }
    } catch (error) {
      console.error("Error fetching sources:", error);
    }
    return null;
  }, []);

  // Start/stop polling based on processing status
  useEffect(() => {
    if (hasProcessingSources && !pollingRef.current) {
      console.log("Starting polling for status updates...");
      pollingRef.current = setInterval(fetchSources, POLL_INTERVAL);
    } else if (!hasProcessingSources && pollingRef.current) {
      console.log("Stopping polling - no more processing sources");
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [hasProcessingSources, fetchSources]);

  // Initial fetch
  useEffect(() => {
    fetchSources().finally(() => setIsLoading(false));
  }, [fetchSources]);


  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setIsUploading(true);
    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      // Step 1: Upload files (quick - just saves to DB)
      const res = await fetch("/api/knowledge/upload", {
        method: "POST",
        body: formData,
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("השרת לא הגיב כראוי. נסה שוב.");
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "שגיאה בהעלאה");
      }

      // Add uploaded sources to local state - cron will process them
      const uploadedSources = Array.isArray(data) ? data : [data];
      setSources(prev => [...uploadedSources, ...prev]);

      toast({
        title: "הקבצים נשמרו",
        description: "הקבצים יעובדו בקרוב אוטומטית",
      });

    } catch (error: any) {
      toast({
        title: "שגיאה",
        description: error.message || "שגיאה בהעלאת הקובץ",
        variant: "destructive",
      });
      fetchSources();
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

      // Check if response is JSON
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("השרת לא הגיב כראוי. נסה שוב.");
      }

      const data = await res.json();

      if (res.ok) {
        toast({
          title: "נוסף בהצלחה!",
          description: "הלינק נוסף למאגר הידע",
        });
        setUrl("");
        fetchSources();
      } else {
        throw new Error(data.error || "שגיאה בהוספת לינק");
      }
    } catch (error: any) {
      toast({
        title: "שגיאה",
        description: error.message || "שגיאה בהוספת לינק",
        variant: "destructive",
      });
      fetchSources(); // Refresh to see if source was added
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

  const handleRetry = async (id: string) => {
    setRetryingId(id);

    // Update local state to show processing
    setSources(sources.map(s =>
      s.id === id ? { ...s, status: "processing", error: null } : s
    ));

    try {
      const res = await fetch(`/api/knowledge/${id}/retry`, {
        method: "POST",
      });

      if (res.ok) {
        const updatedSource = await res.json();
        setSources(sources.map(s =>
          s.id === id ? updatedSource : s
        ));

        if (updatedSource.status === "ready") {
          toast({
            title: "עובד!",
            description: "המקור עובד בהצלחה",
          });
        } else {
          toast({
            title: "נכשל",
            description: updatedSource.error || "העיבוד נכשל",
            variant: "destructive",
          });
        }
      } else {
        throw new Error("Failed to retry");
      }
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לעבד את המקור",
        variant: "destructive",
      });
      fetchSources(); // Refresh to get actual state
    } finally {
      setRetryingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ready":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
            <CheckCircle className="h-3.5 w-3.5" />
            מוכן
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <XCircle className="h-3.5 w-3.5" />
            נכשל
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            מעבד...
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            <Clock className="h-3.5 w-3.5" />
            ממתין
          </span>
        );
    }
  };

  const readyCount = sources.filter((s) => s.status === "ready").length;
  const processingCount = sources.filter((s) => s.status === "processing").length;
  const pendingCount = sources.filter((s) => s.status === "pending").length;
  const failedCount = sources.filter((s) => s.status === "failed").length;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
            <Database className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">מאגר ידע</h1>
            <p className="text-gray-500">הוסף מסמכים ולינקים כדי שהצ׳אטבוט יוכל לענות עליהם</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-violet-50 to-purple-100">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
                <FolderOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">סה״כ מקורות</p>
                <p className="text-2xl font-bold text-gray-800">{sources.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-green-100">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 shadow-lg shadow-emerald-500/30">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">מוכנים</p>
                <p className="text-2xl font-bold text-gray-800">{readyCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/30">
                <Loader2 className={`h-6 w-6 text-white ${processingCount > 0 ? "animate-spin" : ""}`} />
              </div>
              <div>
                <p className="text-sm text-gray-600">בעיבוד</p>
                <p className="text-2xl font-bold text-gray-800">{processingCount + pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-orange-100">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg shadow-red-500/30">
                <XCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">נכשלו</p>
                <p className="text-2xl font-bold text-gray-800">{failedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="files" className="space-y-6">
        <TabsList className="bg-white shadow-sm border-0 p-1 rounded-xl">
          <TabsTrigger
            value="files"
            className="rounded-lg data-[state=active]:bg-gradient-to-l data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
          >
            <Upload className="h-4 w-4 ml-2" />
            העלאת קבצים
          </TabsTrigger>
          <TabsTrigger
            value="urls"
            className="rounded-lg data-[state=active]:bg-gradient-to-l data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
          >
            <LinkIcon className="h-4 w-4 ml-2" />
            הוספת לינק
          </TabsTrigger>
        </TabsList>

        <TabsContent value="files">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-gray-800">העלאת קבצים</CardTitle>
              <CardDescription>העלה קבצי TXT, MD, CSV או JSON (עד 5MB)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-blue-200 rounded-2xl p-10 text-center bg-blue-50/50 hover:bg-blue-50 hover:border-blue-300 transition-all">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md,.csv,.json"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30 mb-4">
                    {isUploading ? (
                      <Loader2 className="h-8 w-8 text-white animate-spin" />
                    ) : (
                      <Upload className="h-8 w-8 text-white" />
                    )}
                  </div>
                  <p className="text-gray-700 font-medium">
                    {isUploading ? "מעלה ומעבד..." : "לחץ לבחירת קבצים או גרור לכאן"}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    TXT, MD, CSV, JSON עד 5MB
                  </p>
                </label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="urls">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-gray-800">הוספת לינק</CardTitle>
              <CardDescription>הוסף כתובת URL ונמשוך את התוכן אוטומטית</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/page"
                  dir="ltr"
                  className="rounded-xl border-gray-200 focus:border-blue-300"
                />
                <Button
                  onClick={handleAddUrl}
                  disabled={isAddingUrl || !url.trim()}
                  className="bg-gradient-to-l from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/30"
                >
                  {isAddingUrl ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Plus className="h-4 w-4 ml-2" />
                      הוסף
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Sources List */}
      <Card className="mt-6 border-0 shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-l from-violet-500 to-purple-600"></div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Database className="h-5 w-5 text-violet-500" />
            מקורות ידע ({sources.length})
          </CardTitle>
          <CardDescription>כל המקורות שנוספו לצ׳אטבוט</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
              <p className="text-gray-500">טוען מקורות...</p>
            </div>
          ) : sources.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 mx-auto mb-4">
                <FolderOpen className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">עדיין לא נוספו מקורות ידע</p>
              <p className="text-sm text-gray-400 mt-1">העלה קבצים או הוסף לינקים כדי להתחיל</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sources.map((source) => (
                <div
                  key={source.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-blue-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl shadow-lg ${
                        source.type === "file"
                          ? "bg-gradient-to-br from-blue-500 to-indigo-500 shadow-blue-500/20"
                          : "bg-gradient-to-br from-emerald-500 to-green-500 shadow-emerald-500/20"
                      }`}
                    >
                      {source.type === "file" ? (
                        <FileText className="h-5 w-5 text-white" />
                      ) : (
                        <Globe className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{source.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(source.status)}
                        {source.error && (
                          <span className="text-xs text-red-500">({source.error})</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Retry button for failed or pending sources */}
                    {(source.status === "failed" || source.status === "pending") && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRetry(source.id)}
                        disabled={retryingId === source.id}
                        className="rounded-xl hover:bg-blue-100"
                        title="נסה שוב"
                      >
                        {retryingId === source.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        ) : (
                          <RefreshCw className="h-4 w-4 text-blue-500" />
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(source.id)}
                      className="rounded-xl hover:bg-red-100"
                      title="מחק"
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
