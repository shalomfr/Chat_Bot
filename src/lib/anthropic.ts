export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface ChatResponse {
  content: string;
  usage: TokenUsage;
  model: string;
}

// OpenRouter pricing for Claude 3.5 Sonnet (per token)
export const OPENROUTER_PRICING = {
  "anthropic/claude-3.5-sonnet": {
    input: 0.000003,  // $3 per 1M tokens
    output: 0.000015, // $15 per 1M tokens
  },
};

export function calculateCost(usage: TokenUsage, model: string): number {
  const pricing = OPENROUTER_PRICING[model as keyof typeof OPENROUTER_PRICING];
  if (!pricing) return 0;
  return (usage.promptTokens * pricing.input) + (usage.completionTokens * pricing.output);
}

export async function generateChatResponse(
  messages: ChatMessage[],
  systemPrompt: string,
  context: string
): Promise<ChatResponse> {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const model = "anthropic/claude-3.5-sonnet";

  const fullSystemPrompt = context
    ? `${systemPrompt}\n\nהנה מידע רלוונטי מבסיס הידע שלך:\n${context}\n\nהשתמש במידע הזה כדי לענות על שאלות המשתמש. אם המידע לא רלוונטי לשאלה, אל תציין אותו.`
    : systemPrompt;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "HTTP-Referer": process.env.AUTH_URL || "https://chatbot-saas-chea.onrender.com",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: fullSystemPrompt },
        ...messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      ],
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("OpenRouter API error:", response.status, error);
    throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";

  // Extract usage data from OpenRouter response
  const usage: TokenUsage = {
    promptTokens: data.usage?.prompt_tokens || 0,
    completionTokens: data.usage?.completion_tokens || 0,
    totalTokens: data.usage?.total_tokens || 0,
  };

  return {
    content,
    usage,
    model,
  };
}

export async function* generateChatResponseStream(
  messages: ChatMessage[],
  systemPrompt: string,
  context: string
): AsyncGenerator<string> {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const fullSystemPrompt = context
    ? `${systemPrompt}\n\nהנה מידע רלוונטי מבסיס הידע שלך:\n${context}\n\nהשתמש במידע הזה כדי לענות על שאלות המשתמש. אם המידע לא רלוונטי לשאלה, אל תציין אותו.`
    : systemPrompt;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "HTTP-Referer": process.env.AUTH_URL || "https://chatbot-saas-chea.onrender.com",
    },
    body: JSON.stringify({
      model: "anthropic/claude-3.5-sonnet",
      messages: [
        { role: "system", content: fullSystemPrompt },
        ...messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      ],
      max_tokens: 1024,
      stream: true,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("OpenRouter stream error:", response.status, error);
    throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No response body");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === "data: [DONE]") continue;
        if (!trimmed.startsWith("data: ")) continue;

        try {
          const json = JSON.parse(trimmed.slice(6));
          const content = json.choices?.[0]?.delta?.content;
          if (content) {
            yield content;
          }
        } catch (e) {
          // Skip invalid JSON
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
