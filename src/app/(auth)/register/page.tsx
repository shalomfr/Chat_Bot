"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// With Google-only auth, register and login are the same
export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return null;
}
