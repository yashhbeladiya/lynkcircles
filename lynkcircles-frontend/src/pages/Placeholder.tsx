import { PageContainer, SectionHeader, EmptyState } from "@/components/ui";
import { Construction, type LucideIcon } from "lucide-react";

interface Props {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
}

/**
 * Shared placeholder shell for pages that aren't built yet. Lets us
 * route everything correctly without each page needing custom chrome,
 * and gives a consistent look while pages are filled in across phases.
 */
export const PlaceholderPage = ({
  eyebrow,
  title,
  description,
  icon: Icon = Construction,
}: Props) => (
  <PageContainer maxWidth="lg">
    <SectionHeader
      eyebrow={eyebrow ?? "Coming soon"}
      title={title}
      description={description}
    />
    <EmptyState
      icon={Icon}
      title="This page is on the build list."
      description="The chrome is wired and routing works — feature content lands in upcoming commits."
    />
  </PageContainer>
);
