import { Compass } from "lucide-react";
import { PageContainer, EmptyState } from "@/components/ui";

const NotFound = () => (
  <PageContainer maxWidth="md">
    <EmptyState
      icon={Compass}
      title="Page not found"
      description="The link you followed may be broken, or the page may have moved."
      action={{
        label: "Take me home",
        href: "/",
      }}
    />
  </PageContainer>
);

export default NotFound;
