import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteKnowledge } from "@/lib/vectors";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const source = await prisma.knowledgeSource.findUnique({
      where: { id: params.id },
      include: { chatbot: true },
    });

    if (!source || source.chatbot.userId !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Delete chunks from database
    try {
      await deleteKnowledge(source.id);
    } catch (e) {
      console.error("Delete chunks error:", e);
    }

    // Delete from database
    await prisma.knowledgeSource.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete knowledge error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
