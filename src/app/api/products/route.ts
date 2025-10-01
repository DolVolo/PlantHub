import { NextResponse } from "next/server";
import { initialTreeProducts } from "../../data/products";
import type { TreeProduct } from "../../types";

let products: TreeProduct[] = [...initialTreeProducts];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9ก-๙]+/gi, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");

export async function GET() {
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const payload = (await request.json()) as Partial<TreeProduct>;

  if (!payload.name) {
    return NextResponse.json({ message: "ต้องระบุชื่อสินค้า" }, { status: 400 });
  }

  const id = payload.id ?? `product-${Date.now()}`;
  const slug = payload.slug ?? slugify(payload.name);

  if (products.some((product) => product.id === id || product.slug === slug)) {
    return NextResponse.json({ message: "มีสินค้านี้อยู่แล้ว" }, { status: 409 });
  }

  const newProduct: TreeProduct = {
    id,
    slug,
    name: payload.name,
    scientificName: payload.scientificName ?? payload.name,
    description: payload.description ?? "",
    price: payload.price ?? 0,
    inStock: payload.inStock ?? 0,
    heightRangeCm: payload.heightRangeCm ?? [50, 100],
    category: payload.category ?? "indoor",
    tags: payload.tags ?? [],
    imageUrl:
      payload.imageUrl ??
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80",
    thumbnailUrl: payload.thumbnailUrl ?? payload.imageUrl,
    seller: payload.seller ?? {
      id: "planthub-default",
      name: "PlantHub",
      location: "กรุงเทพมหานคร",
      rating: 5,
      totalSales: 0,
    },
    rating: payload.rating ?? 5,
    reviews: payload.reviews ?? 0,
    featured: payload.featured ?? false,
    deliveryOptions:
      payload.deliveryOptions ??
      [
        { method: "pickup", price: 0, description: "รับสินค้าเองที่หน้าร้าน" },
        { method: "ems", price: 50, description: "จัดส่ง EMS มาตรฐาน" },
      ],
    careLevel: payload.careLevel ?? "beginner",
    light: payload.light ?? "medium",
    water: payload.water ?? "medium",
  };

  products = [...products, newProduct];

  return NextResponse.json(newProduct, { status: 201 });
}
