import { MessageSquare } from "lucide-react";
import { PlaceholderPage } from "./Placeholder";

const Messages = () => (
  <PlaceholderPage
    eyebrow="Messages"
    title="Direct messages"
    description="Real-time chat with your connections — typing indicators, online status, read receipts, attachments. Lands in Phase 1c (next)."
    icon={MessageSquare}
  />
);

export default Messages;
