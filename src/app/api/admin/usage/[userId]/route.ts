import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/withRetry";

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || !currentUser.isAdmin) {
      return NextResponse.json({ error: "אין הרשאות מנהל" }, { status: 403 });
    }

    const { userId } = await params;

    // Get user with all conversations and messages
    const user = await withRetry(() =>
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          chatbots: {
            select: {
              id: true,
              name: true,
              conversations: {
                select: {
                  id: true,
                  sessionId: true,
                  createdAt: true,
                  updatedAt: true,
                  messages: {
                    select: {
                      id: true,
                      role: true,
                      content: true,
                      promptTokens: true,
                      completionTokens: true,
                      totalTokens: true,
                      cost: true,
                      model: true,
                      createdAt: true,
                    },
                    orderBy: { createdAt: "asc" },
                  },
                },
                orderBy: { updatedAt: "desc" },
              },
            },
          },
        },
      })
    );

    if (!user) {
      return NextResponse.json({ error: "משתמש לא נמצא" }, { status: 404 });
    }

    // Process conversations with usage data
    const conversations = [];
    let totalTokens = 0;
    let promptTokens = 0;
    let completionTokens = 0;
    let totalCost = 0;

    for (const chatbot of user.chatbots) {
      for (const conv of chatbot.conversations) {
        let convTokens = 0;
        let convPromptTokens = 0;
        let convCompletionTokens = 0;
        let convCost = 0;
        let messagesCount = 0;

        for (const msg of conv.messages) {
          if (msg.role === "assistant" && msg.totalTokens) {
            messagesCount++;
            convTokens += msg.totalTokens || 0;
            convPromptTokens += msg.promptTokens || 0;
            convCompletionTokens += msg.completionTokens || 0;
            convCost += msg.cost || 0;
          }
        }

        totalTokens += convTokens;
        promptTokens += convPromptTokens;
        completionTokens += convCompletionTokens;
        totalCost += convCost;

        conversations.push({
          id: conv.id,
          chatbotName: chatbot.name,
          messagesCount: conv.messages.length,
          assistantMessagesCount: messagesCount,
          totalTokens: convTokens,
          promptTokens: convPromptTokens,
          completionTokens: convCompletionTokens,
          cost: Math.round(convCost * 1000000) / 1000000,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
          messages: conv.messages.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content.slice(0, 200) + (m.content.length > 200 ? "..." : ""),
            promptTokens: m.promptTokens,
            completionTokens: m.completionTokens,
            totalTokens: m.totalTokens,
            cost: m.cost ? Math.round(m.cost * 1000000) / 1000000 : null,
            model: m.model,
            createdAt: m.createdAt,
          })),
        });
      }
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      totals: {
        totalTokens,
        promptTokens,
        completionTokens,
        totalCost: Math.round(totalCost * 1000000) / 1000000,
        conversationsCount: conversations.length,
      },
      conversations,
    });
  } catch (error: any) {
    console.error("Admin user usage error:", error);
    return NextResponse.json({ error: "שגיאה בטעינת נתוני המשתמש" }, { status: 500 });
  }
}
