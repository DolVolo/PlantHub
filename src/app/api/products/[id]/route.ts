import { NextResponse } from "next/server";
import type { TreeProduct } from "../../../types";
import {
  updateFirestoreProduct,
  deleteFirestoreProduct,
  getFirestoreProduct,
} from "../firestore-products";

// Toggle between Firestore (true) and in-memory (false)
const USE_FIRESTORE = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? true : false;

/**
 * GET /api/products/[id] - Get single product
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    if (USE_FIRESTORE) {
      const product = await getFirestoreProduct(id);
      if (!product) {
        return NextResponse.json({ message: "ไม่พบสินค้า" }, { status: 404 });
      }
      return NextResponse.json(product);
    } else {
      return NextResponse.json({ message: "In-memory mode not supported for single product" }, { status: 501 });
    }
  } catch (error) {
    console.error("[Products API] GET error:", error);
    return NextResponse.json({ message: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

/**
 * PUT /api/products/[id] - Update product
 */
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const updates = (await request.json()) as Partial<TreeProduct>;

  try {
    if (USE_FIRESTORE) {
      await updateFirestoreProduct(id, updates);
      const updated = await getFirestoreProduct(id);
      return NextResponse.json(updated);
    } else {
      return NextResponse.json({ message: "In-memory mode not supported" }, { status: 501 });
    }
  } catch (error) {
    console.error("[Products API] PUT error:", error);
    return NextResponse.json({ message: "ไม่สามารถอัปเดตสินค้าได้" }, { status: 500 });
  }
}

/**
 * DELETE /api/products/[id] - Delete product
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    if (USE_FIRESTORE) {
      await deleteFirestoreProduct(id);
      return NextResponse.json({ message: "ลบสินค้าเรียบร้อยแล้ว" });
    } else {
      return NextResponse.json({ message: "In-memory mode not supported" }, { status: 501 });
    }
  } catch (error) {
    console.error("[Products API] DELETE error:", error);
    return NextResponse.json({ message: "ไม่สามารถลบสินค้าได้" }, { status: 500 });
  }
}
