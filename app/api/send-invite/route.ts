import { NextRequest, NextResponse } from "next/server";

function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  try {
    const { Resend } = require("resend");
    return new Resend(process.env.RESEND_API_KEY);
  } catch (e) {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, fromName, link } = await request.json();

    if (!email || !fromName || !link) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const resend = getResend();
    if (!resend) {
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #e8e8e8;
      background-color: #041610;
      margin: 0;
      padding: 0;
    }
    .wrapper {
      background-color: #071F14;
      margin: 20px auto;
      max-width: 600px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }
    .header {
      background: linear-gradient(135deg, #071F14 0%, #0D3D28 100%);
      color: #ffffff;
      padding: 40px 20px;
      text-align: center;
      border-bottom: 1px solid #134D34;
    }
    .header h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 600;
      font-family: 'Syne', sans-serif;
    }
    .content {
      padding: 40px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 500;
      margin-bottom: 20px;
      color: #ffffff;
    }
    .body-text {
      font-size: 15px;
      color: #a0b8ad;
      margin-bottom: 24px;
      line-height: 1.8;
    }
    .cta-button {
      display: inline-block;
      background-color: #12B87A;
      color: #071F14;
      padding: 14px 32px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 16px;
    }
    .cta-wrapper {
      text-align: center;
      margin: 32px 0;
    }
    .note {
      font-size: 13px;
      color: #6b8577;
      margin-top: 24px;
      line-height: 1.6;
    }
    .footer {
      background-color: #041610;
      padding: 24px 40px;
      text-align: center;
      border-top: 1px solid #134D34;
      font-size: 12px;
      color: #6b8577;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>before we<span style="color: #12B87A;">…</span></h1>
    </div>
    <div class="content">
      <p class="greeting">Hi there,</p>
      <p class="body-text">
        ${fromName} has invited you to take a short alignment questionnaire on <strong>Before We</strong> — a private tool for couples to get on the same page about finances and major life decisions.
      </p>
      <p class="body-text">
        ${fromName} has already completed their answers. Now it's your turn. It takes about 5 minutes, and once you're done, you'll both see a side-by-side alignment report showing where you agree and where you might want to talk things through.
      </p>
      <div class="cta-wrapper">
        <a href="${link}" class="cta-button">Start my questions</a>
      </div>
      <p class="note">
        Your answers are private until the comparison is generated. This is not legal advice — just a conversation starter.
      </p>
    </div>
    <div class="footer">
      <p><strong>Before We</strong> — the conversation before the commitment</p>
    </div>
  </div>
</body>
</html>
    `;

    const response = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: `${fromName} invited you to Before We`,
      html: htmlContent,
    });

    if (response.error) {
      return NextResponse.json(
        { error: response.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending invite:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
