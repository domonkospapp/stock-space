import Link from "next/link";
import { ReactNode } from "react";

interface MenuItemProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  active?: boolean;
  textColor?: string;
}

export default function MenuItem({
  children,
  href,
  onClick,
  className = "",
  active = false,
  textColor = "text-foreground",
}: MenuItemProps) {
  const baseStyles = `font-space-mono text-lg ${textColor} px-4 py-2 hover:text-gray-300 transition-colors cursor-pointer lowercase`;
  const activeStyles = active ? "underline" : "";
  
  const combinedClassName = `${baseStyles} ${activeStyles} ${className}`.trim();

  if (href) {
    return (
      <Link href={href} className={combinedClassName}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={combinedClassName}>
      {children}
    </button>
  );
}
