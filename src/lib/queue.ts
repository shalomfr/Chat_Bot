import { prisma } from "./prisma";
import { indexKnowledge } from "./vectors";
import { withRetry } from "./withRetry";

// Process a single source
export async function processSource(
  sourceId: string,
  chatbotId: string,
  content: string
): Promise<void> {
  console.log(`Processing source ${sourceId}...`);

  try {
    // Update status to processing
    await withRetry(() =>
      prisma.knowledgeSource.update({
        where: { id: sourceId },
        data: { status: "processing", error: null },
      })
    );

    // Limit content to 75KB
    const processedContent = content.slice(0, 75000);

    // Process embeddings
    await indexKnowledge(chatbotId, sourceId, processedContent);

    // Update status to ready
    await withRetry(() =>
      prisma.knowledgeSource.update({
        where: { id: sourceId },
        data: { status: "ready", error: null },
      })
    );

    console.log(`Source ${sourceId} processed successfully`);
  } catch (error: any) {
    console.error(`Source ${sourceId} failed:`, error?.message || error);

    // Update status to failed
    await withRetry(() =>
      prisma.knowledgeSource.update({
        where: { id: sourceId },
        data: {
          status: "failed",
          error: error?.message || "Processing failed",
        },
      })
    );
  }
}

// Process pending sources from database (called by cron)
export async function processPendingJobs(limit: number = 3): Promise<number> {
  // Get pending sources
  const pendingSources = await prisma.knowledgeSource.findMany({
    where: { status: "pending" },
    take: limit,
    orderBy: { createdAt: "asc" },
  });

  console.log(`Found ${pendingSources.length} pending sources`);

  let processed = 0;
  for (const source of pendingSources) {
    try {
      await processSource(source.id, source.chatbotId, source.content || "");
      processed++;
    } catch (error: any) {
      console.error(`Failed to process source ${source.id}:`, error?.message);
    }
  }

  return processed;
}

// Get stats
export async function getQueueStats() {
  const [pending, processing, ready, failed] = await Promise.all([
    prisma.knowledgeSource.count({ where: { status: "pending" } }),
    prisma.knowledgeSource.count({ where: { status: "processing" } }),
    prisma.knowledgeSource.count({ where: { status: "ready" } }),
    prisma.knowledgeSource.count({ where: { status: "failed" } }),
  ]);

  return { pending, processing, ready, failed };
}
