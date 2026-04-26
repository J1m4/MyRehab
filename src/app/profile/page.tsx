"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ProfileRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect /profile to /account as that's where the profile management lives
    router.replace("/account");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
    </div>
  );
}
