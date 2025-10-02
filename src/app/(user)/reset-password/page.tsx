"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";

function ResetPasswordInner() {
  const { resetPassword, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetToken = searchParams.get("token") ?? "";

  const [form, setForm] = useState({
    token: presetToken,
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.token) {
      setError("กรุณากรอกโทเค็นรีเซ็ตรหัสผ่าน");
      return;
    }
    if (form.newPassword.length < 8) {
      setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ token: form.token.trim(), newPassword: form.newPassword });
      setSuccess("ตั้งรหัสผ่านใหม่เรียบร้อย คุณสามารถเข้าสู่ระบบได้ทันที");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      console.error(err);
      setError("ไม่สามารถตั้งรหัสผ่านได้ กรุณาตรวจสอบโทเค็นและลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-lg space-y-6 rounded-3xl border border-emerald-100 bg-white/80 p-8 shadow-lg">
      <h1 className="text-2xl font-semibold text-emerald-900">ตั้งรหัสผ่านใหม่</h1>
      <p className="text-sm text-emerald-900/70">กรอกโทเค็นรีเซ็ตและกำหนดรหัสผ่านใหม่ของคุณ</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="flex flex-col gap-2 text-sm text-emerald-900/80">
          โทเค็นรีเซ็ต
          <input
            required
            value={form.token}
            onChange={(event) => setForm((prev) => ({ ...prev, token: event.target.value }))}
            placeholder="คัดลอกมาจากอีเมลหรือหน้าลืมรหัสผ่าน"
            className="rounded-2xl border border-emerald-200 px-4 py-2 font-mono text-sm focus:border-emerald-400 focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-emerald-900/80">
          รหัสผ่านใหม่
          <input
            required
            type="password"
            value={form.newPassword}
            onChange={(event) => setForm((prev) => ({ ...prev, newPassword: event.target.value }))}
            placeholder="อย่างน้อย 8 ตัวอักษร"
            className="rounded-2xl border border-emerald-200 px-4 py-2 text-sm focus:border-emerald-400 focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-emerald-900/80">
          ยืนยันรหัสผ่านใหม่
          <input
            required
            type="password"
            value={form.confirmPassword}
            onChange={(event) => setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
            placeholder="กรอกให้ตรงกับรหัสผ่านใหม่"
            className="rounded-2xl border border-emerald-200 px-4 py-2 text-sm focus:border-emerald-400 focus:outline-none"
          />
        </label>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {success ? <p className="rounded-2xl bg-emerald-100/80 px-4 py-3 text-sm text-emerald-800">{success}</p> : null}

        <button
          type="submit"
          disabled={loading || isLoading}
          className="w-full rounded-full bg-emerald-500 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300"
        >
          {loading || isLoading ? "กำลังตั้งรหัสผ่าน..." : "บันทึกรหัสผ่านใหม่"}
        </button>
      </form>

      <div className="flex flex-wrap justify-between text-xs text-emerald-900/70">
        <Link href="/forgot-password" className="hover:underline">กลับไปหน้าลืมรหัสผ่าน</Link>
        <Link href="/login" className="font-medium text-emerald-600 hover:underline">กลับไปเข้าสู่ระบบ</Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="mx-auto w-full max-w-lg rounded-3xl border border-emerald-100 bg-white/70 p-8 text-center text-sm text-emerald-700">กำลังโหลด...</div>}>
      <ResetPasswordInner />
    </Suspense>
  );
}
