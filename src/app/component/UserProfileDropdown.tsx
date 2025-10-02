"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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
    <div className="relative" ref={dropdownRef}>
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

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-emerald-100 bg-white shadow-lg">
          {/* User Info Section */}
          <div className="border-b border-emerald-100 p-4">
            <div className="flex items-center gap-3">
              {user.profileImageUrl ? (
                <div className="relative h-10 w-10 overflow-hidden rounded-full bg-emerald-500">
                  <Image
                    src={user.profileImageUrl}
                    alt={user.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white font-semibold">
                  {getInitials(user.name)}
                </div>
              )}
              <div className="flex-1 overflow-hidden">
                <p className="font-semibold text-emerald-900 truncate">{user.name}</p>
                <p className="text-xs text-emerald-600">{getRoleDisplay(user.role)}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            {menuItems.map((item) => {
              // Hide seller-only items for non-sellers
              if (item.roleRequired && user.role !== item.roleRequired) {
                return null;
              }

              return (
                <button
                  key={item.href}
                  onClick={() => handleMenuClick(item.href)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-emerald-50 hover:text-emerald-700"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Logout Button */}
          <div className="border-t border-emerald-100 p-2">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
            >
              <span className="text-lg">🚪</span>
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
