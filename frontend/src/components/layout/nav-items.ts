import { History, LayoutDashboard, UploadCloud } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Import Leads", href: "/import", icon: UploadCloud },
  { label: "Import History", href: "/history", icon: History },
];
