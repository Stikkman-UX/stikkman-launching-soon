import Link from "next/link";

export default function BackLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex w-fit items-center gap-1 text-sm text-neutral-500 transition-colors hover:text-neutral-900"
    >
      <span aria-hidden="true">←</span>
      {label}
    </Link>
  );
}
