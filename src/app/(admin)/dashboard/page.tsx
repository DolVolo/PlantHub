"use client";

import { FormEvent, useMemo, useState } from "react";
import Image from "next/image";
import { useAuth } from "../../hooks/useAuth";
import { useProducts } from "../../hooks/useProducts";
import type { TreeCategory, TreeProduct } from "../../types";
import { LoginDialog } from "../../component/dialogs";
import { ShopSettings } from "../../component/ShopSettings";

const categoryOptions: Array<{ value: TreeCategory; label: string }> = [
  { value: "indoor", label: "ต้นไม้ในบ้าน" },
  { value: "outdoor", label: "ต้นไม้กลางแจ้ง" },
  { value: "flowering", label: "ไม้ดอก" },
  { value: "bonsai", label: "บอนไซ" },
  { value: "succulent", label: "ไม้อวบน้ำ" },
];

const careLevels: Array<{ value: TreeProduct["careLevel"]; label: string }> = [
  { value: "beginner", label: "มือใหม่" },
  { value: "intermediate", label: "ปานกลาง" },
  { value: "advanced", label: "มืออาชีพ" },
];

interface NewProductForm {
  name: string;
  scientificName: string;
  description: string;
  price: number;
  inStock: number;
  category: TreeCategory;
  careLevel: TreeProduct["careLevel"];
  light: TreeProduct["light"];
  water: TreeProduct["water"];
  imageUrl: string;
}

const defaultForm: NewProductForm = {
  name: "",
  scientificName: "",
  description: "",
  price: 0,
  inStock: 0,
  category: "indoor",
  careLevel: "beginner",
  light: "medium",
  water: "medium",
  imageUrl: "",
};

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const { products, addProduct, updateProduct, deleteProduct, status, error: productError, fetchProducts } = useProducts();
  const [form, setForm] = useState<NewProductForm>(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const sellerProducts = useMemo(() => {
    if (!user) return [];
    return products.filter((product) => product.seller.id === user.id);
  }, [products, user]);

  const isLoadingProducts = status === "idle" || status === "loading";

  if (!user) {
    return <LoginDialog onClose={() => window.history.back()} />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setSuccess(null);

    if (!user) {
      setFormError("กรุณาเข้าสู่ระบบ");
      return;
    }

    if (isLoadingProducts) {
      setFormError("ระบบกำลังดึงข้อมูลสินค้า กรุณารอสักครู่");
      return;
    }
    if (status === "error") {
      setFormError("ไม่สามารถเพิ่มสินค้าได้ในขณะนี้ กรุณาลองโหลดข้อมูลสินค้าใหม่อีกครั้ง");
      return;
    }

    if (!form.imageUrl) {
      setFormError("กรุณาเพิ่มลิงก์รูปภาพสินค้าก่อนเผยแพร่");
      return;
    }

    try {
      if (editingId) {
        // Update existing product
        await updateProduct(editingId, {
          name: form.name,
          scientificName: form.scientificName || form.name,
          description: form.description,
          price: form.price,
          inStock: form.inStock,
          category: form.category,
          imageUrl: form.imageUrl,
          careLevel: form.careLevel,
          light: form.light,
          water: form.water,
        });
        setSuccess("แก้ไขสินค้าเรียบร้อยแล้ว");
        setEditingId(null);
      } else {
        // Create new product
        const slug = form.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

        const newProduct: TreeProduct = {
          id: `${user.id}-${Date.now()}`,
          slug,
          name: form.name,
          scientificName: form.scientificName || form.name,
          description: form.description,
          price: form.price,
          inStock: form.inStock,
          heightRangeCm: [80, 120],
          category: form.category,
          tags: ["seller"],
          imageUrl: form.imageUrl,
          seller: {
            id: user.id,
            name: user.name,
            location: "ร้านใหม่",
            rating: 5,
            totalSales: 0,
          },
          rating: 5,
          reviews: 0,
          deliveryOptions: [
            { method: "pickup", price: 0, description: "รับที่หน้าร้าน" },
            { method: "ems", price: 50, description: "จัดส่ง EMS มาตรฐาน" },
          ],
          careLevel: form.careLevel,
          light: form.light,
          water: form.water,
        };

        await addProduct(newProduct);
        setSuccess("เพิ่มสินค้าใหม่เรียบร้อยแล้ว");
      }
      setForm(defaultForm);
    } catch (error) {
      console.error("เพิ่มสินค้าไม่สำเร็จ", error);
      setFormError(editingId ? "ไม่สามารถแก้ไขสินค้าได้ กรุณาลองใหม่อีกครั้ง" : "ไม่สามารถเพิ่มสินค้าได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  const handleEdit = (product: TreeProduct) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      scientificName: product.scientificName,
      description: product.description,
      price: product.price,
      inStock: product.inStock,
      category: product.category,
      careLevel: product.careLevel,
      light: product.light,
      water: product.water,
      imageUrl: product.imageUrl,
    });
    setFormError(null);
    setSuccess(null);
    // Scroll to top of form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(defaultForm);
    setFormError(null);
    setSuccess(null);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้?")) {
      return;
    }

    try {
      await deleteProduct(productId);
      setSuccess("ลบสินค้าเรียบร้อยแล้ว");
      // Clear form if deleting the product being edited
      if (editingId === productId) {
        setEditingId(null);
        setForm(defaultForm);
      }
    } catch (error) {
      console.error("ลบสินค้าไม่สำเร็จ", error);
      setFormError("ไม่สามารถลบสินค้าได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setFormError("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      event.target.value = ""; // Clear input
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setFormError("ขนาดไฟล์ต้องไม่เกิน 5MB");
      event.target.value = ""; // Clear input
      return;
    }

    setUploadingImage(true);
    setFormError(null);

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
      setFormError(error instanceof Error ? error.message : "ไม่สามารถอัปโหลดรูปภาพได้");
      event.target.value = ""; // Clear input
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Shop Settings Section */}
      <ShopSettings ownerId={user.id} />

      {/* Product Management Section */}
      <section className="rounded-3xl border border-emerald-100 bg-white/80 p-8 shadow-lg">
        <h1 className="text-2xl font-semibold text-emerald-900">จัดการสินค้า</h1>
        <p className="mt-2 text-sm text-emerald-900/70">
          เพิ่มสินค้าใหม่และตรวจสอบยอดขายได้จากหน้านี้ ติดตามสต็อกต้นไม้ของคุณแบบเรียลไทม์
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-emerald-900/80">
              ชื่อต้นไม้ *
              <input
                required
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="ชื่อที่ลูกค้าจดจำได้"
                className="rounded-2xl border border-emerald-200 px-4 py-2 text-sm focus:border-emerald-400 focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-emerald-900/80">
              ชื่อวิทยาศาสตร์
              <input
                value={form.scientificName}
                onChange={(event) => setForm((prev) => ({ ...prev, scientificName: event.target.value }))}
                placeholder="Scientific name"
                className="rounded-2xl border border-emerald-200 px-4 py-2 text-sm focus:border-emerald-400 focus:outline-none"
              />
            </label>
          </div>
          <label className="flex flex-col gap-2 text-sm text-emerald-900/80">
            รายละเอียดสินค้า *
            <textarea
              required
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="บอกเล่าจุดเด่น วิธีดูแล และข้อแนะนำ"
              rows={4}
              className="rounded-2xl border border-emerald-200 px-4 py-2 text-sm focus:border-emerald-400 focus:outline-none"
            />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-emerald-900/80">
              ราคา (บาท) *
              <input
                required
                type="number"
                min={0}
                value={form.price}
                onChange={(event) => setForm((prev) => ({ ...prev, price: Number(event.target.value) }))}
                className="rounded-2xl border border-emerald-200 px-4 py-2 text-sm focus:border-emerald-400 focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-emerald-900/80">
              สต็อก *
              <input
                required
                type="number"
                min={0}
                value={form.inStock}
                onChange={(event) => setForm((prev) => ({ ...prev, inStock: Number(event.target.value) }))}
                className="rounded-2xl border border-emerald-200 px-4 py-2 text-sm focus:border-emerald-400 focus:outline-none"
              />
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="flex flex-col gap-2 text-sm text-emerald-900/80">
              ประเภทสินค้า
              <select
                value={form.category}
                onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value as TreeCategory }))}
                className="rounded-2xl border border-emerald-200 px-4 py-2 text-sm focus:border-emerald-400 focus:outline-none"
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm text-emerald-900/80">
              ระดับการดูแล
              <select
                value={form.careLevel}
                onChange={(event) => setForm((prev) => ({ ...prev, careLevel: event.target.value as TreeProduct["careLevel"] }))}
                className="rounded-2xl border border-emerald-200 px-4 py-2 text-sm focus:border-emerald-400 focus:outline-none"
              >
                {careLevels.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm text-emerald-900/80">
              ความต้องการแสง
              <select
                value={form.light}
                onChange={(event) => setForm((prev) => ({ ...prev, light: event.target.value as TreeProduct["light"] }))}
                className="rounded-2xl border border-emerald-200 px-4 py-2 text-sm focus:border-emerald-400 focus:outline-none"
              >
                <option value="low">แสงน้อย</option>
                <option value="medium">แสงรำไร</option>
                <option value="bright">แสงจัด</option>
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm text-emerald-900/80">
              การรดน้ำ
              <select
                value={form.water}
                onChange={(event) => setForm((prev) => ({ ...prev, water: event.target.value as TreeProduct["water"] }))}
                className="rounded-2xl border border-emerald-200 px-4 py-2 text-sm focus:border-emerald-400 focus:outline-none"
              >
                <option value="low">น้อย</option>
                <option value="medium">ปานกลาง</option>
                <option value="high">มาก</option>
              </select>
            </label>
            <div className="flex flex-col gap-2 text-sm text-emerald-900/80 md:col-span-2">
              <label>รูปภาพสินค้า *</label>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
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
                  required
                  value={form.imageUrl}
                  onChange={(event) => setForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
                  placeholder="หรือใส่ลิงก์รูปภาพ (https://...)"
                  className="w-full rounded-2xl border border-emerald-200 px-4 py-2 text-sm focus:border-emerald-400 focus:outline-none"
                />
                {form.imageUrl && (
                  <div className="rounded-2xl border border-emerald-100 p-3">
                    <div className="relative h-32 w-32">
                      <Image
                        src={form.imageUrl}
                        alt="ตัวอย่างรูปสินค้า"
                        fill
                        className="rounded-xl object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://via.placeholder.com/150?text=Invalid+Image";
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
              {editingId ? "อัปเดตสินค้า" : "เพิ่มสินค้า"}
            </button>
            <button
              type="button"
              onClick={editingId ? handleCancelEdit : () => setForm(defaultForm)}
              className="rounded-full border border-emerald-200 px-5 py-2.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
            >
              {editingId ? "ยกเลิก" : "ล้างฟอร์ม"}
            </button>
          </div>
          {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
          {success ? <p className="text-sm text-emerald-700">{success}</p> : null}
        </form>
      </section>

      <section className="space-y-4">
        <div className="rounded-3xl border border-emerald-100 bg-white/90 p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-emerald-900">ภาพรวมร้าน</h2>
          <div className="mt-4 grid gap-4 text-sm text-emerald-900/80">
            <div className="rounded-2xl bg-emerald-50/80 p-4">
              <p className="text-xs uppercase tracking-wide text-emerald-600">จำนวนสินค้า</p>
              <p className="mt-1 text-2xl font-semibold text-emerald-900">
                {isLoadingProducts ? "-" : `${sellerProducts.length} รายการ`}
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-50/80 p-4">
              <p className="text-xs uppercase tracking-wide text-emerald-600">สต็อกคงเหลือรวม</p>
              <p className="mt-1 text-2xl font-semibold text-emerald-900">
                {isLoadingProducts ? "-" : `${sellerProducts.reduce((total, product) => total + product.inStock, 0)} ต้น`}
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-3 rounded-3xl border border-emerald-100 bg-white/80 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-emerald-900">รายการสินค้า</h3>
          <div className="space-y-3 text-sm text-emerald-900/80">
            {isLoadingProducts ? (
              <p className="animate-pulse text-emerald-700">กำลังโหลดข้อมูลสินค้า...</p>
            ) : status === "error" ? (
              <div className="space-y-3">
                <p className="text-red-600">ไม่สามารถโหลดข้อมูลสินค้าได้: {productError}</p>
                <button
                  type="button"
                  onClick={() => fetchProducts({ force: true })}
                  className="rounded-full border border-emerald-200 px-4 py-2 font-medium text-emerald-700 transition hover:bg-emerald-50"
                >
                  ลองโหลดใหม่อีกครั้ง
                </button>
              </div>
            ) : sellerProducts.length === 0 ? (
              <p>ยังไม่มีสินค้าในร้านของคุณ</p>
            ) : (
              <ul className="space-y-3">
                {sellerProducts.map((product) => (
                  <li key={product.id} className="rounded-2xl border border-emerald-100 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-emerald-900">{product.name}</p>
                        <p>ราคา ฿{product.price.toLocaleString()} • สต็อก {product.inStock}</p>
                        <p className="text-xs text-emerald-900/60">Slug: {product.slug}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(product)}
                          className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
                        >
                          แก้ไข
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(product.id)}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100"
                        >
                          ลบ
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
