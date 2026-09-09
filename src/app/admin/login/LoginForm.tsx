"use client";

import { useState, SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@stikkman.test");
  const [password, setPassword] = useState("Sup3rSecret!");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      // Middleware only re-evaluates auth state on navigation, so a plain
      // client-side push wouldn't reflect the new session — refresh forces
      // it to re-run against the freshly-set cookie.
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again.",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8">
      <h1 className="text-xl text-white">Admin sign in</h1>
      <p className="mt-1 text-sm text-white/50">
        Sign in to manage the Projects section.
      </p>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="mt-8 flex flex-col gap-4"
      >
        <label className="flex flex-col gap-2 text-sm text-white/70">
          Email
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors focus:bg-white/10"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-white/70">
          Password
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors focus:bg-white/10"
          />
        </label>

        {error && (
          <p role="alert" className="text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm text-[#392B56] transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
