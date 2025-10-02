"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import { useBasket } from "../hooks/useBasket";

const navLinks = [
  { href: "/", label: "หน้าหลัก" },
  { href: "/cart", label: "ตะกร้า" },
  { href: "/checkout", label: "ชำระเงิน" },
  { href: "/dashboard", label: "ร้านของฉัน" },
];

export function Header() {
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();
  const { items } = useBasket();

  return (
    <header className="supports-[backdrop-filter]:backdrop-blur-lg sticky top-0 z-40 border-b border-emerald-100/80 bg-white/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 text-sm">
        <Link href="/" className="font-semibold text-emerald-700">
          PlantHub 🌱
        </Link>
        <nav className="flex items-center gap-6 text-gray-600">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors hover:text-emerald-700 ${isActive ? "text-emerald-600" : ""}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/cart" className="relative rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700">
            ตะกร้า
            {items.length > 0 ? (
              <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1 text-xs font-semibold text-white">
                {items.length}
              </span>
            ) : null}
          </Link>
          {isLoading ? (
            <span className="text-emerald-600">กำลังโหลด...</span>
          ) : user ? (
            <button
              onClick={logout}
              className="rounded-full border border-emerald-200 px-3 py-1.5 text-emerald-700 transition hover:bg-emerald-100"
            >
              ออกจากระบบ
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/register"
                className="rounded-full border border-emerald-200 px-3 py-1.5 text-emerald-700 transition hover:bg-emerald-100"
              >
                สมัครสมาชิก
              </Link>
              <Link
                href="/login"
                className="rounded-full bg-emerald-500 px-3 py-1.5 font-medium text-white shadow-sm transition hover:bg-emerald-600"
              >
                เข้าสู่ระบบ
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
