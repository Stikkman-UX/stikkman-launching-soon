import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { listAdminSectors } from "@/lib/api/sectors";
import SectorsAdminBoard from "./components/SectorsAdminBoard";

export const metadata: Metadata = {
  title: "Sectors — Admin",
};

// Kept separate from the component body per `react-hooks/error-boundaries`
// — see the same pattern in `../case-studies/page.tsx` for why.
async function loadSectors() {
  try {
    return await listAdminSectors();
  } catch (error) {
    // A 401 here means the 15min access token expired mid-session, not that
    // something is broken — send the admin back to sign in.
    if (error instanceof ApiError && error.status === 401) {
      redirect("/admin/login");
    }
    throw error;
  }
}

export default async function AdminSectorsPage() {
  const sectors = await loadSectors();

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl text-neutral-900">Sectors</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Manage the sector pages, each built from a fixed set of editable
          sections.
        </p>
      </div>

      <SectorsAdminBoard initialSectors={sectors} />
    </div>
  );
}
