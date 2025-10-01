"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import type { AuthUser } from "../../types";

const roleOptions: Array<{ label: string; value: AuthUser["role"]; description: string }> = [
  { label: "ผู้ซื้อ", value: "buyer", description: "เลือกซื้อและจัดการตะกร้า" },
  { label: "ผู้ขาย", value: "seller", description: "เปิดร้านและเพิ่มสินค้าได้" },
];

export default function RegisterPage() {
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
            <input
              required
              type="password"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              placeholder="อย่างน้อย 8 ตัวอักษร"
              className="rounded-2xl border border-emerald-200 px-4 py-2 text-sm focus:border-emerald-400 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-emerald-900/80">
            ยืนยันรหัสผ่าน
            <input
              required
              type="password"
              value={form.confirmPassword}
              onChange={(event) => setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
              placeholder="กรอกให้ตรงกับรหัสผ่าน"
              className="rounded-2xl border border-emerald-200 px-4 py-2 text-sm focus:border-emerald-400 focus:outline-none"
            />
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
