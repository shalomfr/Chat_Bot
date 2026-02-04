import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/withRetry";

export const dynamic = 'force-dynamic';

const TEN_MINUTES_MS = 10 * 60 * 1000;

export async function GET() {
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
      return NextResponse.json([]);
    }

    const sources = await withRetry(() =>
      prisma.knowledgeSource.findMany({
        where: { chatbotId: chatbot.id },
        orderBy: { createdAt: "desc" },
      })
    );

    // Check for stale "processing" sources and mark them as failed
    const now = new Date();
    const updatedSources = [];

    for (const source of sources) {
      if (source.status === "processing") {
        const processingTime = now.getTime() - new Date(source.updatedAt).getTime();

        if (processingTime > TEN_MINUTES_MS) {
          // Mark as failed due to timeout
          const updated = await withRetry(() =>
            prisma.knowledgeSource.update({
              where: { id: source.id },
              data: {
                status: "failed",
                error: "העיבוד נכשל - תם הזמן. נסה שוב.",
              },
            })
          );
          updatedSources.push(updated);
        } else {
          updatedSources.push(source);
        }
      } else {
        updatedSources.push(source);
      }
    }

    return NextResponse.json(updatedSources);
  } catch (error) {
    console.error("Knowledge GET error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
