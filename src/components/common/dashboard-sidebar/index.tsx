"use client";

import { CarParking01FreeIcons, DashboardSquare01FreeIcons, UserGroupFreeIcons } from "@hugeicons/core-free-icons";
import { SidebarLink } from "./sidebar-link";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useCurrentUser, useEnsureCurrentUser } from "@/hooks/use-current-user";
import { useEffect } from "react";


export const sidebarLinks = [
  { href: "/dashboard" as const, label: "Dashboard", icon: DashboardSquare01FreeIcons },
  { href: "/dashboard/users" as const, label: "Users", icon: UserGroupFreeIcons },
  { href: "/dashboard/parkings" as const, label: "Parkings", icon: CarParking01FreeIcons },
] as const;

export  function DashboardSidebar() {
  const {ensureUser, userProfile}  = useEnsureCurrentUser();

  useEffect(() => {
    ensureUser();
  }, []);
  // const data = await preloadQuery(api.auth.getCurrentUser)
  // if (!data) return <div>Loading...</div>;
  // console.log("Current User in Sidebar: ", data);
  return (
    <>
      {JSON.stringify(userProfile)}
      {sidebarLinks.map((link) => (
        <SidebarLink key={link.href} {...link} />
      ))}
    </>);
}