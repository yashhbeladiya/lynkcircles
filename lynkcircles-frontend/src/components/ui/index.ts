/**
 * UI primitives barrel — import from "@/components/ui" rather than
 * deep paths. Keeps page-level imports tidy.
 */
export { UserAvatar } from "./UserAvatar";
export type { AvatarSize } from "./UserAvatar";
export {
  StatusBadge,
  VerifiedBadge,
  NewBadge,
  HotBadge,
  TopRatedBadge,
} from "./StatusBadge";
export { EmptyState } from "./EmptyState";
export { SectionHeader } from "./SectionHeader";
export { PageContainer } from "./PageContainer";
