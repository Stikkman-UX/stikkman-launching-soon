import { ElementType, ReactNode } from "react";

export default function Container({
  as: Tag = "div",
  className = "",
  children,
}: {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag className={`mx-auto w-full max-w-[1550px] px-4 lg:px-20 ${className}`}>
      {children}
    </Tag>
  );
}
