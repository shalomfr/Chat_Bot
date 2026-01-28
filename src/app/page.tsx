import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageSquare, Zap, Shield, Code } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">ChatBot SaaS</span>
          </div>
          <Link href="/login">
            <Button>התחבר עם Google</Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold mb-6">
            צור צ'אטבוט חכם לעסק שלך
            <span className="text-primary"> בדקות</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            הפלטפורמה שלנו מאפשרת לך ליצור צ'אטבוט מותאם אישית,
            להעלות מסמכים ולינקים, ולהטמיע אותו באתר שלך בקלות
          </p>
          <Link href="/login">
            <Button size="lg" className="text-lg px-8">
              התחל עכשיו - חינם
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white p-8 rounded-xl shadow-sm border">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">מהיר ופשוט</h3>
            <p className="text-muted-foreground">
              העלה מסמכים או הוסף לינקים, והצ'אטבוט שלך מוכן לשימוש תוך דקות
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm border">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">חכם ומדויק</h3>
            <p className="text-muted-foreground">
              מבוסס על טכנולוגיית AI מתקדמת שמבינה את התוכן שלך ועונה בצורה מדויקת
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm border">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Code className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">הטמעה קלה</h3>
            <p className="text-muted-foreground">
              שורת קוד אחת - זה כל מה שצריך כדי להוסיף את הצ'אטבוט לאתר שלך
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">איך זה עובד?</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="font-semibold mb-2">התחבר</h3>
              <p className="text-sm text-muted-foreground">
                התחבר עם חשבון Google שלך
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="font-semibold mb-2">העלה תוכן</h3>
              <p className="text-sm text-muted-foreground">
                העלה מסמכים או הוסף לינקים לאתרים
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="font-semibold mb-2">התאם אישית</h3>
              <p className="text-sm text-muted-foreground">
                הגדר את אופי הצ'אטבוט והמראה שלו
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h3 className="font-semibold mb-2">הטמע</h3>
              <p className="text-sm text-muted-foreground">
                הוסף שורת קוד לאתר שלך וזהו!
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-20 border-t">
        <div className="text-center text-muted-foreground">
          <p>© 2024 ChatBot SaaS. כל הזכויות שמורות.</p>
        </div>
      </footer>
    </div>
  );
}
