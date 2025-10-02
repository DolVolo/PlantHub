"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import type { AuthUser } from "../../types";

const roleOptions: Array<{ label: string; value: AuthUser["role"]; description: string }> = [
  { label: "ผู้ซื้อ", value: "buyer", description: "เลือกซื้อและจัดการตะกร้า" },
  { label: "ผู้ขาย", value: "seller", description: "เปิดร้านและเพิ่มสินค้าได้" },
];

function RegisterInner() {
  const { register, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "buyer" as AuthUser["role"],
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }
    if (form.password.length < 8) {
      setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }

    setLoading(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
      });
      router.push(redirectTo ?? (form.role === "seller" ? "/dashboard" : "/"));
    } catch (err) {
      console.error(err);
      setError("ไม่สามารถสมัครสมาชิกได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-lg space-y-6 rounded-3xl border border-emerald-100 bg-white/80 p-8 shadow-lg">
      <h1 className="text-2xl font-semibold text-emerald-900">สมัครสมาชิก PlantHub</h1>
      <p className="text-sm text-emerald-900/70">สร้างบัญชีใหม่เพื่อเริ่มซื้อขายต้นไม้ในชุมชน PlantHub</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="flex flex-col gap-2 text-sm text-emerald-900/80">
          ชื่อ - นามสกุล
          <input
            required
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="ชื่อที่จะแสดงในระบบ"
            className="rounded-2xl border border-emerald-200 px-4 py-2 text-sm focus:border-emerald-400 focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-emerald-900/80">
          อีเมล
          <input
            required
            type="email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            placeholder="you@example.com"
            className="rounded-2xl border border-emerald-200 px-4 py-2 text-sm focus:border-emerald-400 focus:outline-none"
          />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-emerald-900/80">
            รหัสผ่าน
            <div className="relative">
              <input
                required
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                placeholder="อย่างน้อย 8 ตัวอักษร"
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
          <label className="flex flex-col gap-2 text-sm text-emerald-900/80">
            ยืนยันรหัสผ่าน
            <div className="relative">
              <input
                required
                type={showConfirmPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(event) => setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                placeholder="กรอกให้ตรงกับรหัสผ่าน"
                className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-2 pr-12 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 transition hover:text-emerald-700"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
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
        </div>

        <fieldset className="space-y-3 rounded-3xl border border-emerald-100 bg-white/60 p-4">
          <legend className="text-sm font-medium text-emerald-900">เลือกรูปแบบการใช้งาน</legend>
          {roleOptions.map((option) => (
            <label
              key={option.value}
              className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                form.role === option.value ? "border-emerald-400 bg-emerald-50/70" : "border-emerald-200"
              }`}
            >
              <span>
                <span className="block font-medium text-emerald-900">{option.label}</span>
                <span className="text-xs text-emerald-900/70">{option.description}</span>
              </span>
              <input
                type="radio"
                name="role"
                checked={form.role === option.value}
                onChange={() => setForm((prev) => ({ ...prev, role: option.value }))}
              />
            </label>
          ))}
        </fieldset>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={loading || isLoading}
          className="w-full rounded-full bg-emerald-500 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300"
        >
          {loading || isLoading ? "กำลังสมัครสมาชิก..." : "สร้างบัญชี"}
        </button>
      </form>

      <p className="text-center text-xs text-emerald-900/70">
        มีบัญชีอยู่แล้ว? <Link href="/login" className="font-medium text-emerald-600 hover:underline">เข้าสู่ระบบ</Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="mx-auto w-full max-w-lg rounded-3xl border border-emerald-100 bg-white/70 p-8 text-center text-sm text-emerald-700">กำลังโหลด...</div>}>
      <RegisterInner />
    </Suspense>
  );
}
