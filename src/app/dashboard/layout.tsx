import Link from "next/link";
import type { ReactNode } from "react";

import Image from "next/image";

// import { getToken } from "@/lib/auth/auth-server";
import { DashboardSidebar } from "@/components";
import {LogoutButton} from "@/components/core";
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  // const auth = await getToken()

  // if(!auth) {
  //   redirect("/login");
  // }

  return (
    <div className="grid h-screen w-full grid-cols-1 md:grid-cols-[280px_1fr]">
      <aside className="hidden border-r bg-sidebar md:flex md:flex-col">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <Image src="/logo.svg" alt="Crewsec Logo" width={32} height={32} />
              <span className="text-xl">Crewsec Admin</span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid items-start px-4 text-sm font-medium">
              <DashboardSidebar />
            </nav>
          </div>
          <div className="mt-auto border-t p-4">
            <div className="text-sm">
             <div className="">Hello world</div>
            </div>
            <LogoutButton />
          </div>
        </div>
      </aside>
      <main className="flex flex-col h-screen">
        {/* You can add a header here if needed for mobile nav, etc. */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
            {children}
        </div>
      </main>
    </div>
  );
}