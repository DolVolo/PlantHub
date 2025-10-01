import nodemailer from "nodemailer";

interface MailerConfig {
  user: string;
  pass: string;
  host: string;
  port: number;
  secure: boolean;
}

function resolveMailerConfig(): MailerConfig | null {
  const user = process.env.SMTP_USER ?? process.env.GMAIL_USER ?? process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS ?? process.env.GMAIL_APP_PASSWORD ?? process.env.EMAIL_PASS;

  if (!user || !pass) {
    return null;
  }

  const host = process.env.SMTP_HOST ?? "smtp.gmail.com";
  const port = Number.parseInt(process.env.SMTP_PORT ?? (host === "smtp.gmail.com" ? "465" : "587"), 10);
  const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465;

  return {
    user,
    pass,
    host,
    port,
    secure,
  };
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter(config: MailerConfig) {
  if (!transporter) {
    const enableDebug = process.env.SMTP_DEBUG === "true";
    transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
      logger: enableDebug,
      debug: enableDebug,
    });
    if (enableDebug) {
      console.info("[Mailer] Transport created", {
        host: config.host,
        port: config.port,
        secure: config.secure,
        userMasked: config.user.replace(/(.{2}).+(@)/, "$1***$2"),
      });
    }
  }
  return transporter;
}

interface SendPasswordResetEmailInput {
  to: string;
  token: string;
  expiresAt: Date;
}

export interface SendPasswordResetEmailResult {
  delivered: boolean;
  message: string;
  resetUrl: string;
  error?: string;
}

export async function sendPasswordResetEmail({ to, token, expiresAt }: SendPasswordResetEmailInput): Promise<SendPasswordResetEmailResult> {
  console.log("📧 [Mailer] sendPasswordResetEmail called for:", to?.substring(0, 5) + "***");
  const config = resolveMailerConfig();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const resetUrl = `${appUrl.replace(/\/$/, "")}/reset-password?token=${token}`;

  console.log("🔍 [Mailer] Config resolved:", config ? "✅ Yes" : "❌ No");
  console.log("🔍 [Mailer] APP_URL:", appUrl);
  
  if (!config) {
    const message = "ยังไม่ได้ตั้งค่า SMTP credentials (.env.local) โทเค็นถูกบันทึกไว้บนหน้าจอสำหรับทดสอบ";
    console.warn("[Mailer] Unable to send email - missing SMTP credentials");
    return {
      delivered: false,
      message,
      resetUrl,
    };
  }

  try {
    console.log("📧 [Mailer] Creating transport...");
    const transporterInstance = getTransporter(config);
    const ttlMinutes = Math.max(1, Math.round((expiresAt.getTime() - Date.now()) / 60000));

    // Optional connectivity verification before sending (lightweight noop)
    if (process.env.SMTP_VERIFY !== "false") {
      try {
        console.log("🔍 [Mailer] Verifying connection...");
        await transporterInstance.verify();
        console.log("✅ [Mailer] Connection verified");
      } catch (verifyError) {
        const msg = verifyError instanceof Error ? verifyError.message : String(verifyError);
        console.error("[Mailer] SMTP verify failed", msg);
      }
    }

    console.log("📧 [Mailer] Sending email to:", to?.substring(0, 5) + "***");
    await transporterInstance.sendMail({
      from: `PlantHub ✉️ <${config.user}>`,
      to,
      subject: "PlantHub | ลิงก์ตั้งรหัสผ่านใหม่",
      text: `สวัสดีค่ะ/ครับ\n\nลิงก์สำหรับตั้งรหัสผ่านใหม่: ${resetUrl}\nโทเค็นนี้จะหมดอายุภายใน ${ttlMinutes} นาที\n\nขอบคุณที่ใช้บริการ PlantHub`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 480px; margin: auto;">
          <h2 style="color:#047857;">PlantHub | ตั้งรหัสผ่านใหม่</h2>
          <p>กดปุ่มด้านล่างเพื่อเปิดหน้าตั้งรหัสผ่านใหม่:</p>
          <p style="text-align:center; margin: 24px 0;">
            <a href="${resetUrl}" style="background:#047857; color:#fff; padding:12px 20px; border-radius:9999px; text-decoration:none; display:inline-block;">ตั้งรหัสผ่านใหม่</a>
          </p>
          <p>หรือคัดลอกลิงก์นี้ไปวางในเบราว์เซอร์: <br /><a href="${resetUrl}">${resetUrl}</a></p>
          <p style="color:#065f46;">โทเค็นนี้จะหมดอายุใน ${ttlMinutes} นาที</p>
          <hr style="border:none; border-top:1px solid #d1fae5; margin:24px 0;" />
          <small style="color:#6b7280;">หากคุณไม่ได้ร้องขอการเปลี่ยนรหัสผ่าน สามารถละเว้นอีเมลนี้ได้</small>
        </div>
      `,
    });

    console.log("✅ [Mailer] Email sent successfully");
    return {
      delivered: true,
      message: "ส่งอีเมลตั้งรหัสผ่านใหม่เรียบร้อย",
      resetUrl,
    };
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : "ไม่ทราบสาเหตุ";
    console.error("[Mailer] Failed to send reset email", {
      error: errMessage,
      host: config?.host,
      port: config?.port,
      secure: config?.secure,
    });
    return {
      delivered: false,
      message: "ส่งอีเมลไม่สำเร็จ แต่ยังสามารถใช้โทเค็นที่แสดงบนหน้าจอได้",
      resetUrl,
      error: errMessage,
    };
  }
}
