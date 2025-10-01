"use client";

import { useMemo, useState } from "react";
import { FilterBar } from "./component/FilterBar";
import { ProductGrid } from "./component/ProductGrid";
import { useProducts } from "./hooks/useProducts";
import type { TreeProduct } from "./types";

function filterProducts(
  products: TreeProduct[],
  {
    keyword,
    category,
    careLevel,
    tags,
  }: {
    keyword: string;
    category: "all" | TreeProduct["category"];
    careLevel: "all" | TreeProduct["careLevel"];
    tags: string[];
  },
) {
  return products.filter((product) => {
    const keywordMatch = keyword
      ? [product.name, product.scientificName, product.description, product.tags.join(" ")]
          .join(" ")
          .toLowerCase()
          .includes(keyword.toLowerCase())
      : true;

    const categoryMatch = category === "all" ? true : product.category === category;

    const careMatch = careLevel === "all" ? true : product.careLevel === careLevel;

    const tagsMatch = tags.length === 0 ? true : tags.every((tag) => product.tags.includes(tag));

    return keywordMatch && categoryMatch && careMatch && tagsMatch;
  });
}

export default function Home() {
  const { products, status, error, fetchProducts } = useProducts();
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState<"all" | TreeProduct["category"]>("all");
  const [careLevel, setCareLevel] = useState<"all" | TreeProduct["careLevel"]>("all");
  const [tags, setTags] = useState<string[]>([]);

  const filteredProducts = useMemo(
    () => filterProducts(products, { keyword, category, careLevel, tags }),
    [category, careLevel, keyword, products, tags],
  );

  const isLoading = status === "idle" || status === "loading";

  return (
    <div className="space-y-10">
      <section className="grid gap-8 rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-400 p-10 text-white shadow-lg">
        <div className="space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1 text-sm font-medium">
            🌿 PlantHub Marketplace
          </span>
          <h1 className="text-3xl font-semibold md:text-4xl">
            ค้นหาต้นไม้ที่ใช่ ส่งตรงจากร้านต้นไม้คุณภาพทั่วประเทศ
          </h1>
          <p className="max-w-2xl text-sm text-emerald-50 md:text-base">
            ซื้อต้นไม้เหมือนช้อปปิ้งบน Amazon หรือ Shopee เลือกดูรายละเอียด ราคา และสต็อกได้ก่อนตัดสินใจ เพิ่มลงตะกร้า และชำระเงินได้ในที่เดียว
          </p>
        </div>
        <div className="grid gap-4 text-sm text-emerald-50 md:grid-cols-3">
          <div className="rounded-2xl bg-white/15 p-4">
            <p className="text-lg font-semibold">2,000+ ต้นไม้พร้อมส่ง</p>
            <p className="mt-2 text-emerald-50/80">ร้านค้าที่ผ่านการคัดเลือก มีรีวิวจริงจากลูกค้า</p>
          </div>
          <div className="rounded-2xl bg-white/15 p-4">
            <p className="text-lg font-semibold">จัดส่งรวดเร็วทั่วไทย</p>
            <p className="mt-2 text-emerald-50/80">เลือกวิธีรับสินค้าได้ตามสะดวก พร้อมแพ็คกันกระแทก</p>
          </div>
          <div className="rounded-2xl bg-white/15 p-4">
            <p className="text-lg font-semibold">เปิดร้านง่ายใน 3 นาที</p>
            <p className="mt-2 text-emerald-50/80">เครื่องมือผู้ขายครบ ดูยอดขายและจัดการสต็อกได้ทันที</p>
          </div>
        </div>
      </section>

      <FilterBar
        keyword={keyword}
        onKeywordChange={setKeyword}
        category={category}
        onCategoryChange={setCategory}
        careLevel={careLevel}
        onCareLevelChange={setCareLevel}
        tags={tags}
        onTagsChange={setTags}
      />

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-80 animate-pulse rounded-3xl border border-emerald-100 bg-white/60"
            />
          ))}
        </div>
      ) : error ? (
        <div className="space-y-4 rounded-3xl border border-red-100 bg-red-50/60 p-8 text-red-700">
          <p>ไม่สามารถโหลดรายการสินค้าได้ในขณะนี้</p>
          <button
            onClick={() => fetchProducts({ force: true })}
            className="rounded-full bg-red-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-600"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      ) : (
        <ProductGrid products={filteredProducts} />
      )}
    </div>
  );
}
