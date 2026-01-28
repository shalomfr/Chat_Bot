import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const chatbot = await prisma.chatbot.findFirst({
      where: { userId: user.id },
    });

    if (!chatbot) {
      return NextResponse.json({
        totalConversations: 0,
        totalMessages: 0,
        knowledgeSources: 0,
        recentConversations: 0,
      });
    }

    // Get total conversations
    const totalConversations = await prisma.conversation.count({
      where: { chatbotId: chatbot.id },
    });

    // Get total messages
    const totalMessages = await prisma.message.count({
      where: {
        conversation: {
          chatbotId: chatbot.id,
        },
      },
    });

    // Get knowledge sources count
    const knowledgeSources = await prisma.knowledgeSource.count({
      where: { chatbotId: chatbot.id },
    });

    // Get conversations from today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const recentConversations = await prisma.conversation.count({
      where: {
        chatbotId: chatbot.id,
        createdAt: { gte: today },
      },
    });

    return NextResponse.json({
      totalConversations,
      totalMessages,
      knowledgeSources,
      recentConversations,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
