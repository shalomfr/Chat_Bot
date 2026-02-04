import OpenAI from "openai";

let openrouterClient: OpenAI | null = null;

function getOpenRouterClient(): OpenAI {
  if (!openrouterClient) {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not configured");
    }
    openrouterClient = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
    });
  }
  return openrouterClient;
}

export async function createEmbedding(text: string): Promise<number[]> {
  try {
    const response = await getOpenRouterClient().embeddings.create({
      model: "openai/text-embedding-3-small",
      input: text.slice(0, 8000), // Limit input length
    });

    return response.data[0].embedding;
  } catch (error: any) {
    console.error("Embedding creation error:", error?.message || error);
    throw new Error(`Failed to create embedding: ${error?.message || "Unknown error"}`);
  }
}

export async function createEmbeddings(
  texts: string[]
): Promise<number[][]> {
  try {
    // Process in batches of 20 to avoid rate limits
    const batchSize = 20;
    const allEmbeddings: number[][] = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize).map(t => t.slice(0, 8000)); // Limit each text

      const response = await getOpenRouterClient().embeddings.create({
        model: "openai/text-embedding-3-small",
        input: batch,
      });

      allEmbeddings.push(...response.data.map((d) => d.embedding));

      // Small delay between batches to avoid rate limits
      if (i + batchSize < texts.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return allEmbeddings;
  } catch (error: any) {
    console.error("Batch embedding creation error:", error?.message || error);
    throw new Error(`Failed to create embeddings: ${error?.message || "Unknown error"}`);
  }
}

export function chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  const chunks: string[] = [];
  let start = 0;

  // Clean the text first
  const cleanedText = text.replace(/\s+/g, ' ').trim();

  if (!cleanedText) {
    return [];
  }

  while (start < cleanedText.length) {
    const end = Math.min(start + chunkSize, cleanedText.length);
    let chunk = cleanedText.slice(start, end);

    // Try to break at a sentence or paragraph boundary
    if (end < cleanedText.length) {
      const lastPeriod = chunk.lastIndexOf(".");
      const lastNewline = chunk.lastIndexOf("\n");
      const breakPoint = Math.max(lastPeriod, lastNewline);

      if (breakPoint > chunkSize * 0.5) {
        chunk = chunk.slice(0, breakPoint + 1);
      }
    }

    const trimmedChunk = chunk.trim();
    if (trimmedChunk.length > 0) {
      chunks.push(trimmedChunk);
    }

    start += chunk.length - overlap;

    if (start >= cleanedText.length) break;
  }

  return chunks;
}
