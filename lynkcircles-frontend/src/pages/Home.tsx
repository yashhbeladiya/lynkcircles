import { Home as HomeIcon } from "lucide-react";
import { PlaceholderPage } from "./Placeholder";

const Home = () => (
  <PlaceholderPage
    eyebrow="Feed"
    title="Your home feed"
    description="Posts from your network, recommended workers nearby, and trending updates."
    icon={HomeIcon}
  />
);

export default Home;
