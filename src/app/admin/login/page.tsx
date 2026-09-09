import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Admin Login — Stikkman UX",
};

// No nav chrome here by design — this route sits outside the `(dashboard)`
// route group specifically so it stays a bare, unauthenticated shell.
export default function AdminLoginPage() {
  return (
    <main className="flex min-h-dvh w-full items-center justify-center bg-[#392B56] px-4">
      <LoginForm />
    </main>
  );
}
