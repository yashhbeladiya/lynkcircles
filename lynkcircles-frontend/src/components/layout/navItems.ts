import {
  Home,
  Users,
  Briefcase,
  MessageSquare,
  Bell,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Show this item in the desktop top nav. */
  desktop: boolean;
  /** Show this item in the mobile bottom tab bar. */
  mobile: boolean;
}

// News is intentionally NOT exported here — it was a LinkedIn-shape
// holdover that doesn't fit a trades marketplace. The page + backend
// route still exist (dormant) in case we revisit with marketplace-
// relevant content (rate trends, hiring tips), but it's off the nav.
export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/", icon: Home, desktop: true, mobile: true },
  { label: "Network", href: "/network", icon: Users, desktop: true, mobile: true },
  { label: "Works", href: "/works", icon: Briefcase, desktop: true, mobile: true },
  {
    label: "Messages",
    href: "/messages",
    icon: MessageSquare,
    desktop: true,
    mobile: true,
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: Bell,
    desktop: true,
    // Surfaced on mobile too — without a visible entry point on small
    // screens, the bell is unreachable and the unread badge is invisible.
    mobile: true,
  },
];
