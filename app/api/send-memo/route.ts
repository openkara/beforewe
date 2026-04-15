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

interface ComparisonItem {
  topic: string;
  aAnswer: string;
  bAnswer: string;
}

interface ComparisonData {
  aligned: ComparisonItem[];
  conversation: ComparisonItem[];
  attorney: ComparisonItem[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, partnerAName, partnerBName, comparisonData } = body;

    if (!email || !partnerAName || !partnerBName || !comparisonData) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const data = comparisonData as ComparisonData;

    // Build the HTML email content
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1c1917;
      background-color: #f5f5f4;
      margin: 0;
      padding: 0;
    }
    .wrapper {
      background-color: #ffffff;
      margin: 20px auto;
      max-width: 600px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%);
      color: #ffffff;
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 600;
    }
    .content {
      padding: 40px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 500;
      margin-bottom: 20px;
      color: #1c1917;
    }
    .intro-text {
      font-size: 14px;
      color: #57534e;
      margin-bottom: 30px;
      line-height: 1.8;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #1c1917;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #f5f5f4;
    }
    .aligned .section-title {
      border-bottom-color: #10b981;
      color: #065f46;
    }
    .conversation .section-title {
      border-bottom-color: #3b82f6;
      color: #1e40af;
    }
    .attorney .section-title {
      border-bottom-color: #f59e0b;
      color: #92400e;
    }
    .item {
      margin-bottom: 15px;
      padding: 12px;
      background-color: #f9fafb;
      border-left: 4px solid #0d9488;
      border-radius: 4px;
    }
    .aligned .item {
      background-color: #ecfdf5;
      border-left-color: #10b981;
    }
    .conversation .item {
      background-color: #eff6ff;
      border-left-color: #3b82f6;
    }
    .attorney .item {
      background-color: #fffbeb;
      border-left-color: #f59e0b;
    }
    .item-topic {
      font-weight: 600;
      color: #1c1917;
      font-size: 14px;
      margin-bottom: 6px;
    }
    .item-answer {
      font-size: 13px;
      color: #57534e;
      margin: 4px 0;
    }
    .steps {
      background-color: #f9fafb;
      border: 1px solid #d7d3cf;
      border-radius: 6px;
      padding: 20px;
      margin: 25px 0;
    }
    .steps-title {
      font-weight: 600;
      font-size: 15px;
      margin-bottom: 12px;
      color: #1c1917;
    }
    .step {
      font-size: 13px;
      color: #57534e;
      margin: 8px 0;
      line-height: 1.6;
    }
    .step-number {
      font-weight: 600;
      color: #0d9488;
    }
    .footer {
      background-color: #f5f5f4;
      padding: 30px 40px;
      text-align: center;
      border-top: 1px solid #d7d3cf;
      font-size: 12px;
      color: #78716f;
    }
    .footer p {
      margin: 8px 0;
      line-height: 1.6;
    }
    .empty-section {
      color: #a1a09f;
      font-style: italic;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>before we<span style="color: rgba(255,255,255,0.8);">.</span></h1>
    </div>
    <div class="content">
      <p class="greeting">Hi ${partnerAName},</p>
      <p class="intro-text">
        Your Before We alignment summary with ${partnerBName} is ready. Here's a quick overview of where you stand together.
      </p>

      ${
        data.aligned && data.aligned.length > 0
          ? `
      <div class="section aligned">
        <div class="section-title">✓ You Align On These</div>
        ${data.aligned
          .map(
            (item) => `
        <div class="item">
          <div class="item-topic">${item.topic}</div>
          <div class="item-answer"><strong>${partnerAName}:</strong> ${item.aAnswer}</div>
          <div class="item-answer"><strong>${partnerBName}:</strong> ${item.bAnswer}</div>
        </div>
        `
          )
          .join("")}
      </div>
      `
          : `<div class="section"><div class="empty-section">No fully aligned topics.</div></div>`
      }

      ${
        data.conversation && data.conversation.length > 0
          ? `
      <div class="section conversation">
        <div class="section-title">• Worth Discussing</div>
        ${data.conversation
          .map(
            (item) => `
        <div class="item">
          <div class="item-topic">${item.topic}</div>
          <div class="item-answer"><strong>${partnerAName}:</strong> ${item.aAnswer}</div>
          <div class="item-answer"><strong>${partnerBName}:</strong> ${item.bAnswer}</div>
        </div>
        `
          )
          .join("")}
      </div>
      `
          : ""
      }

      ${
        data.attorney && data.attorney.length > 0
          ? `
      <div class="section attorney">
        <div class="section-title">⚠ Discuss With Your Attorney</div>
        ${data.attorney
          .map(
            (item) => `
        <div class="item">
          <div class="item-topic">${item.topic}</div>
          <div class="item-answer"><strong>${partnerAName}:</strong> ${item.aAnswer}</div>
          <div class="item-answer"><strong>${partnerBName}:</strong> ${item.bAnswer}</div>
        </div>
        `
          )
          .join("")}
      </div>
      `
          : ""
      }

      <div class="steps">
        <div class="steps-title">How to Use This With Your Attorney</div>
        <div class="step"><span class="step-number">1.</span> Review this summary together and discuss the harder conversations</div>
        <div class="step"><span class="step-number">2.</span> Bring this to your attorney along with any specific concerns</div>
        <div class="step"><span class="step-number">3.</span> Use it as a starting point for your prenup or postnup agreement</div>
      </div>
    </div>
    <div class="footer">
      <p><strong>Before We</strong> is a private alignment tool for couples — not legal advice.</p>
      <p>This summary is for your personal use only. Always consult with a licensed attorney about your specific situation.</p>
    </div>
  </div>
</body>
</html>
    `;

    const resend = getResend();
    if (!resend) {
      return NextResponse.json({ error: "Email service not configured. Add RESEND_API_KEY to environment variables." }, { status: 500 });
    }

    const response = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: `${partnerAName} & ${partnerBName} — Your Before We Alignment Summary`,
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
    console.error("Error sending memo:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
