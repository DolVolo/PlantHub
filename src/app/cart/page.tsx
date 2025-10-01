"use client";

import Link from "next/link";
import { useBasket } from "../hooks/useBasket";
import { useProducts } from "../hooks/useProducts";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useBasket();
  const { products, status, error, fetchProducts } = useProducts();

  const cartItems = items
    .map((item) => {
      const product = products.find((product) => product.id === item.productId);
      if (!product) return null;
      return { ...item, product };
    })
    .filter((value): value is { productId: string; quantity: number; product: (typeof products)[number] } => value !== null);

  if (status === "idle" || status === "loading") {
    return (
      <div className="space-y-6 rounded-3xl border border-emerald-100 bg-white/80 p-10 text-center text-emerald-900/70">
        <p>กำลังโหลดตะกร้าสินค้า...</p>
        <div className="flex justify-center gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-28 w-28 animate-pulse rounded-2xl bg-emerald-100/60" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 rounded-3xl border border-red-100 bg-red-50/70 p-10 text-center text-red-700">
        <p>ไม่สามารถโหลดข้อมูลสินค้าเพื่อแสดงในตะกร้าได้</p>
        <button
          onClick={() => fetchProducts({ force: true })}
          className="rounded-full bg-red-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-600"
        >
          ลองใหม่อีกครั้ง
        </button>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="space-y-6 rounded-3xl border border-emerald-100 bg-white/80 p-10 text-center text-emerald-900/70">
        <p>ยังไม่มีสินค้าในตะกร้า</p>
        <Link href="/" className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-600">
          เลือกต้นไม้เพิ่ม
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,_1.4fr)_1fr]">
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold text-emerald-900">ตะกร้าของคุณ</h1>
        <div className="space-y-4">
          {cartItems.map(({ productId, quantity, product }) => {
            const maxQuantity = product.inStock;
            return (
              <div key={productId} className="flex flex-col gap-4 rounded-3xl border border-emerald-100 bg-white/90 p-6 shadow-sm md:flex-row md:items-center md:gap-6">
              <div className="flex-1">
                <p className="text-lg font-semibold text-emerald-900">{product.name}</p>
                <p className="text-sm text-emerald-900/70">{product.scientificName}</p>
                <p className="mt-2 text-sm text-emerald-900/70">ราคา ฿{product.price.toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-200 text-lg text-emerald-700"
                  onClick={() => updateQuantity(productId, Math.max(1, quantity - 1))}
                  aria-label="ลดจำนวน"
                >
                  -
                </button>
                <span className="min-w-[2.5rem] text-center text-lg font-medium text-emerald-900">{quantity}</span>
                <button
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-200 text-lg text-emerald-700"
                    onClick={() => updateQuantity(productId, Math.min(maxQuantity, quantity + 1))}
                  aria-label="เพิ่มจำนวน"
                >
                  +
                </button>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-emerald-900">
                  ฿{(product.price * quantity).toLocaleString()}
                </p>
                <button
                  className="mt-2 text-sm text-emerald-600 underline-offset-2 hover:underline"
                  onClick={() => removeItem(productId)}
                >
                  ลบออกจากตะกร้า
                </button>
              </div>
            </div>
            );
          })}
        </div>
      </section>

      <aside className="rounded-3xl border border-emerald-100 bg-white/90 p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-emerald-900">สรุปคำสั่งซื้อ</h2>
        <div className="mt-4 space-y-3 text-sm text-emerald-900/80">
          <div className="flex items-center justify-between">
            <span>ยอดรวม</span>
            <span>฿{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>ค่าจัดส่ง (ประมาณ)</span>
            <span>คำนวณในขั้นตอนชำระเงิน</span>
          </div>
        </div>
        <div className="mt-6 space-y-3 text-sm text-emerald-900/70">
          <p>ข้อมูลของคุณจะถูกเก็บเป็นความลับและใช้เพื่อการจัดส่งเท่านั้น</p>
          <p>รับประกันสินค้าทุกต้น แพ็คอย่างทะนุถนอมถึงมือคุณ</p>
        </div>
        <Link
          href="/checkout"
          className="mt-6 block rounded-full bg-emerald-500 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
        >
          ดำเนินการชำระเงิน
        </Link>
      </aside>
    </div>
  );
}
