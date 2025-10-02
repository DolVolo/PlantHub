"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { AuthUser } from "../types";

interface UserProfileDropdownProps {
  user: AuthUser;
  onLogout: () => void;
}

const menuItems = [
  { href: "/", label: "หน้าหลัก", icon: "🏠" },
  { href: "/cart", label: "ตะกร้า", icon: "🛒" },
  { href: "/checkout", label: "ชำระเงิน", icon: "💳" },
  { href: "/dashboard", label: "ร้านของฉัน", icon: "🏪", roleRequired: "seller" as const },
  { href: "/settings", label: "ตั้งค่า", icon: "⚙️" },
];

export function UserProfileDropdown({ user, onLogout }: UserProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // Close panel when pressing Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleLogout = () => {
    setIsOpen(false);
    onLogout();
  };

  const handleMenuClick = (href: string) => {
    setIsOpen(false);
    router.push(href);
  };

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get role display name
  const getRoleDisplay = (role: string) => {
    const roleMap = {
      buyer: "ผู้ซื้อ",
      seller: "ผู้ขาย",
      admin: "ผู้ดูแลระบบ",
    };
    return roleMap[role as keyof typeof roleMap] || role;
  };

  return (
    <>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full bg-emerald-500 px-3 py-1.5 text-white shadow-sm transition hover:bg-emerald-600"
      >
        {user.profileImageUrl ? (
          <div className="relative h-6 w-6 overflow-hidden rounded-full bg-white/20">
            <Image
              src={user.profileImageUrl}
              alt={user.name}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        ) : (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-semibold">
            {getInitials(user.name)}
          </div>
        )}
        <span className="font-medium">{user.name}</span>
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Backdrop Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sliding Panel */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-full bg-white shadow-2xl transition-transform duration-300 ease-in-out sm:w-[400px] lg:w-[25vw] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-emerald-100 bg-emerald-50/50 px-6 py-4">
            <h2 className="text-xl font-semibold text-emerald-900">โปรไฟล์</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-2 text-emerald-700 transition hover:bg-emerald-100"
              aria-label="Close profile"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* User Info Section */}
          <div className="border-b border-emerald-100 bg-gradient-to-br from-emerald-50 to-white px-6 py-6">
            <div className="flex items-center gap-4">
              {user.profileImageUrl ? (
                <div className="relative h-16 w-16 overflow-hidden rounded-full bg-emerald-500 ring-4 ring-emerald-100">
                  <Image
                    src={user.profileImageUrl}
                    alt={user.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white text-xl font-bold ring-4 ring-emerald-100">
                  {getInitials(user.name)}
                </div>
              )}
              <div className="flex-1 overflow-hidden">
                <p className="font-bold text-lg text-emerald-900 truncate">{user.name}</p>
                <div className="mt-1 inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                  {getRoleDisplay(user.role)}
                </div>
                <p className="mt-1 text-sm text-gray-600 truncate">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <nav className="space-y-1">
              {menuItems.map((item) => {
                // Hide seller-only items for non-sellers
                if (item.roleRequired && user.role !== item.roleRequired) {
                  return null;
                }

                return (
                  <button
                    key={item.href}
                    onClick={() => handleMenuClick(item.href)}
                    className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left text-gray-700 transition hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Logout Button */}
          <div className="border-t border-emerald-100 px-4 py-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left text-red-600 transition hover:bg-red-50 font-medium"
            >
              <span className="text-2xl">🚪</span>
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
