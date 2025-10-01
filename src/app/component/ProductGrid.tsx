import type { TreeProduct } from "../types";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: TreeProduct[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-emerald-200 bg-white/60 p-10 text-center text-emerald-900/70">
        ไม่พบท่ีน่าสนใจตามเงื่อนไขที่คุณเลือก ลองปรับการค้นหาใหม่อีกครั้งนะคะ 🌿
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
