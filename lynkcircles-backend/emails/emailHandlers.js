import { mailtrapClient, sender } from "../lib/mailtrap.js";
import {
  createWelcomeEmailTemplate,
  createCommentNotificationTemplate,
  createConnectionAcceptedTemplate,
} from "../emails/emailTemplates.js";

export const sendWelcomeEmail = async (email, name, url) => {
  const recipients = [
    {
      email,
      name,
    },
  ];
  const emailData = {
    from: sender,
    to: recipients,
    subject: "Welcome to our platform!",
    html: createWelcomeEmailTemplate(name, url),
    category: "Welcome Email",
  };
  try {
    await mailtrapClient.send(emailData);
    console.log(`Welcome email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending welcome email: ${error.message}`);
  }
};

export const sendCommentNotificationEmail = async (
  email,
  name,
  commenterName,
  postUrl,
  comment
) => {
  const recipients = [
    {
      email,
      name,
    },
  ];
  const emailData = {
    from: sender,
    to: recipients,
    subject: `${commenterName} commented on your post`,
    html: createCommentNotificationTemplate(
      name,
      commenterName,
      postUrl,
      comment
    ),
    category: "Comment Notification",
  };
  try {
    await mailtrapClient.send(emailData);
    console.log(`Comment notification email sent to ${email}`);
  } catch (error) {
    console.error(`Error sending comment notification email: ${error.message}`);
  }
};

export const sendConnectionAcceptedEmail = async (
  senderEmail,
  senderName,
  recipientName,
  profileURL
) => {
  const recipients = [
    {
      email: senderEmail,
      name: senderName,
    },
  ];

  const emailData = {
    from: sender,
    to: recipients,
    subject: `${recipientName} accepted your connection request`,
    html: createConnectionAcceptedTemplate(
      senderName,
      recipientName,
      profileURL
    ),
    category: "Connection Accepted",
  };

  try {
    await mailtrapClient.send(emailData);
    console.log(`Connection accepted email sent to ${senderEmail}`);
  } catch (error) {
    console.error(`Error sending connection accepted email: ${error.message}`);
  }
};
