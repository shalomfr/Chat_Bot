import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // בדיקה אם המשתמש מאושר (מנהלים תמיד מאושרים)
  if (!user.isApproved && !user.isAdmin) {
    redirect("/pending-approval");
  }

  const userData = {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    isAdmin: user.isAdmin,
  };

  return (
    <div className="flex h-screen bg-gradient-to-bl from-blue-50 via-white to-gray-50">
      {/* Sidebar - will appear on the right side due to RTL */}
      <Sidebar user={userData} />

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="min-h-full p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
