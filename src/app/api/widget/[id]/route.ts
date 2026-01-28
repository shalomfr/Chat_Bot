import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const chatbot = await prisma.chatbot.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        welcomeMessage: true,
        primaryColor: true,
      },
    });

    if (!chatbot) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
    }

    // Add CORS headers for widget
    return NextResponse.json(chatbot, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
      },
    });
  } catch (error) {
    console.error("Widget settings error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
