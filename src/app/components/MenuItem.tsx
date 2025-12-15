import Link from "next/link";
import { ReactNode } from "react";

interface MenuItemProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export default function MenuItem({
  children,
  href,
  onClick,
  className = "",
}: MenuItemProps) {
  const baseStyles =
    "font-space-mono text-lg text-foreground px-4 py-2 hover:text-gray-300 transition-colors cursor-pointer lowercase";

  if (href) {
    return (
      <Link href={href} className={`${baseStyles} ${className}`}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={`${baseStyles} ${className}`}>
      {children}
    </button>
  );
}
