# ChatBot SaaS Platform

פלטפורמת SaaS ליצירת צ'אטבוט מותאם אישית עם RAG (Retrieval Augmented Generation) לכל לקוח.

## מה זה עושה?

- כל לקוח מקבל צ'אטבוט משלו עם מאגר ידע נפרד
- הלקוח מעלה קבצים/לינקים → המערכת יוצרת embeddings → שומרת בווקטורים
- כשמשתמש שואל שאלה → המערכת מחפשת מידע רלוונטי → Claude עונה בהתבסס על המידע

## טכנולוגיות

| רכיב | טכנולוגיה |
|------|-----------|
| Framework | **Next.js 14** (App Router) |
| Database | **Supabase PostgreSQL** + **Prisma** |
| Vector Storage | **pgvector** (extension) |
| AI/LLM | **Claude API** (Anthropic) |
| Embeddings | **OpenAI** (text-embedding-3-small) |
| Auth | **Supabase Auth** (Google OAuth) |
| Styling | **Tailwind CSS** |

## התקנה

### 1. צור פרויקט Supabase

1. היכנס ל-[Supabase](https://supabase.com) וצור פרויקט חדש
2. הפעל את pgvector extension:
   ```sql
   create extension if not exists vector;
   ```
3. הגדר Google OAuth ב-Authentication → Providers → Google

### 2. התקן dependencies

```bash
npm install
```

### 3. הגדר משתני סביבה

צור קובץ `.env`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# Database
DATABASE_URL="postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres"

# AI APIs
ANTHROPIC_API_KEY="your-anthropic-key"
OPENAI_API_KEY="your-openai-key"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. הרץ migrations

```bash
npm run db:push
```

### 5. הרץ את האפליקציה

```bash
npm run dev
```

## מבנה הפרויקט

```
src/
├── app/
│   ├── (auth)/login/          # דף התחברות (Google)
│   ├── (dashboard)/
│   │   ├── dashboard/         # דשבורד ראשי
│   │   ├── settings/          # הגדרות צ'אטבוט
│   │   ├── knowledge/         # מאגר ידע (RAG)
│   │   ├── conversations/     # היסטוריית שיחות
│   │   ├── playground/        # בדיקת צ'אטבוט
│   │   └── embed/             # קוד הטמעה
│   ├── api/
│   │   ├── chat/              # Chat API (streaming)
│   │   ├── chatbot/           # הגדרות
│   │   ├── knowledge/         # ניהול RAG
│   │   └── widget/            # API לווידג'ט
│   └── auth/callback/         # Supabase auth callback
├── components/
│   ├── ui/                    # UI components
│   └── dashboard/             # Dashboard components
├── lib/
│   ├── supabase/              # Supabase clients
│   ├── prisma.ts              # Prisma client
│   ├── auth.ts                # Auth helpers
│   ├── anthropic.ts           # Claude API
│   ├── embeddings.ts          # OpenAI embeddings
│   └── vectors.ts             # pgvector operations
└── middleware.ts              # Auth + CORS
```

## איך RAG עובד

```
1. לקוח מעלה קובץ/לינק
         ↓
2. התוכן מחולק ל-chunks (~1000 תווים)
         ↓
3. כל chunk → OpenAI Embeddings → וקטור 1536D
         ↓
4. הווקטורים נשמרים ב-PostgreSQL (pgvector)
         ↓
5. משתמש שואל שאלה
         ↓
6. השאלה → embedding → חיפוש similarity
         ↓
7. Top 5 chunks + שאלה → Claude → תשובה
```

## הטמעת הווידג'ט

הוסף לאתר שלך:

```html
<script
  src="https://your-domain.com/widget/chatbot.js"
  data-chatbot-id="YOUR_CHATBOT_ID"
  async
></script>
```

## API

### Chat (streaming)
```
POST /api/chat
{
  "message": "שלום",
  "sessionId": "unique-session-id",
  "chatbotId": "xxx" // for widget
}
```

### Widget Settings
```
GET /api/widget/[chatbotId]
→ { name, welcomeMessage, primaryColor }
```

## רישיון

MIT
