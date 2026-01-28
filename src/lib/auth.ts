import { createClient } from "@/lib/supabase/server";
import { prisma } from "./prisma";

export async function getSession() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentUser() {
  const user = await getUser();

  if (!user) {
    return null;
  }

  // Get or create user in our database
  let dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.full_name || user.user_metadata?.name || null,
        avatarUrl: user.user_metadata?.avatar_url || null,
      },
    });

    // Create default chatbot for new user
    await prisma.chatbot.create({
      data: {
        userId: dbUser.id,
        name: "הצ'אטבוט שלי",
        systemPrompt: "אתה עוזר וירטואלי מועיל. ענה על שאלות בצורה ברורה ומועילה בעברית.",
        welcomeMessage: "שלום! איך אוכל לעזור לך היום?",
      },
    });
  }

  return dbUser;
}
