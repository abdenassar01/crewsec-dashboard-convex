import { CarParking01FreeIcons, DashboardSquare01FreeIcons, UserGroupFreeIcons } from "@hugeicons/core-free-icons";
import { SidebarLink } from "./sidebar-link";

export const sidebarLinks = [
  { href: "/dashboard" as const, label: "Dashboard", icon: DashboardSquare01FreeIcons },
  { href: "/dashboard/users" as const, label: "Users", icon: UserGroupFreeIcons },
  { href: "/dashboard/parkings" as const, label: "Parkings", icon: CarParking01FreeIcons },
] as const;

export  function DashboardSidebar() {
  return (
    <>
      {sidebarLinks.map((link) => (
        <SidebarLink key={link.href} {...link} />
      ))}
    </>);
}