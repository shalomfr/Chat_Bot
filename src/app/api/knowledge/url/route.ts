import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { indexKnowledge } from "@/lib/vectors";
import * as cheerio from "cheerio";

export const dynamic = 'force-dynamic';

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

    if (isPrivateUrl(url)) {
      return NextResponse.json({ error: "כתובת URL זו אינה מורשית" }, { status: 400 });
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

function isPrivateUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    const hostname = url.hostname.toLowerCase();

    // Block localhost
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0" || hostname === "::1") {
      return true;
    }

    // Block private IP ranges
    const parts = hostname.split(".").map(Number);
    if (parts.length === 4 && parts.every((p) => !isNaN(p))) {
      // 10.x.x.x
      if (parts[0] === 10) return true;
      // 172.16-31.x.x
      if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
      // 192.168.x.x
      if (parts[0] === 192 && parts[1] === 168) return true;
      // 169.254.x.x (AWS metadata)
      if (parts[0] === 169 && parts[1] === 254) return true;
    }

    // Block non-http(s) schemes
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return true;
    }

    return false;
  } catch {
    return true;
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
