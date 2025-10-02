/* eslint-disable @typescript-eslint/no-require-imports */
// Quick SMTP test script - run with: node test-smtp.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "donny21001@gmail.com",
    pass: "vjllszsijuryvkov",
  },
  debug: true,
  logger: true,
});

async function testSend() {
  console.log("🔍 Testing SMTP connection...");
  
  try {
    await transporter.verify();
    console.log("✅ SMTP connection verified successfully");
    
    const info = await transporter.sendMail({
      from: '"PlantHub Test" <donny21001@gmail.com>',
      to: "donny21001@gmail.com",
      subject: "PlantHub SMTP Test",
      text: "If you see this, SMTP is working!",
      html: "<b>If you see this, SMTP is working!</b>",
    });
    
    console.log("✅ Email sent:", info.messageId);
    console.log("📬 Check your inbox at donny21001@gmail.com");
  } catch (error) {
    console.error("❌ SMTP test failed:");
    console.error(error);
  }
}

testSend();
