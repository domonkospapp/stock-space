import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

interface MenuWrapperProps {
  children: ReactNode;
  logoHref?: string;
  logoTextColor?: string;
}

export default function MenuWrapper({
  children,
  logoHref = "/",
  logoTextColor = "text-foreground",
}: MenuWrapperProps) {
  return (
    <header className="relative flex items-center py-8 px-8 w-full max-w-7xl mx-auto">
      {/* Logo */}
      <Link
        href={logoHref}
        className="flex items-center space-x-3 flex-shrink-0"
      >
        <Image
          src="/astronaut.svg"
          alt="stck.space"
          width={32}
          height={32}
          className="w-8 h-8"
        />
        <span className={`font-space-mono text-xl ${logoTextColor}`}>
          stck.space
        </span>
      </Link>

      {/* Menu Items - Takes remaining space */}
      <div className="flex-1 flex items-center justify-end">{children}</div>
    </header>
  );
}
