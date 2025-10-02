"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../hooks/useAuth";

function LoginFormInner() {
  const { login, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/";
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(form);
      router.push(redirectTo);
    } catch (err) {
      console.error(err);
      setError("ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-6 rounded-3xl border border-emerald-100 bg-white/80 p-8 shadow-lg">
      <h1 className="text-2xl font-semibold text-emerald-900">เข้าสู่ระบบ PlantHub</h1>
      <p className="text-sm text-emerald-900/70">เข้าสู่ระบบเพื่อเพิ่มสินค้าลงตะกร้าและติดตามการสั่งซื้อ</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="flex flex-col gap-2 text-sm text-emerald-900/80">
          อีเมล
          <input
            type="email"
            required
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            placeholder="you@example.com"
            className="rounded-2xl border border-emerald-200 px-4 py-2 text-sm focus:border-emerald-400 focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-emerald-900/80">
          รหัสผ่าน
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              placeholder="••••••••"
              className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-2 pr-12 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 transition hover:text-emerald-700"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={loading || isLoading}
          className="w-full rounded-full bg-emerald-500 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300"
        >
          {loading || isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </button>
      </form>
      <div className="flex flex-wrap justify-between text-xs text-emerald-900/70">
        <Link href="/forgot-password" className="hover:underline">ลืมรหัสผ่าน?</Link>
        <span>
          ยังไม่มีบัญชี?{" "}
          <Link href="/register" className="font-medium text-emerald-600 hover:underline">
            สมัครสมาชิก
          </Link>
        </span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="mx-auto w-full max-w-md rounded-3xl border border-emerald-100 bg-white/70 p-8 text-center text-sm text-emerald-700">กำลังเตรียมแบบฟอร์ม...</div>}>
      <LoginFormInner />
    </Suspense>
  );
}
