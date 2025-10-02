"use client";

import { FormEvent, useMemo, useState, useEffect } from "react";
import axios from "axios";
import { useBasket } from "../hooks/useBasket";
import { useProducts } from "../hooks/useProducts";
import { useAuth } from "../hooks/useAuth";
import type { CustomerDetails, SavedPaymentInfo } from "../types";

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
  const { products, status, error, fetchProducts } = useProducts();
  const { user } = useAuth();
  const [form, setForm] = useState(defaultForm);
  const [paymentSlipName, setPaymentSlipName] = useState("ไม่มีไฟล์แนบ");
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  
  // Saved payment info state
  const [savedPaymentInfoList, setSavedPaymentInfoList] = useState<SavedPaymentInfo[]>([]);
  const [selectedPaymentInfoId, setSelectedPaymentInfoId] = useState<string | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [saveThisInfo, setSaveThisInfo] = useState(false);
  const [newInfoName, setNewInfoName] = useState("");
  const [isLoadingSavedInfo, setIsLoadingSavedInfo] = useState(false);

  // Fetch saved payment info when user is available
  useEffect(() => {
    if (user) {
      fetchSavedPaymentInfo();
    }
  }, [user]);

  // Set showNewAddressForm to true if user has no saved addresses
  useEffect(() => {
    if (user && savedPaymentInfoList.length === 0 && !isLoadingSavedInfo) {
      setShowNewAddressForm(true);
    }
  }, [user, savedPaymentInfoList, isLoadingSavedInfo]);

  const fetchSavedPaymentInfo = async () => {
    if (!user) return;
    
    setIsLoadingSavedInfo(true);
    try {
      const response = await axios.get<SavedPaymentInfo[]>(
        `/api/payment-info?userId=${user.id}`
      );
      setSavedPaymentInfoList(response.data);
      
      // Auto-select default if available
      const defaultInfo = response.data.find((info) => info.isDefault);
      if (defaultInfo && !selectedPaymentInfoId) {
        handleSelectSavedInfo(defaultInfo.id);
      }
    } catch (error) {
      console.error("Failed to fetch saved payment info:", error);
    } finally {
      setIsLoadingSavedInfo(false);
    }
  };

  const handleSelectSavedInfo = (infoId: string) => {
    const selectedInfo = savedPaymentInfoList.find((info) => info.id === infoId);
    if (selectedInfo) {
      setForm((prev) => ({
        ...prev,
        firstName: selectedInfo.firstName,
        lastName: selectedInfo.lastName,
        address: selectedInfo.address,
        phone: selectedInfo.phone,
      }));
      setSelectedPaymentInfoId(infoId);
      setShowNewAddressForm(false);
    }
  };

  const handleUseNewAddress = () => {
    setForm((prev) => ({
      ...prev,
      firstName: "",
      lastName: "",
      address: "",
      phone: "",
    }));
    setSelectedPaymentInfoId(null);
    setShowNewAddressForm(true);
  };

  const handleSavePaymentInfo = async () => {
    if (!user || !newInfoName.trim()) {
      console.log("Cannot save payment info: missing user or name");
      return;
    }

    try {
      console.log("Saving payment info:", {
        userId: user.id,
        name: newInfoName.trim(),
        firstName: form.firstName,
        lastName: form.lastName,
        address: form.address,
        phone: form.phone,
      });
      
      const response = await axios.post("/api/payment-info", {
        userId: user.id,
        name: newInfoName.trim(),
        firstName: form.firstName,
        lastName: form.lastName,
        address: form.address,
        phone: form.phone,
        isDefault: savedPaymentInfoList.length === 0, // First one becomes default
      });
      
      console.log("Payment info saved successfully:", response.data);
      await fetchSavedPaymentInfo();
      setNewInfoName("");
      setSaveThisInfo(false);
    } catch (error) {
      console.error("Failed to save payment info:", error);
    }
  };

  const totalQuantity = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  const estimatedShipping = useMemo(() => {
    if (form.deliveryMethod === "pickup") return 0;
    if (totalQuantity === 0) return 0;
    const base = 50;
    return base + Math.max(0, totalQuantity - 1) * 10;
  }, [form.deliveryMethod, totalQuantity]);

  const totalCost = subtotal + estimatedShipping;
  const isLoadingProducts = status === "idle" || status === "loading";
  
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOrderError(null);

    if (items.length === 0) {
      setOrderError("กรุณาเลือกสินค้าก่อนทำการสั่งซื้อ");
      return;
    }

    if (status !== "success") {
      setOrderError("ไม่สามารถยืนยันคำสั่งซื้อได้เนื่องจากข้อมูลสินค้ายังไม่พร้อม กรุณาลองอีกครั้ง");
      return;
    }

    try {
      // Submit order to API (this will decrease stock)
      console.log("Submitting order with items:", items);
      const response = await axios.post("/api/orders", {
        items,
        customerDetails: form,
        userId: user?.id || null,
      });
      console.log("Order submitted successfully:", response.data);

      // Save payment info if requested
      if (saveThisInfo && user && showNewAddressForm && newInfoName.trim()) {
        console.log("Attempting to save payment info...", {
          saveThisInfo,
          hasUser: !!user,
          showNewAddressForm,
          newInfoName: newInfoName.trim(),
        });
        await handleSavePaymentInfo();
      } else {
        console.log("Skipping payment info save:", {
          saveThisInfo,
          hasUser: !!user,
          showNewAddressForm,
          newInfoName: newInfoName.trim(),
        });
      }

      setOrderSuccess(true);
      clearBasket();
      
      // Refresh products to show updated stock
      fetchProducts({ force: true });
    } catch (error) {
      console.error("Order submission error:", error);
      if (axios.isAxiosError(error)) {
        setOrderError(error.response?.data?.message || "เกิดข้อผิดพลาดในการส่งคำสั่งซื้อ");
      } else {
        setOrderError("เกิดข้อผิดพลาดในการส่งคำสั่งซื้อ");
      }
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,_1.4fr)_1fr]">
      <section>
        <h1 className="text-2xl font-semibold text-emerald-900">ข้อมูลลูกค้า</h1>
        <p className="mt-2 text-sm text-emerald-900/70">
          กรุณากรอกข้อมูลสำหรับการจัดส่งและติดต่อ - ข้อมูลของคุณจะถูกเก็บเป็นความลับและใช้เพื่อการจัดส่งเท่านั้น
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Saved Payment Info Selection */}
          {user && savedPaymentInfoList.length > 0 && (
            <div className="rounded-3xl border border-emerald-100 bg-white/80 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-emerald-900">เลือกที่อยู่ที่บันทึกไว้</h2>
              <p className="mt-2 text-sm text-emerald-900/70">
                เลือกข้อมูลที่คุณเคยบันทึกไว้ หรือเพิ่มที่อยู่ใหม่
              </p>
              
              {isLoadingSavedInfo ? (
                <div className="mt-4 text-center text-sm text-emerald-600">กำลังโหลด...</div>
              ) : (
                <div className="mt-4 space-y-3">
                  {savedPaymentInfoList.map((info) => (
                    <label
                      key={info.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-2xl border-2 bg-white p-4 transition ${
                        selectedPaymentInfoId === info.id
                          ? "border-emerald-500 bg-emerald-50/50"
                          : "border-emerald-200 hover:border-emerald-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="savedAddress"
                        checked={selectedPaymentInfoId === info.id}
                        onChange={() => handleSelectSavedInfo(info.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-emerald-900">{info.name}</p>
                          {info.isDefault && (
                            <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs text-white">
                              ค่าเริ่มต้น
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-emerald-900">
                          {info.firstName} {info.lastName}
                        </p>
                        <p className="mt-1 text-sm text-emerald-700">{info.address}</p>
                        <p className="mt-1 text-sm text-emerald-600">โทร: {info.phone}</p>
                      </div>
                    </label>
                  ))}
                  
                  <button
                    type="button"
                    onClick={handleUseNewAddress}
                    className={`w-full rounded-2xl border-2 border-dashed p-4 text-sm font-medium transition ${
                      showNewAddressForm
                        ? "border-emerald-500 bg-emerald-50/50 text-emerald-700"
                        : "border-emerald-200 text-emerald-600 hover:border-emerald-400 hover:bg-emerald-50"
                    }`}
                  >
                    + ใช้ที่อยู่ใหม่
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Show form only if new address or no saved addresses */}
          {(!user || savedPaymentInfoList.length === 0 || showNewAddressForm) && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-emerald-900/80">
              ชื่อ *
              <input
                required
                value={form.firstName}
                onChange={(event) => setForm((prev) => ({ ...prev, firstName: event.target.value }))}
                placeholder="ชื่อ"
                className="rounded-2xl border border-emerald-200 bg-white px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-emerald-900/80">
              นามสกุล *
              <input
                required
                value={form.lastName}
                onChange={(event) => setForm((prev) => ({ ...prev, lastName: event.target.value }))}
                placeholder="นามสกุล"
                className="rounded-2xl border border-emerald-200 bg-white px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:outline-none"
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
              className="rounded-2xl border border-emerald-200 bg-white px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:outline-none"
            />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-emerald-900/80">
              เบอร์โทร *
              <input
                required
                type="tel"
                value={form.phone}
                onChange={(event) => {
                  // Remove all non-digits
                  const digits = event.target.value.replace(/\D/g, '');
                  // Format as XXX-XXX-XXXX
                  let formatted = digits;
                  if (digits.length >= 3) {
                    formatted = digits.slice(0, 3) + '-' + digits.slice(3);
                  }
                  if (digits.length >= 6) {
                    formatted = digits.slice(0, 3) + '-' + digits.slice(3, 6) + '-' + digits.slice(6, 10);
                  }
                  setForm((prev) => ({ ...prev, phone: formatted }));
                }}
                placeholder="0XX-XXX-XXXX"
                pattern="0[0-9]{2}-[0-9]{3}-[0-9]{4}"
                maxLength={12}
                className="rounded-2xl border border-emerald-200 bg-white px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-emerald-900/80">
              วันที่ซื้อ *
              <input
                required
                type="date"
                value={form.purchaseDate}
                onChange={(event) => setForm((prev) => ({ ...prev, purchaseDate: event.target.value }))}
                className="rounded-2xl border border-emerald-200 bg-white px-4 py-2 text-sm text-gray-900 focus:border-emerald-400 focus:outline-none"
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

          {/* Save this info checkbox - only for new addresses */}
          {user && showNewAddressForm && (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveThisInfo}
                  onChange={(e) => setSaveThisInfo(e.target.checked)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="font-medium text-emerald-900">บันทึกข้อมูลนี้สำหรับครั้งถัดไป</p>
                  {saveThisInfo && (
                    <input
                      type="text"
                      value={newInfoName}
                      onChange={(e) => setNewInfoName(e.target.value)}
                      placeholder="ตั้งชื่อสำหรับที่อยู่นี้ (เช่น บ้าน, ที่ทำงาน)"
                      className="mt-2 w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:outline-none"
                      required={saveThisInfo}
                    />
                  )}
                </div>
              </label>
            </div>
          )}
            </>
          )}

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
                disabled={items.length === 0 || isLoadingProducts}
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
            {orderError ? <p className="rounded-2xl bg-red-100/70 px-4 py-3 text-red-700">{orderError}</p> : null}
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
          <div className="mt-4 text-sm text-emerald-900/80">
            {isLoadingProducts ? (
              <p className="animate-pulse text-emerald-700">กำลังดึงข้อมูลสินค้า...</p>
            ) : status === "error" ? (
              <div className="space-y-3 text-sm">
                <p className="text-red-600">ไม่สามารถโหลดข้อมูลสินค้าได้: {error}</p>
                <button
                  type="button"
                  onClick={() => fetchProducts({ force: true })}
                  className="rounded-full border border-emerald-200 px-4 py-2 font-medium text-emerald-700 transition hover:bg-emerald-50"
                >
                  ลองใหม่อีกครั้ง
                </button>
              </div>
            ) : items.length === 0 ? (
              <p>ยังไม่มีสินค้าในตะกร้า</p>
            ) : (
              <ul className="space-y-3">
                {items.map((item) => {
                  const product = products.find((product) => product.id === item.productId);
                  if (!product) {
                    return (
                      <li key={item.productId} className="rounded-2xl bg-amber-50/80 p-3 text-amber-800">
                        สินค้าในคำสั่งซื้อถูกนำออกจากคลังแล้ว กรุณาตรวจสอบอีกครั้ง
                      </li>
                    );
                  }
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
            )}
          </div>
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
