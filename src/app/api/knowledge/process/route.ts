import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { indexKnowledge } from "@/lib/vectors";
import { withRetry } from "@/lib/withRetry";

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for processing

export async function POST(req: NextRequest) {
  try {
    // Authentication - critical security fix!
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "לא מורשה" }, { status: 401 });
    }

    const { sourceId } = await req.json();

    if (!sourceId) {
      return NextResponse.json({ error: "חסר מזהה מקור" }, { status: 400 });
    }

    console.log("Processing knowledge source:", sourceId, "for user:", user.id);

    // Get user's chatbot
    const chatbot = await withRetry(() =>
      prisma.chatbot.findFirst({
        where: { userId: user.id },
      })
    );

    if (!chatbot) {
      return NextResponse.json({ error: "צ'אטבוט לא נמצא" }, { status: 404 });
    }

    // Get the source - verify ownership through chatbot
    const source = await withRetry(() =>
      prisma.knowledgeSource.findFirst({
        where: {
          id: sourceId,
          chatbotId: chatbot.id, // Security: verify ownership
        },
      })
    );

    if (!source) {
      return NextResponse.json({ error: "מקור לא נמצא" }, { status: 404 });
    }

    if (!source.content?.trim()) {
      await withRetry(() =>
        prisma.knowledgeSource.update({
          where: { id: sourceId },
          data: { status: "failed", error: "אין תוכן לעיבוד" },
        })
      );
      return NextResponse.json({ error: "אין תוכן" }, { status: 400 });
    }

    // Update status to processing
    await withRetry(() =>
      prisma.knowledgeSource.update({
        where: { id: sourceId },
        data: { status: "processing", error: null },
      })
    );

    try {
      // Limit content to 100KB to prevent timeout
      const maxContentLength = 100000;
      const processedContent = source.content.slice(0, maxContentLength);

      // Index the knowledge
      await indexKnowledge(chatbot.id, sourceId, processedContent);

      // Update status to ready
      const updatedSource = await withRetry(() =>
        prisma.knowledgeSource.update({
          where: { id: sourceId },
          data: { status: "ready" },
        })
      );

      console.log("Processing complete for:", sourceId);
      return NextResponse.json(updatedSource);

    } catch (processError: any) {
      console.error("Processing error:", processError?.message || processError);

      const failedSource = await withRetry(() =>
        prisma.knowledgeSource.update({
          where: { id: sourceId },
          data: {
            status: "failed",
            error: processError?.message || "העיבוד נכשל",
          },
        })
      );

      return NextResponse.json(failedSource);
    }

  } catch (error: any) {
    console.error("Process route error:", error?.message || error);
    return NextResponse.json(
      { error: error?.message || "שגיאת שרת" },
      { status: 500 }
    );
  }
}
