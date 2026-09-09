export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-6 w-40 animate-pulse rounded bg-neutral-200" />
      <div className="h-40 w-full animate-pulse rounded-xl bg-neutral-100" />
      <div className="h-40 w-full animate-pulse rounded-xl bg-neutral-100" />
    </div>
  );
}
