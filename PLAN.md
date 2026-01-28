# תוכנית פיתוח - פלטפורמת צ'אטבוט SaaS

## סקירה כללית
פלטפורמה שמאפשרת לבעלי עסקים ליצור צ'אטבוט מותאם אישית עם RAG (מאגר ידע) ולהטמיע אותו באתר שלהם.

כל לקוח מקבל:
- צ'אטבוט משלו
- מאגר ידע נפרד (וקטורים מבודדים)
- הגדרות מותאמות אישית
- היסטוריית שיחות

---

## טכנולוגיות

| רכיב | טכנולוגיה |
|------|-----------|
| Frontend + Backend | **Next.js 14** (App Router) |
| Database | **Supabase PostgreSQL** + **Prisma ORM** |
| Vector Storage | **pgvector** (PostgreSQL extension) |
| AI/LLM | **Anthropic Claude API** |
| Embeddings | **OpenAI** (text-embedding-3-small) |
| Authentication | **Supabase Auth** (Google OAuth) |
| Styling | **Tailwind CSS** |
| Widget | **Vanilla JS** (להטמעה קלה) |

---

## מבנה הפרויקט

```
chatbot/
├── src/
│   ├── app/
│   │   ├── (auth)/login/           # התחברות עם Google
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/          # דשבורד ראשי
│   │   │   ├── settings/           # הגדרות צ'אטבוט
│   │   │   ├── knowledge/          # ניהול מאגר ידע
│   │   │   ├── conversations/      # היסטוריית שיחות
│   │   │   ├── playground/         # בדיקת צ'אטבוט
│   │   │   └── embed/              # הוראות הטמעה
│   │   ├── api/
│   │   │   ├── chat/               # Chat API (streaming)
│   │   │   ├── chatbot/            # הגדרות צ'אטבוט
│   │   │   ├── knowledge/          # ניהול ידע
│   │   │   ├── conversations/      # שיחות
│   │   │   ├── stats/              # סטטיסטיקות
│   │   │   └── widget/             # API לווידג'ט
│   │   └── auth/callback/          # Supabase callback
│   ├── components/
│   │   ├── ui/                     # shadcn-style components
│   │   └── dashboard/              # Dashboard components
│   ├── lib/
│   │   ├── supabase/               # Supabase clients
│   │   ├── prisma.ts               # Prisma client
│   │   ├── auth.ts                 # Auth helpers
│   │   ├── anthropic.ts            # Claude API
│   │   ├── embeddings.ts           # OpenAI embeddings
│   │   └── vectors.ts              # pgvector operations
│   └── middleware.ts               # Auth + CORS
├── public/widget/
│   └── chatbot.js                  # Widget להטמעה
├── widget/src/
│   └── widget.ts                   # Widget source
└── prisma/
    └── schema.prisma               # Database schema
```

---

## סכמת Database

```prisma
model User {
  id        String    @id
  email     String    @unique
  name      String?
  avatarUrl String?
  chatbots  Chatbot[]
}

model Chatbot {
  id             String   @id
  userId         String
  name           String
  systemPrompt   String?
  welcomeMessage String?
  primaryColor   String   @default("#3B82F6")

  knowledgeSources KnowledgeSource[]
  conversations    Conversation[]
}

model KnowledgeSource {
  id        String   @id
  chatbotId String
  type      String   // "file" | "url"
  name      String
  url       String?
  content   String?
  status    String   // pending | processing | ready | failed

  chunks    KnowledgeChunk[]
}

model KnowledgeChunk {
  id         String
  sourceId   String
  chatbotId  String
  content    String
  embedding  vector(1536)  // pgvector
  chunkIndex Int
}

model Conversation {
  id        String
  chatbotId String
  sessionId String
  messages  Message[]
}

model Message {
  id             String
  conversationId String
  role           String  // "user" | "assistant"
  content        String
}
```

---

## איך RAG עובד

```
1. לקוח מעלה קובץ/לינק
         ↓
2. התוכן מחולק ל-chunks (~1000 תווים עם overlap)
         ↓
3. כל chunk → OpenAI text-embedding-3-small → וקטור 1536D
         ↓
4. הווקטורים נשמרים ב-PostgreSQL עם pgvector
         ↓
5. משתמש קצה שואל שאלה
         ↓
6. השאלה → embedding → cosine similarity search
         ↓
7. Top 5 chunks הכי רלוונטיים + שאלה + היסטוריה
         ↓
8. Claude מקבל את הכל ומחזיר תשובה (streaming)
```

---

## תכונות

### דף התחברות
- התחברות עם Google בלבד
- יצירת משתמש וצ'אטבוט ברירת מחדל אוטומטית

### דשבורד
- סטטיסטיקות (שיחות, הודעות, מקורות)
- הדרכה למשתמשים חדשים

### הגדרות צ'אטבוט
- שם
- System Prompt (הוראות)
- הודעת פתיחה
- צבע ראשי

### מאגר ידע
- העלאת קבצים (PDF, TXT)
- הוספת לינקים (web scraping)
- סטטוס עיבוד לכל מקור
- מחיקת מקורות

### שיחות
- רשימת כל השיחות
- צפייה בשיחה מלאה

### Playground
- בדיקת הצ'אטבוט
- Streaming responses

### הטמעה
- קוד להעתקה
- תצוגה מקדימה
- מזהה צ'אטבוט

---

## הווידג'ט

```html
<script
  src="https://your-domain.com/widget/chatbot.js"
  data-chatbot-id="xxx"
  async
></script>
```

- כפתור צף בפינה
- חלון צ'אט נפתח
- Streaming responses
- עיצוב מותאם לצבע הצ'אטבוט
- תמיכה ב-RTL

---

## שלבי מימוש - הושלם ✅

- [x] אתחול פרויקט Next.js
- [x] הגדרת Prisma + PostgreSQL + pgvector
- [x] הגדרת Supabase Auth (Google)
- [x] Layout עם RTL
- [x] דף התחברות
- [x] דשבורד + Sidebar
- [x] דף הגדרות צ'אטבוט
- [x] דף מאגר ידע
- [x] דף שיחות
- [x] דף Playground
- [x] דף הטמעה
- [x] Chat API עם streaming
- [x] מערכת RAG (embeddings + pgvector)
- [x] ווידג'ט להטמעה
