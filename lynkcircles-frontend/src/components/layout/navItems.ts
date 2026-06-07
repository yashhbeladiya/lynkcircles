import {
  Home,
  Map,
  Briefcase,
  MessageSquare,
  Bell,
  BarChart3,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  desktop: boolean;
  mobile: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/", icon: Home, desktop: true, mobile: true },
  { label: "Works", href: "/works", icon: Briefcase, desktop: true, mobile: true },
  { label: "Map", href: "/map", icon: Map, desktop: true, mobile: true },
  { label: "Match", href: "/matches", icon: Sparkles, desktop: true, mobile: false },
  { label: "Insights", href: "/insights", icon: BarChart3, desktop: true, mobile: false },
  { label: "Messages", href: "/messages", icon: MessageSquare, desktop: true, mobile: true },
  { label: "Notifications", href: "/notifications", icon: Bell, desktop: true, mobile: true },
];
