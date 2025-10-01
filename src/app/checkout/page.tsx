"use client";

import { FormEvent, useMemo, useState } from "react";
import { useBasket } from "../hooks/useBasket";
import { useProducts } from "../hooks/useProducts";
import type { CustomerDetails } from "../types";

const defaultForm: CustomerDetails = {
  firstName: "",
  lastName: "",
  address: "",
  phone: "",
  purchaseDate: new Date().toISOString().slice(0, 10),
  deliveryMethod: "pickup",
  paymentMethod: "bank",
  pickupLocation: "กองบริหารงานทรัพย์สินฯ อาคารอิงคศรีกสิการ ชั้น 1",
};

export default function CheckoutPage() {
  const { items, subtotal, clearBasket } = useBasket();
  const { products } = useProducts();
  const [form, setForm] = useState(defaultForm);
  const [paymentSlipName, setPaymentSlipName] = useState("ไม่มีไฟล์แนบ");
  const [orderSuccess, setOrderSuccess] = useState(false);

  const totalQuantity = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  const estimatedShipping = useMemo(() => {
    if (form.deliveryMethod === "pickup") return 0;
    if (totalQuantity === 0) return 0;
    const base = 50;
    return base + Math.max(0, totalQuantity - 1) * 10;
  }, [form.deliveryMethod, totalQuantity]);

  const totalCost = subtotal + estimatedShipping;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOrderSuccess(true);
    clearBasket();
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,_1.4fr)_1fr]">
      <section>
        <h1 className="text-2xl font-semibold text-emerald-900">ข้อมูลลูกค้า</h1>
        <p className="mt-2 text-sm text-emerald-900/70">
          กรุณากรอกข้อมูลสำหรับการจัดส่งและติดต่อ - ข้อมูลของคุณจะถูกเก็บเป็นความลับและใช้เพื่อการจัดส่งเท่านั้น
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-emerald-900/80">
              ชื่อ *
              <input
                required
                value={form.firstName}
                onChange={(event) => setForm((prev) => ({ ...prev, firstName: event.target.value }))}
                placeholder="ชื่อ"
                className="rounded-2xl border border-emerald-200 px-4 py-2 text-sm focus:border-emerald-400 focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-emerald-900/80">
              นามสกุล *
              <input
                required
                value={form.lastName}
                onChange={(event) => setForm((prev) => ({ ...prev, lastName: event.target.value }))}
                placeholder="นามสกุล"
                className="rounded-2xl border border-emerald-200 px-4 py-2 text-sm focus:border-emerald-400 focus:outline-none"
              />
            </label>
          </div>
          <label className="flex flex-col gap-2 text-sm text-emerald-900/80">
            ที่อยู่ *
            <textarea
              required
              value={form.address}
              onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
              placeholder="ที่อยู่สำหรับจัดส่ง"
              rows={3}
              className="rounded-2xl border border-emerald-200 px-4 py-2 text-sm focus:border-emerald-400 focus:outline-none"
            />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-emerald-900/80">
              เบอร์โทร *
              <input
                required
                value={form.phone}
                onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                placeholder="0XX-XXX-XXXX"
                pattern="0[0-9]{2}-[0-9]{3}-[0-9]{4}"
                className="rounded-2xl border border-emerald-200 px-4 py-2 text-sm focus:border-emerald-400 focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-emerald-900/80">
              วันที่ซื้อ *
              <input
                required
                type="date"
                value={form.purchaseDate}
                onChange={(event) => setForm((prev) => ({ ...prev, purchaseDate: event.target.value }))}
                className="rounded-2xl border border-emerald-200 px-4 py-2 text-sm focus:border-emerald-400 focus:outline-none"
              />
            </label>
          </div>

          <div className="space-y-3 rounded-3xl border border-emerald-100 bg-white/80 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-emerald-900">จัดส่งรวดเร็ว</h2>
            <p className="text-sm text-emerald-900/70">
              เลือกวิธีการรับสินค้าและชำระเงินที่สะดวกสำหรับคุณ - รับประกันความปลอดภัยในทุกขั้นตอน
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              <fieldset className="space-y-3">
                <legend className="text-sm font-medium text-emerald-900">วิธีการรับสินค้า</legend>
                <label className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    checked={form.deliveryMethod === "pickup"}
                    onChange={() => setForm((prev) => ({ ...prev, deliveryMethod: "pickup" }))}
                  />
                  <div>
                    <p className="font-medium text-emerald-900">รับเอง</p>
                    <p className="text-xs text-emerald-900/70">รับที่กองบริหารงานทรัพย์สินฯ อาคารอิงคศรีกสิการ ชั้น 1</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm">
                  <input
                    type="radio"
                    name="deliveryMethod"
                    checked={form.deliveryMethod === "ems"}
                    onChange={() => setForm((prev) => ({ ...prev, deliveryMethod: "ems" }))}
                  />
                  <div>
                    <p className="font-medium text-emerald-900">จัดส่ง EMS</p>
                    <p className="text-xs text-emerald-900/70">ส่งชิ้นแรก 50 บาท ชิ้นต่อไป +10 บาท</p>
                  </div>
                </label>
              </fieldset>

              <fieldset className="space-y-3">
                <legend className="text-sm font-medium text-emerald-900">ช่องทางชำระเงิน</legend>
                <label className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={form.paymentMethod === "bank"}
                    onChange={() => setForm((prev) => ({ ...prev, paymentMethod: "bank" }))}
                  />
                  <div>
                    <p className="font-medium text-emerald-900">โอนผ่านธนาคาร</p>
                    <p className="text-xs text-emerald-900/70">กรุงไทย XXX-X-XXXXX-X</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={form.paymentMethod === "promptpay"}
                    onChange={() => setForm((prev) => ({ ...prev, paymentMethod: "promptpay" }))}
                  />
                  <div>
                    <p className="font-medium text-emerald-900">PromptPay</p>
                    <p className="text-xs text-emerald-900/70">0XX-XXX-XXXX</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={form.paymentMethod === "cash"}
                    onChange={() => setForm((prev) => ({ ...prev, paymentMethod: "cash" }))}
                  />
                  <div>
                    <p className="font-medium text-emerald-900">เงินสด</p>
                    <p className="text-xs text-emerald-900/70">สำหรับการรับเองเท่านั้น</p>
                  </div>
                </label>
              </fieldset>
            </div>
          </div>

          <label className="flex flex-col gap-2 text-sm text-emerald-900/80">
            รูปภาพสลิปการชำระเงิน
            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  if (file.size > 5 * 1024 * 1024) {
                    alert("ไฟล์ต้องมีขนาดไม่เกิน 5MB");
                    event.target.value = "";
                    return;
                  }
                  setPaymentSlipName(file.name);
                } else {
                  setPaymentSlipName("ไม่มีไฟล์แนบ");
                }
              }}
              className="rounded-2xl border border-dashed border-emerald-300 px-4 py-6 text-sm text-emerald-900/70 focus:border-emerald-400 focus:outline-none"
            />
            <span className="text-xs text-emerald-900/60">รองรับไฟล์ JPG, PNG ขนาดไม่เกิน 5MB • {paymentSlipName}</span>
          </label>

          <div className="flex flex-col gap-3 rounded-3xl border border-emerald-100 bg-white/80 p-6 text-sm text-emerald-900/80">
            <p className="font-medium text-emerald-900">พร้อมส่งคำสั่งซื้อแล้วใช่หรือไม่?</p>
            <p>กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนส่งคำสั่งซื้อ</p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                className="rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
              >
                ส่งคำสั่งซื้อ
              </button>
              <button
                type="button"
                onClick={() => {
                  setForm(defaultForm);
                  setPaymentSlipName("ไม่มีไฟล์แนบ");
                }}
                className="rounded-full border border-emerald-200 px-5 py-2.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
              >
                ล้างข้อมูล
              </button>
            </div>
            {orderSuccess ? (
              <p className="rounded-2xl bg-emerald-100/80 px-4 py-3 text-emerald-700">
                ขอบคุณสำหรับคำสั่งซื้อ ทีมงานจะติดต่อกลับเพื่อยืนยันและนัดจัดส่ง
              </p>
            ) : null}
          </div>
        </form>
      </section>

      <aside className="space-y-6">
        <div className="rounded-3xl border border-emerald-100 bg-white/90 p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-emerald-900">สรุปออเดอร์</h2>
          <ul className="mt-4 space-y-3 text-sm text-emerald-900/80">
            {items.map((item) => {
              const product = products.find((product) => product.id === item.productId);
              if (!product) return null;
              return (
                <li key={item.productId} className="flex items-center justify-between">
                  <span>
                    {product.name} × {item.quantity}
                  </span>
                  <span>฿{(product.price * item.quantity).toLocaleString()}</span>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 space-y-2 border-t border-emerald-100 pt-4 text-sm text-emerald-900">
            <p className="flex items-center justify-between">
              <span>ยอดรวมสินค้า</span>
              <span>฿{subtotal.toLocaleString()}</span>
            </p>
            <p className="flex items-center justify-between">
              <span>ค่าจัดส่งโดยประมาณ</span>
              <span>{estimatedShipping === 0 ? "รับเอง / ฟรี" : `฿${estimatedShipping.toLocaleString()}`}</span>
            </p>
            <p className="flex items-center justify-between text-lg font-semibold text-emerald-700">
              <span>ยอดที่ต้องชำระ</span>
              <span>฿{totalCost.toLocaleString()}</span>
            </p>
          </div>
          <p className="mt-4 text-xs text-emerald-900/60">
            *ยอดจัดส่งจริงอาจเปลี่ยนแปลงตามน้ำหนักและระยะทาง เจ้าหน้าที่จะแจ้งยอดที่แน่นอนอีกครั้งก่อนจัดส่ง
          </p>
        </div>
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-6 text-sm text-emerald-900/80">
          <p className="font-semibold text-emerald-900">ความปลอดภัยของข้อมูล</p>
          <p className="mt-2">
            PlantHub ปกป้องข้อมูลส่วนตัวของคุณอย่างเข้มงวด ระบบปฏิบัติตามมาตรการรักษาความปลอดภัยและเข้ารหัสข้อมูลตามมาตรฐานสากล
          </p>
        </div>
      </aside>
    </div>
  );
}
