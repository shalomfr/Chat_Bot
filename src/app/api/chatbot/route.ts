import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let chatbot = await prisma.chatbot.findFirst({
      where: { userId: user.id },
    });

    // Create default chatbot if doesn't exist
    if (!chatbot) {
      chatbot = await prisma.chatbot.create({
        data: {
          userId: user.id,
          name: "הצ'אטבוט שלי",
          systemPrompt: "אתה עוזר וירטואלי מועיל. ענה על שאלות בצורה ברורה ומועילה בעברית.",
          welcomeMessage: "שלום! איך אוכל לעזור לך היום?",
        },
      });
    }

    return NextResponse.json(chatbot);
  } catch (error) {
    console.error("Chatbot GET error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, systemPrompt, welcomeMessage, primaryColor } = body;

    const chatbot = await prisma.chatbot.findFirst({
      where: { id, userId: user.id },
    });

    if (!chatbot) {
      return NextResponse.json({ error: "Chatbot not found" }, { status: 404 });
    }

    const updated = await prisma.chatbot.update({
      where: { id },
      data: {
        name,
        systemPrompt,
        welcomeMessage,
        primaryColor,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Chatbot PUT error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
