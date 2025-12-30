"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";

export function Trial() {
  const { signOut, user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/auth");
  };

  if (!user) return null;

  return (
    <div className="text-center mt-6">
      <button
        onClick={handleLogout}
        className="text-sm text-gray-500 hover:text-primary font-sans underline underline-offset-2 transition-colors"
      >
        Logged in with the wrong account? Log out.
      </button>
    </div>
  );
}
