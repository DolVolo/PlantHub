"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useBasket } from "../hooks/useBasket";
import { UserProfileDropdown } from "./UserProfileDropdown";
import { BasketPanel } from "./BasketPanel";

export function Header() {
  const { user, logout, isLoading } = useAuth();
  const { items } = useBasket();
  const [isBasketOpen, setIsBasketOpen] = useState(false);

  return (
    <>
      <header className="supports-[backdrop-filter]:backdrop-blur-lg sticky top-0 z-40 border-b border-emerald-100/80 bg-white/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 text-sm">
          <Link href="/" className="font-semibold text-emerald-700">
            PlantHub 🌱
          </Link>

          <div className="flex items-center gap-4">
            {isLoading ? (
              <span className="text-emerald-600">กำลังโหลด...</span>
            ) : user ? (
              <UserProfileDropdown user={user} onLogout={logout} />
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

      {/* Floating Cart Button */}
      <button
        onClick={() => setIsBasketOpen(true)}
        className="fixed right-6 top-24 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg transition hover:bg-emerald-600 hover:scale-110"
        title="ตะกร้าสินค้า"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        {items.length > 0 && (
          <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-md">
            {items.length}
          </span>
        )}
      </button>

      {/* Basket Panel */}
      <BasketPanel isOpen={isBasketOpen} onClose={() => setIsBasketOpen(false)} />
    </>
  );
}
