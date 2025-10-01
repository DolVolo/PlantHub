"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../hooks/useAuth";

interface ResetResponse {
  message: string;
  token?: string;
  expiresAt?: string;
  resetUrl?: string;
  emailDelivered?: boolean;
}

function ForgotPasswordInner() {
  const { requestPasswordReset, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<ResetResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const response = await requestPasswordReset(email.trim().toLowerCase());
      setResult(response);
    } catch (err) {
      console.error(err);
      setError("ไม่สามารถส่งคำขอรีเซ็ตรหัสผ่านได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-lg space-y-6 rounded-3xl border border-emerald-100 bg-white/80 p-8 shadow-lg">
      <h1 className="text-2xl font-semibold text-emerald-900">ลืมรหัสผ่าน?</h1>
      <p className="text-sm text-emerald-900/70">
        กรอกอีเมลที่ใช้สมัครสมาชิก เราจะส่งโทเค็นสำหรับตั้งรหัสผ่านใหม่ให้คุณ (ตัวอย่างนี้จะแสดงโทเค็นทางหน้าจอ)
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="flex flex-col gap-2 text-sm text-emerald-900/80">
          อีเมล
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="rounded-2xl border border-emerald-200 px-4 py-2 text-sm focus:border-emerald-400 focus:outline-none"
          />
        </label>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {result ? (
          <div className="space-y-2 rounded-2xl bg-emerald-50/80 p-4 text-xs text-emerald-900/80">
            <p className="font-medium text-emerald-800">{result.message}</p>
            {result.token ? (
              <>
                <p>
                  โทเค็นสำหรับรีเซ็ตรหัสผ่าน: <span className="font-mono text-emerald-900">{result.token}</span>
                </p>
                {result.expiresAt ? <p>โทเค็นหมดอายุ: {new Date(result.expiresAt).toLocaleString()}</p> : null}
                {result.resetUrl ? (
                  <p>
                    ลิงก์ไปหน้าตั้งรหัสผ่านใหม่: {" "}
                    <a
                      href={result.resetUrl}
                      className="break-all font-mono text-emerald-700 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {result.resetUrl}
                    </a>
                  </p>
                ) : null}
                {result.emailDelivered === false ? (
                  <p className="text-amber-700">ระบบยังไม่ได้ส่งอีเมล (โหมดเดโม) ให้ใช้โทเค็นด้านบนได้เลย</p>
                ) : result.emailDelivered ? (
                  <p className="text-emerald-700">ส่งอีเมลแล้ว โปรดตรวจสอบกล่องจดหมายหรือสแปม</p>
                ) : null}
                <p className="text-emerald-700">นำโทเค็นไปใช้งานที่หน้าตั้งรหัสผ่านใหม่ด้านล่าง</p>
              </>
            ) : null}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading || isLoading}
          className="w-full rounded-full bg-emerald-500 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300"
        >
          {loading || isLoading ? "กำลังส่งคำขอ..." : "ส่งลิงก์รีเซ็ต"}
        </button>
      </form>

      <div className="flex flex-wrap justify-between text-xs text-emerald-900/70">
        <Link href="/login" className="hover:underline">กลับไปหน้าเข้าสู่ระบบ</Link>
        <Link href="/reset-password" className="font-medium text-emerald-600 hover:underline">มีโทเค็นแล้ว? ตั้งรหัสผ่านใหม่</Link>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="mx-auto w-full max-w-lg rounded-3xl border border-emerald-100 bg-white/70 p-8 text-center text-sm text-emerald-700">กำลังโหลด...</div>}>
      <ForgotPasswordInner />
    </Suspense>
  );
}
