import { prisma } from "./prisma";
import { createEmbedding, createEmbeddings, chunkText } from "./embeddings";

export async function indexKnowledge(
  chatbotId: string,
  sourceId: string,
  content: string
): Promise<void> {
  const chunks = chunkText(content);
  const embeddings = await createEmbeddings(chunks);

  // Delete existing chunks for this source
  await prisma.knowledgeChunk.deleteMany({
    where: { sourceId },
  });

  // Insert new chunks with embeddings using raw SQL for vector type
  for (let i = 0; i < chunks.length; i++) {
    const embeddingArray = `[${embeddings[i].join(",")}]`;

    await prisma.$executeRaw`
      INSERT INTO "KnowledgeChunk" (id, "sourceId", "chatbotId", content, embedding, "chunkIndex", "createdAt")
      VALUES (
        ${`chunk_${sourceId}_${i}`},
        ${sourceId},
        ${chatbotId},
        ${chunks[i]},
        ${embeddingArray}::vector,
        ${i},
        NOW()
      )
    `;
  }
}

export async function deleteKnowledge(sourceId: string): Promise<void> {
  await prisma.knowledgeChunk.deleteMany({
    where: { sourceId },
  });
}

export async function queryKnowledge(
  chatbotId: string,
  query: string,
  topK: number = 5
): Promise<string[]> {
  const queryEmbedding = await createEmbedding(query);
  const embeddingArray = `[${queryEmbedding.join(",")}]`;

  // Use cosine similarity search with pgvector
  const results = await prisma.$queryRaw<{ content: string; similarity: number }[]>`
    SELECT
      content,
      1 - (embedding <=> ${embeddingArray}::vector) as similarity
    FROM "KnowledgeChunk"
    WHERE "chatbotId" = ${chatbotId}
      AND embedding IS NOT NULL
    ORDER BY embedding <=> ${embeddingArray}::vector
    LIMIT ${topK}
  `;

  return results.map((r) => r.content);
}
