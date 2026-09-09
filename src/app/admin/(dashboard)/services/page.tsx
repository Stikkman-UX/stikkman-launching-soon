import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { listAdminServices } from "@/lib/api/services";
import ServicesAdminBoard from "./components/ServicesAdminBoard";

export const metadata: Metadata = {
  title: "Services — Admin",
};

// Kept separate from the component body per `react-hooks/error-boundaries`
// — see the same pattern in `../sectors/page.tsx` for why.
async function loadServices() {
  try {
    return await listAdminServices();
  } catch (error) {
    // A 401 here means the 15min access token expired mid-session, not that
    // something is broken — send the admin back to sign in.
    if (error instanceof ApiError && error.status === 401) {
      redirect("/admin/login");
    }
    throw error;
  }
}

export default async function AdminServicesPage() {
  const services = await loadServices();

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl text-neutral-900">Services</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Manage the service pages, each built from a fixed set of editable
          sections.
        </p>
      </div>

      <ServicesAdminBoard initialServices={services} />
    </div>
  );
}
