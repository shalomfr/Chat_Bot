import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { indexKnowledge } from "@/lib/vectors";
import { withRetry } from "@/lib/withRetry";

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds timeout

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const chatbot = await withRetry(() =>
      prisma.chatbot.findFirst({
        where: { userId: user.id },
      })
    );

    if (!chatbot) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
    }

    let formData;
    try {
      formData = await req.formData();
    } catch (formError) {
      console.error("FormData parse error:", formError);
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }

    const files = formData.getAll("files") as File[];

    if (!files.length) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const results = [];

    for (const file of files) {
      try {
        // Check file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
          console.log(`File ${file.name} too large, skipping`);
          continue;
        }

        // Read file content
        let content = "";
        const buffer = Buffer.from(await file.arrayBuffer());

        if (file.name.endsWith(".txt")) {
          content = buffer.toString("utf-8");
        } else if (file.name.endsWith(".pdf")) {
          // For PDF, we'll use pdf-parse
          try {
            const pdfParse = (await import("pdf-parse")).default;
            const pdfData = await pdfParse(buffer);
            content = pdfData.text;
          } catch (pdfError: any) {
            console.error("PDF parse error:", pdfError?.message || pdfError);
            // Return error for PDF files that can't be parsed
            return NextResponse.json(
              { error: `לא ניתן לקרוא את קובץ ה-PDF: ${file.name}` },
              { status: 400 }
            );
          }
        } else {
          // For other files, try to read as text
          content = buffer.toString("utf-8");
        }

        if (!content.trim()) {
          return NextResponse.json(
            { error: `הקובץ ${file.name} ריק או לא ניתן לקריאה` },
            { status: 400 }
          );
        }

        // Create knowledge source
        const source = await withRetry(() =>
          prisma.knowledgeSource.create({
            data: {
              chatbotId: chatbot.id,
              type: "file",
              name: file.name,
              content,
              status: "processing",
            },
          })
        );

        // Process embeddings in background (don't await)
        processKnowledge(chatbot.id, source.id, content).catch((err) => {
          console.error("Background processing error:", err);
        });

        results.push(source);
      } catch (fileError: any) {
        console.error(`Error processing file ${file.name}:`, fileError);
        return NextResponse.json(
          { error: `שגיאה בעיבוד הקובץ ${file.name}` },
          { status: 500 }
        );
      }
    }

    if (results.length === 0) {
      return NextResponse.json(
        { error: "לא הצלחנו לעבד אף קובץ" },
        { status: 400 }
      );
    }

    return NextResponse.json(results);
  } catch (error: any) {
    console.error("Upload error:", error?.message || error);
    return NextResponse.json(
      { error: error?.message || "Upload failed" },
      { status: 500 }
    );
  }
}

async function processKnowledge(chatbotId: string, sourceId: string, content: string) {
  try {
    if (!content.trim()) {
      await withRetry(() =>
        prisma.knowledgeSource.update({
          where: { id: sourceId },
          data: { status: "failed", error: "No content found" },
        })
      );
      return;
    }

    await indexKnowledge(chatbotId, sourceId, content);

    await withRetry(() =>
      prisma.knowledgeSource.update({
        where: { id: sourceId },
        data: { status: "ready" },
      })
    );
  } catch (error: any) {
    console.error("Process knowledge error:", error?.message || error);
    await withRetry(() =>
      prisma.knowledgeSource.update({
        where: { id: sourceId },
        data: { status: "failed", error: error?.message || "Processing failed" },
      })
    );
  }
}
