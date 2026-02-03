import OpenAI from "openai";

let openrouterClient: OpenAI | null = null;

function getOpenRouterClient(): OpenAI {
  if (!openrouterClient) {
    openrouterClient = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
    });
  }
  return openrouterClient;
}

export async function createEmbedding(text: string): Promise<number[]> {
  const response = await getOpenRouterClient().embeddings.create({
    model: "openai/text-embedding-3-small",
    input: text,
  });

  return response.data[0].embedding;
}

export async function createEmbeddings(
  texts: string[]
): Promise<number[][]> {
  const response = await getOpenRouterClient().embeddings.create({
    model: "openai/text-embedding-3-small",
    input: texts,
  });

  return response.data.map((d) => d.embedding);
}

export function chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    let chunk = text.slice(start, end);

    // Try to break at a sentence or paragraph boundary
    if (end < text.length) {
      const lastPeriod = chunk.lastIndexOf(".");
      const lastNewline = chunk.lastIndexOf("\n");
      const breakPoint = Math.max(lastPeriod, lastNewline);

      if (breakPoint > chunkSize * 0.5) {
        chunk = chunk.slice(0, breakPoint + 1);
      }
    }

    chunks.push(chunk.trim());
    start += chunk.length - overlap;

    if (start >= text.length) break;
  }

  return chunks.filter((c) => c.length > 0);
}
