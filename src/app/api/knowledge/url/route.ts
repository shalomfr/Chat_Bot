import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { indexKnowledge } from "@/lib/vectors";
import * as cheerio from "cheerio";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const chatbot = await prisma.chatbot.findFirst({
      where: { userId: user.id },
    });

    if (!chatbot) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
    }

    const { url } = await req.json();

    if (!url || !isValidUrl(url)) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    // Create knowledge source
    const source = await prisma.knowledgeSource.create({
      data: {
        chatbotId: chatbot.id,
        type: "url",
        name: new URL(url).hostname,
        url,
        status: "processing",
      },
    });

    // Process URL in background
    processUrl(chatbot.id, source.id, url);

    return NextResponse.json(source);
  } catch (error) {
    console.error("URL add error:", error);
    return NextResponse.json({ error: "Failed to add URL" }, { status: 500 });
  }
}

function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

async function processUrl(chatbotId: string, sourceId: string, url: string) {
  try {
    // Fetch the webpage
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ChatbotSaaS/1.0)",
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.status}`);
    }

    const html = await res.text();

    // Parse HTML and extract text
    const $ = cheerio.load(html);

    // Remove script and style elements
    $("script, style, nav, footer, header").remove();

    // Get text content
    const content = $("body").text()
      .replace(/\s+/g, " ")
      .trim();

    if (!content) {
      throw new Error("No content found");
    }

    // Update with content
    await prisma.knowledgeSource.update({
      where: { id: sourceId },
      data: {
        content,
        name: $("title").text() || new URL(url).hostname,
      },
    });

    // Index in vector DB
    await indexKnowledge(chatbotId, sourceId, content);

    await prisma.knowledgeSource.update({
      where: { id: sourceId },
      data: { status: "ready" },
    });
  } catch (error: any) {
    console.error("Process URL error:", error);
    await prisma.knowledgeSource.update({
      where: { id: sourceId },
      data: { status: "failed", error: error.message },
    });
  }
}
