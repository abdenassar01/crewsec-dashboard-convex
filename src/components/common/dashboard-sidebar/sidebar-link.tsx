"use client"

import { cn } from "@/lib";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { sidebarLinks } from ".";

export function SidebarLink({ href, label, icon }: (typeof sidebarLinks)[number]) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        active && "bg-sidebar-accent text-sidebar-accent-foreground"
      )}
    >
      <HugeiconsIcon icon={icon} className="h-5 w-5" />
      {label}
    </Link>
  );
}