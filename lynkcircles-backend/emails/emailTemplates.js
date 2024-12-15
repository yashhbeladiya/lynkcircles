export function createWelcomeEmailTemplate(name, url) {
  return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to WorkWiz!</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    color: #333;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    background-color: #fff;
                    border-radius: 8px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }
                .header {
                    background-color: #1f76d2; /* WorkWiz primary blue color */
                    color: #fff;
                    padding: 20px;
                    text-align: center;
                }
                .header h1 {
                    margin: 0;
                    font-size: 24px;
                }
                .content {
                    padding: 20px;
                    text-align: left;
                }
                .content h2 {
                    color: #1f76d2;
                }
                .content p {
                    line-height: 1.6;
                }
                .button {
                    display: block;
                    margin: 20px auto;
                    padding: 10px 20px;
                    background-color: #1f76d2;
                    color: #fff;
                    text-decoration: none;
                    border-radius: 4px;
                    font-weight: bold;
                    text-align: center;
                }
                .footer {
                    background-color: #f4f4f4;
                    color: #777;
                    padding: 20px;
                    text-align: center;
                    font-size: 12px;
                }
                .footer a {
                    color: #1f76d2;
                    text-decoration: none;
                }
                .footer a:hover {
                    text-decoration: underline;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <!-- Header Section -->
                <div class="header">
                    <h1>Welcome to WorkWiz!</h1>
                </div>

                <!-- Main Content -->
                <div class="content">
                    <h2>Hello, ${name}!</h2>
                    <p>
                        Thank you for joining WorkWiz, the platform that connects you with skilled non-professional workers in your area. Whether you're looking for assistance with repairs, maintenance, or other essential tasks, you've come to the right place.
                    </p>
                    <p>
                        We’re excited to have you as part of our growing community, where reliable services meet convenience and affordability.
                    </p>
                    <a href=${url} class="button">Get Started</a>
                </div>

                <!-- Footer Section -->
                <div class="footer">
                    <p>
                        If you have any questions, feel free to <a href="mailto:support@workwiz.com">contact our support team</a>.
                    </p>
                    <p>
                        © 2024 WorkWiz. All rights reserved.
                    </p>
                </div>
            </div>
        </body>
        </html>
    `;
}

export function createCommentNotificationTemplate(
  name,
  commenterName,
  postUrl,
  comment
) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Comment Notification</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 20px;
            }
            .container {
                background-color: #ffffff;
                padding: 20px;
                border-radius: 5px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .header {
                font-size: 24px;
                margin-bottom: 10px;
            }
            .content {
                font-size: 16px;
                margin-bottom: 20px;
            }
            .footer {
                font-size: 14px;
                color: #888888;
            }
            a {
                color: #1a73e8;
                text-decoration: none;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">New Comment on Your Post</div>
            <div class="content">
                <p>Hi <strong>{${name}}</strong>,</p>
                <p><strong>{${commenterName}}</strong> has commented on your post. Here is what they said:</p>
                <blockquote>{${comment}}</blockquote>
                <p>You can view the post and reply to the comment <a href="{${postUrl}}">here</a>.</p>
            </div>
            <div class="footer">
                <p>Thank you for being a part of our community!</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

export function createConnectionAcceptedTemplate(
  senderName,
  recipientName,
  profileURL
) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Connection Request Accepted</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 20px;
            }
            .container {
                background-color: #ffffff;
                padding: 20px;
                border-radius: 5px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .header {
                font-size: 24px;
                margin-bottom: 10px;
            }
            .content {
                font-size: 16px;
                margin-bottom: 20px;
            }
            .footer {
                font-size: 14px;
                color: #888888;
            }
            a {
                color: #1a73e8;
                text-decoration: none;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">Connection Request Accepted</div>
            <div class="content">
                <p>Hi <strong>{${senderName}}</strong>,</p>
                <p>Your connection request to <strong>{${recipientName}}</strong> has been accepted. You are now connected!</p>
                <p>You can view their profile and start collaborating <a href="{${profileURL}}">here</a>.</p>
                <p>Best regards,<br>The Workwiz Team</p>
                </div>
                <div class="footer">
                    <p>&copy; 2024 Workwiz. All rights reserved.</p>
                </div>
        </div>
    </body>
    </html>
    `;
}
