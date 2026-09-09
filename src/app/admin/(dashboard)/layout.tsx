import { Suspense, type ReactNode } from "react";
import { redirect } from "next/navigation";
import Container from "@/app/shared/Container";
import { getSession } from "@/lib/api/auth";
import LogoutButton from "./LogoutButton";
import AdminPageTabs from "./components/AdminPageTabs";
import AdminSidebar from "./components/AdminSidebar";

// This is the real UX gate (the middleware is only a presence check). Every
// authed admin page hangs off this route group specifically so `login/`
// (a sibling, outside the group) never inherits this chrome or this check.
export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  return (
    // Extra bottom padding clears the global fixed-bottom Header bar from
    // the root layout, which still renders on admin routes.
    <div className="min-h-dvh w-full bg-neutral-50 pb-24">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white">
        <Container className="flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-8">
            <span className="text-sm text-neutral-900">Stikkman CMS</span>
            <AdminPageTabs />
          </div>

          <div className="flex items-center gap-4 text-sm text-neutral-500">
            <span className="hidden sm:inline">{session.email}</span>
            <LogoutButton />
          </div>
        </Container>
      </header>

      <Container className="py-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
          {/* Not optional: `AdminSidebar` calls `useSearchParams()`, which
              fails `next build` on any prerendered route without a boundary. */}
          <Suspense fallback={<div className="h-10 lg:h-64 lg:w-56" />}>
            <AdminSidebar />
          </Suspense>

          {/* `min-w-0` or this flex child won't shrink and long content
              pushes the row past the 1550px container cap. */}
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </Container>
    </div>
  );
}
