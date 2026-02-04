import { NextRequest, NextResponse } from "next/server";
import { processPendingJobs, getQueueStats } from "@/lib/queue";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes for processing

// POST /api/worker?secret=YOUR_CRON_SECRET
// Called by cron job to process pending files
export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // Verify cron secret
    const secret = req.nextUrl.searchParams.get("secret");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error("CRON_SECRET not configured");
      return NextResponse.json({ error: "Worker not configured" }, { status: 500 });
    }

    if (secret !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Worker started at", new Date().toISOString());

    // Process up to 2 pending sources per run
    const processed = await processPendingJobs(2);

    const duration = Date.now() - startTime;
    const stats = await getQueueStats();

    console.log(`Worker done: ${processed} processed in ${duration}ms`);

    return NextResponse.json({
      success: true,
      processed,
      duration,
      stats,
    });
  } catch (error: any) {
    console.error("Worker error:", error?.message || error);
    return NextResponse.json(
      { error: error?.message || "Worker failed" },
      { status: 500 }
    );
  }
}

// GET /api/worker?secret=YOUR_CRON_SECRET - check status
export async function GET(req: NextRequest) {
  try {
    const secret = req.nextUrl.searchParams.get("secret");
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = await getQueueStats();
    return NextResponse.json({ status: "ok", stats });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
