import { useParams } from "react-router-dom";
import { User } from "lucide-react";
import { PlaceholderPage } from "./Placeholder";

const Profile = () => {
  const { username } = useParams<{ username: string }>();
  return (
    <PlaceholderPage
      eyebrow={username ? `@${username}` : "Profile"}
      title="User profile"
      description="Header, about, services offered, portfolio, reviews, and activity. Builds in Phase 2."
      icon={User}
    />
  );
};

export default Profile;
