import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/withRetry";
import { indexKnowledge } from "@/lib/vectors";

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes - matches process route

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Get the source
    const source = await withRetry(() =>
      prisma.knowledgeSource.findFirst({
        where: {
          id: params.id,
          chatbotId: chatbot.id,
        },
      })
    );

    if (!source) {
      return NextResponse.json({ error: "Source not found" }, { status: 404 });
    }

    if (!source.content?.trim()) {
      return NextResponse.json({ error: "Source has no content" }, { status: 400 });
    }

    // Limit content to 100KB to prevent timeout
    const maxContentLength = 100000;
    const processedContent = source.content.slice(0, maxContentLength);

    // Update status to processing
    await withRetry(() =>
      prisma.knowledgeSource.update({
        where: { id: source.id },
        data: { status: "processing", error: null },
      })
    );

    try {
      // Process embeddings
      await indexKnowledge(chatbot.id, source.id, processedContent);

      // Update status to ready
      const updatedSource = await withRetry(() =>
        prisma.knowledgeSource.update({
          where: { id: source.id },
          data: { status: "ready" },
        })
      );

      return NextResponse.json(updatedSource);

    } catch (indexError: any) {
      console.error("Retry index error:", indexError?.message || indexError);

      // Update status to failed
      const failedSource = await withRetry(() =>
        prisma.knowledgeSource.update({
          where: { id: source.id },
          data: {
            status: "failed",
            error: indexError?.message || "Failed to process",
          },
        })
      );

      return NextResponse.json(failedSource);
    }

  } catch (error: any) {
    console.error("Retry route error:", error?.message || error);
    return NextResponse.json(
      { error: error?.message || "Server error" },
      { status: 500 }
    );
  }
}
