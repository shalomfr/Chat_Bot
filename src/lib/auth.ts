import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { withRetry } from "./withRetry";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        // Check for admin password
        if (password === process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD) {
          let user = await withRetry(() =>
            prisma.user.findUnique({
              where: { email },
            })
          );

          if (!user) {
            user = await withRetry(() =>
              prisma.user.create({
                data: {
                  email,
                  name: "Admin",
                  isAdmin: true,
                },
              })
            );
          } else {
            // Update to admin if not already
            const userId = user.id;
            await withRetry(() =>
              prisma.user.update({
                where: { id: userId },
                data: { isAdmin: true },
              })
            );
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            isAdmin: true,
          };
        }

        // Regular user login
        const user = await withRetry(() =>
          prisma.user.findUnique({
            where: { email },
          })
        );

        if (!user || !user.password) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          isAdmin: user.isAdmin,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = (user as any).isAdmin || false;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).isAdmin = token.isAdmin;
      }
      return session;
    },
  },
});

export async function getCurrentUser() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const user = await withRetry(() =>
    prisma.user.findUnique({
      where: { id: session.user.id },
    })
  );

  if (!user) {
    return null;
  }

  // Create default chatbot for new users if they don't have one
  const chatbot = await withRetry(() =>
    prisma.chatbot.findFirst({
      where: { userId: user.id },
    })
  );

  if (!chatbot) {
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
  }

  return user;
}
