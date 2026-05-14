import { Users } from "lucide-react";
import { PlaceholderPage } from "./Placeholder";

const Network = () => (
  <PlaceholderPage
    eyebrow="Network"
    title="People in your circles"
    description="Pending connection requests, suggested workers, and people you know."
    icon={Users}
  />
);

export default Network;
