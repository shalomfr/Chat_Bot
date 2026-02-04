import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

// Helper function to retry database operations
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      const isConnectionError =
        error.message?.includes('closed the connection') ||
        error.message?.includes('P1001') ||
        error.message?.includes('P1002');

      if (isConnectionError && i < maxRetries - 1) {
        console.log(`Retry ${i + 1}/${maxRetries} after connection error`);
        // Disconnect and reconnect
        await prisma.$disconnect();
        await new Promise(resolve => setTimeout(resolve, 1000));
        await prisma.$connect();
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries reached');
}

export async function POST(req: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      console.error("Registration: DATABASE_URL is not set");
      return NextResponse.json(
        { error: "השרת לא מוגדר. חסר חיבור למסד נתונים." },
        { status: 503 }
      );
    }

    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "אימייל וסיסמה הם שדות חובה" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "הסיסמה חייבת להכיל לפחות 6 תווים" },
        { status: 400 }
      );
    }

    // Check if user already exists (with retry)
    const existingUser = await withRetry(() =>
      prisma.user.findUnique({
        where: { email },
      })
    );

    if (existingUser) {
      return NextResponse.json(
        { error: "משתמש עם אימייל זה כבר קיים" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user (with retry)
    const user = await withRetry(() =>
      prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      })
    );

    // Create default chatbot (with retry)
    await withRetry(() =>
      prisma.chatbot.create({
        data: {
          userId: user.id,
          name: "הצ'אטבוט שלי",
          systemPrompt: "אתה עוזר וירטואלי מועיל. ענה על שאלות בצורה ברורה ומועילה בעברית.",
          welcomeMessage: "שלום! איך אוכל לעזור לך היום?",
        },
      })
    );

    return NextResponse.json({
      success: true,
      message: "המשתמש נוצר בהצלחה",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const isPrisma = message.includes("prisma") || message.includes("P1001") || message.includes("P1002");
    console.error("Registration error:", error);

    if (process.env.NODE_ENV === "development" || isPrisma) {
      return NextResponse.json(
        { error: "אירעה שגיאה בהרשמה", details: message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "אירעה שגיאה בהרשמה" },
      { status: 500 }
    );
  }
}
