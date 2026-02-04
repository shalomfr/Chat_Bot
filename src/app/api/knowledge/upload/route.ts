import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/withRetry";

export const dynamic = 'force-dynamic';
export const maxDuration = 30; // Quick save only - cron processes pending files

export async function POST(req: NextRequest) {
  console.log("Upload route called at", new Date().toISOString());

  try {
    const user = await getCurrentUser();
    console.log("User:", user?.id || "not found");

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const chatbot = await withRetry(() =>
      prisma.chatbot.findFirst({
        where: { userId: user.id },
      })
    );
    console.log("Chatbot:", chatbot?.id || "not found");

    if (!chatbot) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
    }

    let formData;
    try {
      formData = await req.formData();
      console.log("FormData parsed successfully");
    } catch (formError: any) {
      console.error("FormData parse error:", formError?.message);
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }

    const files = formData.getAll("files") as File[];
    console.log("Files count:", files.length);

    if (!files.length) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const results = [];

    for (const file of files) {
      console.log("Processing file:", file.name, "Size:", file.size);

      try {
        // Check file size (5MB max to be safe)
        if (file.size > 5 * 1024 * 1024) {
          console.log("File too large:", file.name);
          return NextResponse.json(
            { error: `הקובץ ${file.name} גדול מדי (מקסימום 5MB)` },
            { status: 400 }
          );
        }

        // Only allow text files for now
        const allowedExtensions = [".txt", ".md", ".csv", ".json"];
        const ext = file.name.toLowerCase().substring(file.name.lastIndexOf("."));

        if (!allowedExtensions.includes(ext)) {
          return NextResponse.json(
            { error: `סוג הקובץ ${ext} לא נתמך. נתמכים: ${allowedExtensions.join(", ")}` },
            { status: 400 }
          );
        }

        // Read file content as text
        const buffer = Buffer.from(await file.arrayBuffer());
        const content = buffer.toString("utf-8");
        console.log("Content length:", content.length);

        if (!content.trim()) {
          return NextResponse.json(
            { error: `הקובץ ${file.name} ריק` },
            { status: 400 }
          );
        }

        // Limit content to 100KB
        const maxContentLength = 100000;
        if (content.length > maxContentLength) {
          console.log(`Content truncated from ${content.length} to ${maxContentLength}`);
        }
        const processedContent = content.slice(0, maxContentLength);

        // Save to database with pending status - cron will process it
        const source = await withRetry(() =>
          prisma.knowledgeSource.create({
            data: {
              chatbotId: chatbot.id,
              type: "file",
              name: file.name,
              content: processedContent,
              status: "pending",
            },
          })
        );
        console.log("Source saved with pending status:", source.id);

        results.push(source);

      } catch (fileError: any) {
        console.error("File processing error:", fileError?.message);
        return NextResponse.json(
          { error: `שגיאה בעיבוד הקובץ ${file.name}` },
          { status: 500 }
        );
      }
    }

    console.log("Upload complete, results:", results.length);
    return NextResponse.json(results);

  } catch (error: any) {
    console.error("Upload route error:", error?.message || error);
    // Always return JSON, never let it fall through to HTML error page
    return NextResponse.json(
      { error: error?.message || "שגיאה בהעלאת הקובץ" },
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
