import { NextResponse } from "next/server";

export async function GET() {
  console.log("🔍 [CheckEnv] Checking environment variables...");
  
  const envCheck = {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "❌ NOT SET",
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "❌ NOT SET",
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ? "✅ SET" : "❌ NOT SET",
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL ? "✅ SET" : "❌ NOT SET",
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY ? `✅ SET (${process.env.FIREBASE_PRIVATE_KEY.length} chars)` : "❌ NOT SET",
    SMTP_USER: process.env.SMTP_USER || "❌ NOT SET",
    SMTP_PASS: process.env.SMTP_PASS ? "✅ SET (hidden)" : "❌ NOT SET",
    SMTP_HOST: process.env.SMTP_HOST || "❌ NOT SET",
    SMTP_PORT: process.env.SMTP_PORT || "❌ NOT SET",
    SMTP_SECURE: process.env.SMTP_SECURE || "❌ NOT SET",
    VERCEL_URL: process.env.VERCEL_URL || "❌ NOT SET",
  };

  console.log("📋 [CheckEnv] Results:", JSON.stringify(envCheck, null, 2));

  return NextResponse.json({
    message: "Environment variables check",
    environment: envCheck,
    timestamp: new Date().toISOString(),
  });
}
