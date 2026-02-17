import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateChatResponse, ChatMessage, calculateCost } from "@/lib/anthropic";
import { withRetry } from "@/lib/withRetry";

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for response

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId, chatbotId: providedChatbotId } = await req.json();

    if (!message || !sessionId) {
      return new Response("Missing message or sessionId", { status: 400 });
    }

    // Input validation
    if (typeof message !== "string" || message.length > 4000) {
      return new Response("ההודעה ארוכה מדי (מקסימום 4000 תווים)", { status: 400 });
    }

    if (typeof sessionId !== "string" || sessionId.length > 50) {
      return new Response("Invalid sessionId", { status: 400 });
    }

    if (providedChatbotId && (typeof providedChatbotId !== "string" || providedChatbotId.length > 30)) {
      return new Response("Invalid chatbotId", { status: 400 });
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

    // Simple text search in knowledge sources
    let context = "";
    try {
      const knowledgeSources = await prisma.knowledgeSource.findMany({
        where: {
          chatbotId: chatbot.id,
          status: "ready",
        },
        select: {
          content: true,
          name: true,
        },
      });

      // Search for relevant content (simple keyword match)
      const keywords = message.toLowerCase().split(/\s+/).filter((w: string) => w.length > 2);
      const relevantSources: string[] = [];

      for (const source of knowledgeSources) {
        if (!source.content) continue;
        const contentLower = source.content.toLowerCase();
        const hasMatch = keywords.some((kw: string) => contentLower.includes(kw));
        if (hasMatch) {
          // Take first 2000 chars of matching source
          relevantSources.push(`[${source.name}]: ${source.content.slice(0, 2000)}`);
        }
      }

      if (relevantSources.length > 0) {
        context = "מידע רלוונטי מהמאגר:\n" + relevantSources.slice(0, 3).join("\n\n");
      }
    } catch (e) {
      console.error("Knowledge search error:", e);
    }

    // Build message history
    const chatMessages: ChatMessage[] = conversation.messages.map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));
    chatMessages.push({ role: "user", content: message });

    // Get response from OpenRouter (non-streaming for now)
    const systemPrompt = chatbot.systemPrompt || "אתה עוזר וירטואלי מועיל. ענה על שאלות בצורה ברורה ומועילה.";

    const chatResponse = await generateChatResponse(
      chatMessages,
      systemPrompt,
      context
    );

    // Calculate cost for this response
    const cost = calculateCost(chatResponse.usage, chatResponse.model);

    // Save assistant message with token usage
    await withRetry(() =>
      prisma.message.create({
        data: {
          conversationId: conversation!.id,
          role: "assistant",
          content: chatResponse.content,
          promptTokens: chatResponse.usage.promptTokens,
          completionTokens: chatResponse.usage.completionTokens,
          totalTokens: chatResponse.usage.totalTokens,
          cost: cost,
          model: chatResponse.model,
        },
      })
    );

    return new Response(chatResponse.content, {
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
