import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateChatResponseStream, ChatMessage } from "@/lib/anthropic";
import { queryKnowledge } from "@/lib/vectors";

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
      chatbot = await prisma.chatbot.findUnique({
        where: { id: providedChatbotId },
      });
    } else {
      // Playground request - requires auth
      const user = await getCurrentUser();
      if (!user) {
        return new Response("Unauthorized", { status: 401 });
      }
      chatbot = await prisma.chatbot.findFirst({
        where: { userId: user.id },
      });
    }

    if (!chatbot) {
      return new Response("Chatbot not found", { status: 404 });
    }

    // Get or create conversation
    let conversation = await prisma.conversation.findFirst({
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
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          chatbotId: chatbot.id,
          sessionId,
        },
        include: { messages: true },
      });
    }

    // Save user message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: message,
      },
    });

    // Get relevant context from knowledge base
    let context = "";
    try {
      const relevantChunks = await queryKnowledge(chatbot.id, message, 5);
      if (relevantChunks.length > 0) {
        context = relevantChunks.join("\n\n---\n\n");
      }
    } catch (e) {
      console.error("Knowledge query error:", e);
    }

    // Build message history
    const chatMessages: ChatMessage[] = conversation.messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));
    chatMessages.push({ role: "user", content: message });

    // Create streaming response
    const encoder = new TextEncoder();
    let fullResponse = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const systemPrompt = chatbot.systemPrompt || "אתה עוזר וירטואלי מועיל. ענה על שאלות בצורה ברורה ומועילה.";

          for await (const chunk of generateChatResponseStream(
            chatMessages,
            systemPrompt,
            context
          )) {
            fullResponse += chunk;
            controller.enqueue(encoder.encode(chunk));
          }

          // Save assistant message
          await prisma.message.create({
            data: {
              conversationId: conversation!.id,
              role: "assistant",
              content: fullResponse,
            },
          });

          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response("Server error", { status: 500 });
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
