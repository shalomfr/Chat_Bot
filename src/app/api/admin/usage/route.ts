import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/withRetry";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "אין הרשאות מנהל" }, { status: 403 });
    }

    // Get all users with their chatbots
    const users = await withRetry(() =>
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          chatbots: {
            select: {
              id: true,
              conversations: {
                select: {
                  id: true,
                  messages: {
                    where: {
                      role: "assistant",
                      totalTokens: { not: null },
                    },
                    select: {
                      promptTokens: true,
                      completionTokens: true,
                      totalTokens: true,
                      cost: true,
                      createdAt: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    );

    // Calculate usage for each user
    const usersWithUsage = users.map((u) => {
      let totalTokens = 0;
      let promptTokens = 0;
      let completionTokens = 0;
      let totalCost = 0;
      let conversationsCount = 0;
      let messagesCount = 0;
      let lastActivity: Date | null = null;

      for (const chatbot of u.chatbots) {
        conversationsCount += chatbot.conversations.length;
        for (const conv of chatbot.conversations) {
          for (const msg of conv.messages) {
            messagesCount++;
            totalTokens += msg.totalTokens || 0;
            promptTokens += msg.promptTokens || 0;
            completionTokens += msg.completionTokens || 0;
            totalCost += msg.cost || 0;
            if (!lastActivity || msg.createdAt > lastActivity) {
              lastActivity = msg.createdAt;
            }
          }
        }
      }

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        totalTokens,
        promptTokens,
        completionTokens,
        totalCost: Math.round(totalCost * 1000000) / 1000000, // Round to 6 decimal places
        conversationsCount,
        messagesCount,
        lastActivity,
      };
    });

    // Calculate totals
    const totals = usersWithUsage.reduce(
      (acc, u) => ({
        totalTokens: acc.totalTokens + u.totalTokens,
        promptTokens: acc.promptTokens + u.promptTokens,
        completionTokens: acc.completionTokens + u.completionTokens,
        totalCost: acc.totalCost + u.totalCost,
        totalConversations: acc.totalConversations + u.conversationsCount,
        totalMessages: acc.totalMessages + u.messagesCount,
      }),
      { totalTokens: 0, promptTokens: 0, completionTokens: 0, totalCost: 0, totalConversations: 0, totalMessages: 0 }
    );

    return NextResponse.json({
      totals: {
        ...totals,
        totalCost: Math.round(totals.totalCost * 1000000) / 1000000,
        activeUsers: usersWithUsage.filter((u) => u.totalTokens > 0).length,
      },
      users: usersWithUsage.sort((a, b) => b.totalTokens - a.totalTokens),
    });
  } catch (error: any) {
    console.error("Admin usage error:", error);
    return NextResponse.json({ error: "שגיאה בטעינת נתוני השימוש" }, { status: 500 });
  }
}
