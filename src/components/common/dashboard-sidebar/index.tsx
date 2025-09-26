import {
  CarParking01FreeIcons,
  DashboardSquare01FreeIcons,
  UserGroupFreeIcons,
  Car03FreeIcons,
  File01FreeIcons,
  AlertCircleFreeIcons,
  CancelSquareFreeIcons,
  Settings05FreeIcons,
} from "@hugeicons/core-free-icons";
import { SidebarLink } from "./sidebar-link";

export const sidebarLinks = [
  { href: "/dashboard" as const, label: "Dashboard", icon: DashboardSquare01FreeIcons },
  { href: "/dashboard/users" as const, label: "Users", icon: UserGroupFreeIcons },
  { href: "/dashboard/parkings" as const, label: "Parkings", icon: CarParking01FreeIcons },
  { href: "/dashboard/vehicles" as const, label: "Vehicles", icon: Car03FreeIcons },
  { href: "/dashboard/control-fees" as const, label: "Control Fees", icon: File01FreeIcons },
  { href: "/dashboard/felparkering" as const, label: "Felparkering", icon: AlertCircleFreeIcons },
  { href: "/dashboard/makuleras" as const, label: "Makuleras", icon: CancelSquareFreeIcons },
  { href: "/dashboard/static-data" as const, label: "Static Data", icon: Settings05FreeIcons },
] as const;

export  function DashboardSidebar() {
  return (
    <>
      {sidebarLinks.map((link) => (
        <SidebarLink key={link.href} {...link} />
      ))}
    </>);
}