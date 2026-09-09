"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/api/auth";

export default function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);

    try {
      await logout();
    } catch {
      // Session cookie may already be gone/expired — proceed to redirect
      // regardless, the middleware will re-gate `/admin` either way.
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className="rounded-full border border-neutral-300 px-4 py-1.5 text-xs uppercase tracking-wide text-neutral-600 transition-colors hover:border-neutral-900 hover:text-neutral-900 disabled:opacity-50"
    >
      {isLoading ? "Signing out..." : "Logout"}
    </button>
  );
}
