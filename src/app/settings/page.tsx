"use client";

import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { LoginDialog } from "../component/dialogs";

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "account" | "preferences">("profile");

  if (!user) {
    return <LoginDialog onClose={() => window.history.back()} />;
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold text-emerald-900">ตั้งค่า</h1>
      <p className="mt-2 text-emerald-700">จัดการข้อมูลส่วนตัวและการตั้งค่าบัญชีของคุณ</p>

      {/* Tabs */}
      <div className="mt-8 border-b border-emerald-100">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("profile")}
            className={`border-b-2 pb-3 font-medium transition ${
              activeTab === "profile"
                ? "border-emerald-500 text-emerald-700"
                : "border-transparent text-gray-500 hover:text-emerald-700"
            }`}
          >
            ข้อมูลส่วนตัว
          </button>
          <button
            onClick={() => setActiveTab("account")}
            className={`border-b-2 pb-3 font-medium transition ${
              activeTab === "account"
                ? "border-emerald-500 text-emerald-700"
                : "border-transparent text-gray-500 hover:text-emerald-700"
            }`}
          >
            บัญชี
          </button>
          <button
            onClick={() => setActiveTab("preferences")}
            className={`border-b-2 pb-3 font-medium transition ${
              activeTab === "preferences"
                ? "border-emerald-500 text-emerald-700"
                : "border-transparent text-gray-500 hover:text-emerald-700"
            }`}
          >
            การตั้งค่า
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        {activeTab === "profile" && (
          <div className="rounded-3xl border border-emerald-100 bg-white/80 p-8 shadow-lg">
            <h2 className="text-xl font-semibold text-emerald-900">ข้อมูลส่วนตัว</h2>
            <div className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-emerald-900/80">ชื่อ</label>
                <p className="mt-1 text-emerald-900">{user.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-emerald-900/80">อีเมล</label>
                <p className="mt-1 text-emerald-900">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-emerald-900/80">ประเภทบัญชี</label>
                <p className="mt-1 text-emerald-900">
                  {user.role === "buyer" && "ผู้ซื้อ"}
                  {user.role === "seller" && "ผู้ขาย"}
                  {user.role === "admin" && "ผู้ดูแลระบบ"}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "account" && (
          <div className="rounded-3xl border border-emerald-100 bg-white/80 p-8 shadow-lg">
            <h2 className="text-xl font-semibold text-emerald-900">การจัดการบัญชี</h2>
            <div className="mt-6 space-y-4">
              <p className="text-sm text-emerald-700">
                ฟีเจอร์การเปลี่ยนรหัสผ่านและการจัดการบัญชีจะเพิ่มในเร็วๆ นี้
              </p>
            </div>
          </div>
        )}

        {activeTab === "preferences" && (
          <div className="rounded-3xl border border-emerald-100 bg-white/80 p-8 shadow-lg">
            <h2 className="text-xl font-semibold text-emerald-900">การตั้งค่าทั่วไป</h2>
            <div className="mt-6 space-y-4">
              <p className="text-sm text-emerald-700">
                ฟีเจอร์การตั้งค่าต่างๆ จะเพิ่มในเร็วๆ นี้
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
