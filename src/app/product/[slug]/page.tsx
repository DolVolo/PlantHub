"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { LoginDialog } from "../../component/dialogs";
import { useAuth } from "../../hooks/useAuth";
import { useBasket } from "../../hooks/useBasket";
import { useProducts } from "../../hooks/useProducts";

export default function ProductDetailPage() {
  const params = useParams<{ slug: string | string[] }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const { getProductBySlug } = useProducts();
  const product = useMemo(() => (slug ? getProductBySlug(slug) : undefined), [getProductBySlug, slug]);
  const { user } = useAuth();
  const { addItem } = useBasket();
  const [quantity, setQuantity] = useState(1);
  const [showLogin, setShowLogin] = useState(false);

  if (!product) {
    return (
      <div className="rounded-3xl border border-dashed border-emerald-200 bg-white/70 p-10 text-center text-emerald-900/70">
        ไม่พบสินค้าที่คุณต้องการ อาจมีการอัปเดตสต็อกหรือสินค้าไม่พร้อมจำหน่ายในขณะนี้
      </div>
    );
  }

  const handleAddToBasket = () => {
    if (!user) {
      setShowLogin(true);
      return;
    }

    addItem(product, quantity);
  };

  const totalPrice = product.price * quantity;

  return (
    <div className="grid gap-10 md:grid-cols-[minmax(0,_1.2fr)_1fr]">
      <div className="space-y-6">
        <div className="relative h-[420px] overflow-hidden rounded-3xl">
          <Image src={product.imageUrl} alt={product.name} fill className="object-cover" sizes="(min-width: 1024px) 50vw, 100vw" />
        </div>
        <div className="rounded-3xl border border-emerald-100 bg-white/80 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-emerald-900">รายละเอียดสินค้า</h2>
          <p className="mt-3 text-sm leading-relaxed text-emerald-900/80">{product.description}</p>
          <div className="mt-5 grid gap-3 text-sm text-emerald-900/80 md:grid-cols-2">
            <div className="rounded-2xl bg-emerald-50/70 p-4">
              <p className="text-xs uppercase tracking-wide text-emerald-600">ระดับการดูแล</p>
              <p className="mt-1 text-base font-medium text-emerald-900">
                {product.careLevel === "beginner"
                  ? "เหมาะสำหรับมือใหม่"
                  : product.careLevel === "intermediate"
                    ? "ระดับปานกลาง"
                    : "ต้องการความชำนาญ"}
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-50/70 p-4">
              <p className="text-xs uppercase tracking-wide text-emerald-600">ความต้องการแสง</p>
              <p className="mt-1 text-base font-medium text-emerald-900">
                {product.light === "bright" ? "แสงจัด" : product.light === "medium" ? "แสงรำไร" : "แสงน้อย"}
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-50/70 p-4">
              <p className="text-xs uppercase tracking-wide text-emerald-600">การรดน้ำ</p>
              <p className="mt-1 text-base font-medium text-emerald-900">
                {product.water === "low" ? "1-2 ครั้ง/สัปดาห์" : product.water === "medium" ? "3 ครั้ง/สัปดาห์" : "วันเว้นวัน"}
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-50/70 p-4">
              <p className="text-xs uppercase tracking-wide text-emerald-600">ความสูงโดยประมาณ</p>
              <p className="mt-1 text-base font-medium text-emerald-900">
                {product.heightRangeCm[0]} - {product.heightRangeCm[1]} ซม.
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-emerald-100 bg-white/80 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-emerald-900">การจัดส่งและชำระเงิน</h3>
          <p className="mt-2 text-sm text-emerald-900/80">
            เลือกวิธีรับสินค้าและชำระเงินที่สะดวกสำหรับคุณ รับประกันความปลอดภัยในทุกขั้นตอน
          </p>
          <div className="mt-4 space-y-3 text-sm text-emerald-900/80">
            {product.deliveryOptions.map((option) => (
              <div key={option.method} className="rounded-2xl border border-emerald-100 p-4">
                <p className="font-medium text-emerald-800">
                  {option.method === "pickup"
                    ? "รับเอง"
                    : option.method === "ems"
                      ? "จัดส่ง EMS"
                      : option.method === "courier"
                        ? "ขนส่งเอกชน"
                        : "จัดส่งด่วน"}
                </p>
                <p className="text-emerald-900/70">{option.description}</p>
                <p className="mt-1 text-emerald-700">ค่าบริการ {option.price === 0 ? "ฟรี" : `฿${option.price}`}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <aside className="space-y-6">
        <div className="rounded-3xl border border-emerald-100 bg-white/90 p-6 shadow-lg">
          <p className="text-sm uppercase tracking-wide text-emerald-600">สินค้าจาก</p>
          <h1 className="mt-1 text-2xl font-semibold text-emerald-900">{product.name}</h1>
          <p className="text-sm text-emerald-900/70">{product.scientificName}</p>

          <div className="mt-5 space-y-1">
            <div className="flex items-center justify-between text-sm text-emerald-900/70">
              <span>ราคา/ชุด</span>
              <span>฿{product.price.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold text-emerald-900">ราคารวม</p>
              <p className="text-2xl font-bold text-emerald-600">฿{totalPrice.toLocaleString()}</p>
            </div>
          </div>
          <p className="mt-2 text-sm text-emerald-900/70">สต็อกคงเหลือ {product.inStock} ชุด</p>

          <div className="mt-5 flex items-center gap-3">
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-200 text-lg text-emerald-700 disabled:border-emerald-100 disabled:text-emerald-300"
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              disabled={quantity <= 1}
              aria-label="ลดจำนวน"
            >
              -
            </button>
            <span className="min-w-[3rem] text-center text-lg font-medium text-emerald-900">{quantity}</span>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-200 text-lg text-emerald-700 disabled:border-emerald-100 disabled:text-emerald-300"
              onClick={() => setQuantity((value) => Math.min(product.inStock, value + 1))}
              disabled={quantity >= product.inStock}
              aria-label="เพิ่มจำนวน"
            >
              +
            </button>
          </div>

          <button
            onClick={handleAddToBasket}
            className="mt-6 w-full rounded-full bg-emerald-500 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-600"
          >
            เพิ่มลงตะกร้า
          </button>
        </div>

        <div className="rounded-3xl border border-emerald-100 bg-white/80 p-6 text-sm text-emerald-900/80">
          <p className="font-semibold text-emerald-900">ข้อมูลผู้ขาย</p>
          <p className="mt-1 text-emerald-900">{product.seller.name}</p>
          <p>พื้นที่ : {product.seller.location}</p>
          <p>ยอดขายทั้งหมด : {product.seller.totalSales.toLocaleString()} รายการ</p>
          <p>คะแนนรีวิว : ⭐ {product.rating} ({product.reviews} รีวิว)</p>
        </div>
      </aside>

      {showLogin ? <LoginDialog onClose={() => setShowLogin(false)} /> : null}
    </div>
  );
}
