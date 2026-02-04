import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { indexKnowledge } from "@/lib/vectors";
import { withRetry } from "@/lib/withRetry";

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for processing

export async function POST(req: NextRequest) {
  try {
    const { sourceId } = await req.json();

    if (!sourceId) {
      return NextResponse.json({ error: "Missing sourceId" }, { status: 400 });
    }

    console.log("Processing knowledge source:", sourceId);

    // Get the source
    const source = await withRetry(() =>
      prisma.knowledgeSource.findUnique({
        where: { id: sourceId },
      })
    );

    if (!source) {
      return NextResponse.json({ error: "Source not found" }, { status: 404 });
    }

    if (!source.content?.trim()) {
      await withRetry(() =>
        prisma.knowledgeSource.update({
          where: { id: sourceId },
          data: { status: "failed", error: "No content found" },
        })
      );
      return NextResponse.json({ error: "No content" }, { status: 400 });
    }

    // Update status to processing
    await withRetry(() =>
      prisma.knowledgeSource.update({
        where: { id: sourceId },
        data: { status: "processing" },
      })
    );

    try {
      // Index the knowledge
      await indexKnowledge(source.chatbotId, sourceId, source.content);

      // Update status to ready
      await withRetry(() =>
        prisma.knowledgeSource.update({
          where: { id: sourceId },
          data: { status: "ready" },
        })
      );

      console.log("Processing complete for:", sourceId);
      return NextResponse.json({ success: true });

    } catch (processError: any) {
      console.error("Processing error:", processError?.message || processError);

      await withRetry(() =>
        prisma.knowledgeSource.update({
          where: { id: sourceId },
          data: {
            status: "failed",
            error: processError?.message || "Processing failed",
          },
        })
      );

      return NextResponse.json(
        { error: processError?.message || "Processing failed" },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error("Process route error:", error?.message || error);
    return NextResponse.json(
      { error: error?.message || "Server error" },
      { status: 500 }
    );
  }
}
