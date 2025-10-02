'use client';

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Eye, EyeOff } from "lucide-react";

import { useAuthContext } from "../../providers/AuthProvider";

export default function AdminLoginContent() {
  const router = useRouter();
  const { signIn } = useAuthContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    // ตรวจสอบว่าเป็นแอดมินหรือไม่
    if (email !== "admin@planthub.dev") {
      setError("อีเมลนี้ไม่มีสิทธิ์เข้าถึงระบบแอดมิน");
      return;
    }

    try {
      setIsSubmitting(true);
      await signIn(email, password);
      
      // ตรวจสอบ role ของผู้ใช้ (จะตรวจสอบใน AuthProvider)
      // if (user.role !== "admin") {
      //   setError("บัญชีนี้ไม่มีสิทธิ์เข้าถึงระบบแอดมิน");
      //   return;
      // }

      router.push("/admin/dashboard");
    } catch (err: unknown) {
      setError((err as Error)?.message ?? "ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-lime-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-emerald-100 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-lime-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              เข้าสู่ระบบแอดมิน
            </h1>
            <p className="text-slate-600">
              สำหรับผู้ดูแลระบบ PlantHub เท่านั้น
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                อีเมลแอดมิน
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@planthub.dev"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                รหัสผ่าน
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-slate-700 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบแอดมิน"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              ข้อมูลเข้าสู่ระบบเริ่มต้น:
            </p>
            <div className="mt-2 p-3 bg-slate-50 rounded-lg text-xs text-slate-600">
              <p><strong>อีเมล:</strong> admin@planthub.dev</p>
              <p><strong>รหัสผ่าน:</strong> Admin888</p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-slate-500 hover:text-slate-700 transition"
            >
              ← กลับไปหน้าแรก
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
