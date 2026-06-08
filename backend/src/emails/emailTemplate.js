export function createWelcomeEmailTemplate(name, clientUrl) {
    return `
    <!DOCTYPE html><html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chit-Chat Email</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      /* Main App Background Canvas (#0b1326) */
      background-color: #0b1326;
      font-family: Arial, sans-serif;
    }

    .container {
      width: 100%;
      padding: 20px 0;
    }
    .email-box {
      max-width: 650px;
      margin: auto;
      /* Main Internal Component Card Surface (#131b2e) */
      background: #131b2e;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid rgba(70, 69, 85, 0.25);
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    }
    .header {
      /* Keeping your rich branding gradient intact */
      background: linear-gradient(135deg, #4f46e5, #9333ea);
      color: #ffffff;
      text-align: center;
      padding: 35px 20px;
    }
    .header h1 {
      margin: 0;
      font-size: 26px;
      font-weight: bold;
      letter-spacing: -0.5px;
    }
    .header p {
      margin: 8px 0 0 0;
      color: rgba(255, 255, 255, 0.8);
      font-size: 14px;
    }
    .content {
      padding: 35px 30px;
      /* Swapped dark gray text for your premium brand text tone (#dae2fd) */
      color: #dae2fd;
      line-height: 1.6;
    }
    .content h2 {
      margin-top: 0;
      color: #ffffff;
      font-size: 22px;
    }
    .content strong {
      color: #ddb8ff; /* Highlight key words with your accent tone */
    }
    .btn {
      display: inline-block;
      margin-top: 24px;
      padding: 12px 28px;
      background: #4f46e5;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
    }
    .footer {
      text-align: center;
      font-size: 12px;
      /* Swapped light gray footer bg for a deeper low-opacity wash layout look */
      color: rgba(199, 196, 216, 0.5);
      padding: 24px;
      background: #0d1629;
      border-top: 1px solid rgba(70, 69, 85, 0.15);
    }
    @media(max-width: 600px) {
      .content {
        padding: 24px;
      }
      .header h1 {
        font-size: 22px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="email-box">
      <!-- Header -->
      <div class="header">
        <h1>💬 Chit-Chat</h1>
        <p>Connect. Chat. Enjoy.</p>
      </div>

      <!-- Content -->
      <div class="content">
        <h2>Hello ${name},</h2>
        <p>
          Welcome to <strong>Chit-Chat</strong> 🎉 — your new space to connect, share ideas,
          and have real conversations.
        </p>

        <p>
          You're just one step away from getting started. Click the button below
          to verify your account and begin chatting.
        </p>

        <div style="text-align: center; margin-bottom: 8px;">
          <a href="${clientUrl}" class="btn">Verify Account</a>
        </div>

        <p style="margin-top: 35px; font-size: 13px; color: rgba(199, 196, 216, 0.6);">
          If you didn’t create an account, you can safely ignore this email.
        </p>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p>© 2026 Chit-Chat. All rights reserved.</p>
        <p>Made with ❤️ for real conversations.</p>
      </div>
    </div>
  </div>
</body>
</html>
    `
}
