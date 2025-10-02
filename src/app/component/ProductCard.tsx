"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useBasket } from "../hooks/useBasket";
import type { TreeProduct } from "../types";
import { LoginDialog } from "./dialogs";

interface ProductCardProps {
  product: TreeProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const { user, isLoading } = useAuth();
  const { addItem } = useBasket();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleAddToBasket = () => {
    if (isLoading) return;

    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    addItem(product, 1);
  };

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/product/${product.slug}`} className="relative aspect-[4/3]">
        <Image
          src={imgError ? "/plant-placeholder.svg" : product.imageUrl}
          alt={product.name}
          fill
          onError={() => setImgError(true)}
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(min-width: 1024px) 300px, 50vw"
          priority={product.featured}
        />
        <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-emerald-700">
          {product.category.toUpperCase()}
        </div>
        {product.views !== undefined && product.views > 0 && (
          <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-emerald-700">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>{product.views.toLocaleString()}</span>
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-emerald-900">
                <Link href={`/product/${product.slug}`}>{product.name}</Link>
              </h3>
              <p className="text-sm text-emerald-900/70">{product.scientificName}</p>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
              ฿{product.price.toLocaleString()}
            </span>
          </div>
          <p className="mt-3 line-clamp-2 text-sm text-emerald-900/80">{product.description}</p>
        </div>
        <div className="mt-auto flex items-center justify-between text-xs text-emerald-900/70">
          <div className="space-y-1">
            <p>สต็อก {product.inStock} ชุด</p>
            <p>🌤️ แสง: {product.light === "bright" ? "สว่าง" : product.light === "medium" ? "รำไร" : "แสงน้อย"}</p>
          </div>
          <button
            onClick={handleAddToBasket}
            disabled={isLoading}
            className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300"
          >
            {isLoading ? "กรุณารอสักครู่" : "ใส่ตะกร้า"}
          </button>
        </div>
      </div>
      {showLoginPrompt ? <LoginDialog onClose={() => setShowLoginPrompt(false)} /> : null}
    </div>
  );
}
