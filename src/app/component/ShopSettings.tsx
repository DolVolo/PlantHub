"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { useShopStore } from "../store/useShopStore";

interface ShopSettingsProps {
  ownerId: string;
}

interface ShopForm {
  name: string;
  description: string;
  location: string;
  phone: string;
  imageUrl: string;
  openingHours: string;
}

const defaultShopForm: ShopForm = {
  name: "",
  description: "",
  location: "",
  phone: "",
  imageUrl: "",
  openingHours: "",
};

export function ShopSettings({ ownerId }: ShopSettingsProps) {
  const { shops, fetchShops, createShop, updateShop, deleteShop, status } = useShopStore();
  const [form, setForm] = useState<ShopForm>(defaultShopForm);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const myShop = shops.find((shop) => shop.ownerId === ownerId);

  useEffect(() => {
    fetchShops(ownerId);
  }, [ownerId, fetchShops]);

  useEffect(() => {
    if (myShop) {
      setForm({
        name: myShop.name,
        description: myShop.description,
        location: myShop.location,
        phone: myShop.phone || "",
        imageUrl: myShop.imageUrl || "",
        openingHours: myShop.openingHours || "",
      });
    }
  }, [myShop]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      event.target.value = ""; // Clear input
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("ขนาดไฟล์ต้องไม่เกิน 5MB");
      event.target.value = ""; // Clear input
      return;
    }

    setUploadingImage(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "ไม่สามารถอัปโหลดรูปภาพได้");
      }

      setForm((prev) => ({ ...prev, imageUrl: data.url }));
      setSuccess("อัปโหลดรูปภาพสำเร็จ");
      event.target.value = ""; // Clear input for next upload
    } catch (error) {
      console.error("อัปโหลดรูปภาพไม่สำเร็จ", error);
      setError(error instanceof Error ? error.message : "ไม่สามารถอัปโหลดรูปภาพได้");
      event.target.value = ""; // Clear input
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.name || !form.description || !form.location) {
      setError("กรุณากรอกข้อมูลที่จำเป็น");
      return;
    }

    try {
      if (myShop) {
        await updateShop(myShop.id, form);
        setSuccess("อัปเดตข้อมูลร้านค้าสำเร็จ");
        setIsEditing(false);
      } else {
        await createShop({
          ownerId,
          ...form,
        });
        setSuccess("สร้างร้านค้าสำเร็จ");
      }
    } catch (error) {
      console.error("บันทึกข้อมูลไม่สำเร็จ", error);
      setError(myShop ? "ไม่สามารถอัปเดตร้านค้าได้" : "ไม่สามารถสร้างร้านค้าได้");
    }
  };

  const handleDelete = async () => {
    if (!myShop) return;
    
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบร้านค้า? การกระทำนี้ไม่สามารถย้อนกลับได้")) {
      return;
    }

    try {
      await deleteShop(myShop.id);
      setSuccess("ลบร้านค้าเรียบร้อยแล้ว");
      setForm(defaultShopForm);
    } catch (error) {
      console.error("ลบร้านค้าไม่สำเร็จ", error);
      setError("ไม่สามารถลบร้านค้าได้");
    }
  };

  if (status === "loading" && !myShop) {
    return (
      <div className="rounded-3xl border border-emerald-100 bg-white/80 p-8 shadow-lg">
        <p className="text-center text-emerald-700">กำลังโหลดข้อมูลร้านค้า...</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-emerald-100 bg-white/80 p-8 shadow-lg">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-emerald-900">ข้อมูลร้านค้า</h2>
        {myShop && !isEditing && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
            >
              แก้ไขร้านค้า
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
            >
              ลบร้านค้า
            </button>
          </div>
        )}
      </div>

      {myShop && !isEditing ? (
        <div className="space-y-4">
          {myShop.imageUrl && (
            <div className="rounded-2xl border border-emerald-100 p-4">
              <div className="relative h-48 w-full">
                <Image
                  src={myShop.imageUrl}
                  alt={myShop.name}
                  fill
                  className="rounded-xl object-cover"
                />
              </div>
            </div>
          )}
          <div className="space-y-2 text-sm text-emerald-900/80">
            <p><span className="font-semibold">ชื่อร้าน:</span> {myShop.name}</p>
            <p><span className="font-semibold">รายละเอียด:</span> {myShop.description}</p>
            <p><span className="font-semibold">สถานที่:</span> {myShop.location}</p>
            {myShop.phone && <p><span className="font-semibold">เบอร์โทร:</span> {myShop.phone}</p>}
            {myShop.openingHours && <p><span className="font-semibold">เวลาเปิด-ปิด:</span> {myShop.openingHours}</p>}
            <p><span className="font-semibold">คะแนน:</span> ⭐ {myShop.rating}/5</p>
            <p><span className="font-semibold">ยอดขาย:</span> {myShop.totalSales} รายการ</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <label className="flex flex-col gap-2 text-sm text-emerald-900/80">
              ชื่อร้าน *
              <input
                required
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="ชื่อร้านค้าของคุณ"
                className="rounded-2xl border border-emerald-200 px-4 py-2 text-sm focus:border-emerald-400 focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-emerald-900/80">
              รายละเอียดร้าน *
              <textarea
                required
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="บอกเล่าเกี่ยวกับร้านของคุณ"
                rows={4}
                className="rounded-2xl border border-emerald-200 px-4 py-2 text-sm focus:border-emerald-400 focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-emerald-900/80">
              สถานที่ *
              <input
                required
                value={form.location}
                onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="เช่น กรุงเทพมหานคร, เชียงใหม่"
                className="rounded-2xl border border-emerald-200 px-4 py-2 text-sm focus:border-emerald-400 focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-emerald-900/80">
              เบอร์โทรศัพท์
              <input
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="เช่น 081-234-5678"
                className="rounded-2xl border border-emerald-200 px-4 py-2 text-sm focus:border-emerald-400 focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-emerald-900/80">
              เวลาเปิด-ปิด
              <input
                value={form.openingHours}
                onChange={(e) => setForm((prev) => ({ ...prev, openingHours: e.target.value }))}
                placeholder="เช่น จันทร์-ศุกร์ 9:00-18:00"
                className="rounded-2xl border border-emerald-200 px-4 py-2 text-sm focus:border-emerald-400 focus:outline-none"
              />
            </label>

            <div className="flex flex-col gap-2 text-sm text-emerald-900/80">
              <label>รูปภาพร้านค้า</label>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                      id="shop-image-upload"
                    />
                    <label
                      htmlFor="shop-image-upload"
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 px-4 py-3 text-sm transition hover:border-emerald-400 hover:bg-emerald-50"
                    >
                      {uploadingImage ? (
                        <>
                          <span className="animate-spin">⏳</span>
                          <span>กำลังอัปโหลด...</span>
                        </>
                      ) : (
                        <>
                          <span>📁</span>
                          <span>อัปโหลดรูปจากอุปกรณ์</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>
                <input
                  value={form.imageUrl}
                  onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="หรือใส่ลิงก์รูปภาพ (https://...)"
                  className="w-full rounded-2xl border border-emerald-200 px-4 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                />
                {form.imageUrl && (
                  <div className="rounded-2xl border border-emerald-100 p-3">
                    <div className="relative h-32 w-full">
                      <Image
                        src={form.imageUrl}
                        alt="ตัวอย่างรูปร้านค้า"
                        fill
                        className="rounded-xl object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://via.placeholder.com/400x200?text=Invalid+Image";
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
            >
              {myShop ? "บันทึกการแก้ไข" : "สร้างร้านค้า"}
            </button>
            {myShop && isEditing && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setForm({
                    name: myShop.name,
                    description: myShop.description,
                    location: myShop.location,
                    phone: myShop.phone || "",
                    imageUrl: myShop.imageUrl || "",
                    openingHours: myShop.openingHours || "",
                  });
                }}
                className="rounded-full border border-emerald-200 px-5 py-2.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
              >
                ยกเลิก
              </button>
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-emerald-700">{success}</p>}
        </form>
      )}
    </div>
  );
}
