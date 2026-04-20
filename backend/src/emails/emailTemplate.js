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
      background-color: #f4f6f8;
      font-family: Arial, sans-serif;
    }

    .container {
      width: 100%;
      padding: 20px 0;
    }
    .email-box {
      max-width: 600px;
      margin: auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 8px 20px rgba(0,0,0,0.08);
    }
    .header {
      background: linear-gradient(135deg, #4f46e5, #9333ea);
      color: white;
      text-align: center;
      padding: 30px 20px;
    }
    .header h1 {
      margin: 0;
      font-size: 26px;
    }
    .content {
      padding: 30px 25px;
      color: #333;
      line-height: 1.6;
    }
    .content h2 {
      margin-top: 0;
    }
    .btn {
      display: inline-block;
      margin-top: 20px;
      padding: 12px 20px;
      background: #4f46e5;
      color: #fff;
      text-decoration: none;
      border-radius: 8px;
      font-weight: bold;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #777;
      padding: 20px;
      background: #f9fafb;
    }
    @media(max-width: 600px) {
      .content {
        padding: 20px;
      }
      .header h1 {
        font-size: 22px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="email-box">  <!-- Header -->
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

    <a href="${clientUrl}" class="btn">Verify Account</a>

    <p style="margin-top: 30px;">
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