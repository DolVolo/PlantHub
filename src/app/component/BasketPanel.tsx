"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useBasket } from "../hooks/useBasket";
import { useProducts } from "../hooks/useProducts";

interface BasketPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BasketPanel({ isOpen, onClose }: BasketPanelProps) {
  const { items, subtotal, removeItem, updateQuantity } = useBasket();
  const { products } = useProducts();

  // Close panel when pressing Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

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

  return (
    <>
      {/* Backdrop Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
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
            <h2 className="text-xl font-semibold text-emerald-900">ตะกร้าสินค้า</h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-emerald-700 transition hover:bg-emerald-100"
              aria-label="Close basket"
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

          {/* Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <svg
                  className="h-20 w-20 text-emerald-200"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <p className="mt-4 text-emerald-900/70">ตะกร้าว่างเปล่า</p>
                <p className="mt-2 text-sm text-emerald-900/50">
                  เพิ่มสินค้าเพื่อเริ่มช้อปปิ้ง
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => {
                  const product = products.find((p) => p.id === item.productId);
                  if (!product) return null;

                  return (
                    <div
                      key={item.productId}
                      className="flex gap-3 rounded-2xl border border-emerald-100 bg-white p-3 transition hover:shadow-sm"
                    >
                      {/* Product Image */}
                      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl">
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-emerald-900">
                            {product.name}
                          </h3>
                          <p className="text-sm text-emerald-700">
                            ฿{product.price.toLocaleString()}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                updateQuantity(item.productId, Math.max(1, item.quantity - 1))
                              }
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-200 text-emerald-700 transition hover:bg-emerald-50"
                            >
                              −
                            </button>
                            <span className="w-8 text-center text-sm font-medium text-emerald-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  Math.min(product.inStock, item.quantity + 1)
                                )
                              }
                              disabled={item.quantity >= product.inStock}
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-200 text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item.productId)}
                            className="text-xs text-red-600 transition hover:text-red-700"
                          >
                            ลบ
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer - Total & Checkout */}
          {items.length > 0 && (
            <div className="border-t border-emerald-100 bg-emerald-50/30 px-6 py-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-emerald-900/70">ยอดรวม</span>
                <span className="text-xl font-bold text-emerald-900">
                  ฿{subtotal.toLocaleString()}
                </span>
              </div>

              <div className="space-y-2">
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="block w-full rounded-full bg-emerald-500 px-6 py-3 text-center font-semibold text-white shadow-sm transition hover:bg-emerald-600"
                >
                  ดำเนินการชำระเงิน
                </Link>
                <Link
                  href="/cart"
                  onClick={onClose}
                  className="block w-full rounded-full border border-emerald-200 px-6 py-3 text-center font-medium text-emerald-700 transition hover:bg-emerald-50"
                >
                  ดูตะกร้าทั้งหมด
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
