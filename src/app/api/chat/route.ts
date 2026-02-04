import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateChatResponse, ChatMessage } from "@/lib/anthropic";
import { withRetry } from "@/lib/withRetry";

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for response

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId, chatbotId: providedChatbotId } = await req.json();

    if (!message || !sessionId) {
      return new Response("Missing message or sessionId", { status: 400 });
    }

    // Get chatbot - either from provided ID (widget) or user session (playground)
    let chatbot;

    if (providedChatbotId) {
      // Widget request
      chatbot = await withRetry(() =>
        prisma.chatbot.findUnique({
          where: { id: providedChatbotId },
        })
      );
    } else {
      // Playground request - requires auth
      const user = await getCurrentUser();
      if (!user) {
        return new Response("Unauthorized", { status: 401 });
      }
      chatbot = await withRetry(() =>
        prisma.chatbot.findFirst({
          where: { userId: user.id },
        })
      );
    }

    if (!chatbot) {
      return new Response("Chatbot not found", { status: 404 });
    }

    // Get or create conversation
    let conversation = await withRetry(() =>
      prisma.conversation.findFirst({
        where: {
          chatbotId: chatbot.id,
          sessionId,
        },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
            take: 20, // Last 20 messages for context
          },
        },
      })
    );

    if (!conversation) {
      conversation = await withRetry(() =>
        prisma.conversation.create({
          data: {
            chatbotId: chatbot.id,
            sessionId,
          },
          include: { messages: true },
        })
      );
    }

    // Save user message
    await withRetry(() =>
      prisma.message.create({
        data: {
          conversationId: conversation.id,
          role: "user",
          content: message,
        },
      })
    );

    // Skip knowledge query for now to simplify debugging
    const context = "";

    // Build message history
    const chatMessages: ChatMessage[] = conversation.messages.map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));
    chatMessages.push({ role: "user", content: message });

    // Get response from OpenRouter (non-streaming for now)
    const systemPrompt = chatbot.systemPrompt || "אתה עוזר וירטואלי מועיל. ענה על שאלות בצורה ברורה ומועילה.";

    const response = await generateChatResponse(
      chatMessages,
      systemPrompt,
      context
    );

    // Save assistant message
    await withRetry(() =>
      prisma.message.create({
        data: {
          conversationId: conversation!.id,
          role: "assistant",
          content: response,
        },
      })
    );

    return new Response(response, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    console.error("Chat error:", error);
    const isConnectionError =
      error.message?.includes('closed the connection') ||
      error.message?.includes('P1017') ||
      error.message?.includes('P1001') ||
      error.message?.includes('ECONNRESET');

    const status = isConnectionError ? 503 : 500;
    const errorMessage = isConnectionError ? "Database connection error" : `Server error: ${error.message}`;
    return new Response(errorMessage, { status });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
