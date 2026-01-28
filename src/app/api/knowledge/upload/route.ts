import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { indexKnowledge } from "@/lib/vectors";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const chatbot = await prisma.chatbot.findFirst({
      where: { userId: user.id },
    });

    if (!chatbot) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files.length) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const results = [];

    for (const file of files) {
      // Check file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
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
        } catch (e) {
          console.error("PDF parse error:", e);
          content = "";
        }
      } else {
        // For other files, try to read as text
        content = buffer.toString("utf-8");
      }

      // Create knowledge source
      const source = await prisma.knowledgeSource.create({
        data: {
          chatbotId: chatbot.id,
          type: "file",
          name: file.name,
          content,
          status: "processing",
        },
      });

      // Process embeddings in background
      processKnowledge(chatbot.id, source.id, content);

      results.push(source);
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

async function processKnowledge(chatbotId: string, sourceId: string, content: string) {
  try {
    if (!content.trim()) {
      await prisma.knowledgeSource.update({
        where: { id: sourceId },
        data: { status: "failed", error: "No content found" },
      });
      return;
    }

    await indexKnowledge(chatbotId, sourceId, content);

    await prisma.knowledgeSource.update({
      where: { id: sourceId },
      data: { status: "ready" },
    });
  } catch (error: any) {
    console.error("Process knowledge error:", error);
    await prisma.knowledgeSource.update({
      where: { id: sourceId },
      data: { status: "failed", error: error.message },
    });
  }
}
