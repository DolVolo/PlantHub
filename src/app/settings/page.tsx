"use client";

import { useState } from "react";
import Image from "next/image";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { LoginDialog } from "../component/dialogs";

export default function SettingsPage() {
  const { user, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "account" | "preferences">("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    profileImageUrl: "",
  });

  const handleEdit = () => {
    setProfileForm({
      name: user?.name || "",
      profileImageUrl: "",
    });
    setIsEditing(true);
    setError("");
    setSuccess("");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setError("");
    setSuccess("");
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("ไฟล์รูปภาพต้องมีขนาดไม่เกิน 5MB");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post<{ url: string }>("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setProfileForm((prev) => ({ ...prev, profileImageUrl: response.data.url }));
      setSuccess("อัปโหลดรูปภาพสำเร็จ");
    } catch (err) {
      console.error("Upload error:", err);
      setError("ไม่สามารถอัปโหลดรูปภาพได้");
    } finally {
      setIsUploading(false);
      // Clear the input
      event.target.value = "";
    }
  };

  const handleRemoveImage = () => {
    setProfileForm((prev) => ({ ...prev, profileImageUrl: "" }));
    setSuccess("ลบรูปภาพแล้ว");
  };

  const handleSave = async () => {
    if (!user) return;

    if (!profileForm.name.trim()) {
      setError("กรุณากรอกชื่อ");
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      // Use the auth store method to update profile
      await updateUserProfile(user.id, {
        name: profileForm.name.trim(),
        profileImageUrl: profileForm.profileImageUrl || undefined,
      });

      setSuccess("บันทึกข้อมูลสำเร็จ");
      setIsEditing(false);
      
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Save error:", err);
      setError("ไม่สามารถบันทึกข้อมูลได้");
    } finally {
      setIsSaving(false);
    }
  };

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
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-emerald-900">ข้อมูลส่วนตัว</h2>
              {!isEditing && (
                <button
                  onClick={handleEdit}
                  className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600"
                >
                  แก้ไขโปรไฟล์
                </button>
              )}
            </div>

            {error && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-600">
                {success}
              </div>
            )}

            {!isEditing ? (
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
            ) : (
              <div className="mt-6 space-y-6">
                {/* Profile Image */}
                <div>
                  <label className="block text-sm font-medium text-emerald-900">
                    รูปโปรไฟล์
                  </label>
                  
                  <div className="mt-3 flex flex-wrap gap-4">
                    {/* Upload Button */}
                    <div className="flex-shrink-0">
                      <label className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 transition hover:border-emerald-400 hover:bg-emerald-50">
                        {isUploading ? (
                          <div className="text-center">
                            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-500"></div>
                            <span className="mt-2 block text-xs text-emerald-600">กำลังอัปโหลด...</span>
                          </div>
                        ) : (
                          <>
                            <svg
                              className="h-8 w-8 text-emerald-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                            <span className="mt-2 block text-xs text-emerald-600">อัปโหลดรูป</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={isUploading}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Image Preview */}
                    {profileForm.profileImageUrl && (
                      <div className="relative h-32 w-32 rounded-2xl border border-emerald-200 bg-white p-2">
                        <div className="relative h-full w-full">
                          <Image
                            src={profileForm.profileImageUrl}
                            alt="รูปโปรไฟล์"
                            fill
                            className="rounded-xl object-cover"
                            unoptimized
                            onError={(e) => {
                              e.currentTarget.src = "https://via.placeholder.com/150?text=Invalid+Image";
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition hover:bg-red-600"
                          title="ลบรูปภาพ"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* URL Input */}
                  <div className="mt-3">
                    <input
                      type="url"
                      value={profileForm.profileImageUrl}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, profileImageUrl: e.target.value }))}
                      placeholder="หรือใส่ลิงก์รูปภาพ (https://...)"
                      className="w-full rounded-2xl border border-emerald-200 bg-white px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-emerald-900">
                    ชื่อ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="กรอกชื่อของคุณ"
                    className="mt-2 w-full rounded-2xl border border-emerald-200 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:outline-none"
                    required
                  />
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-emerald-900">อีเมล</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2 text-gray-600"
                  />
                  <p className="mt-1 text-xs text-gray-500">ไม่สามารถแก้ไขอีเมลได้</p>
                </div>

                {/* Role (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-emerald-900">ประเภทบัญชี</label>
                  <input
                    type="text"
                    value={
                      user.role === "buyer" ? "ผู้ซื้อ" :
                      user.role === "seller" ? "ผู้ขาย" : "ผู้ดูแลระบบ"
                    }
                    disabled
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2 text-gray-600"
                  />
                  <p className="mt-1 text-xs text-gray-500">ประเภทบัญชีไม่สามารถเปลี่ยนแปลงได้</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 rounded-full bg-emerald-500 px-6 py-3 font-medium text-white shadow-md transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSaving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="flex-1 rounded-full border border-emerald-200 bg-white px-6 py-3 font-medium text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            )}
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
