import { NextResponse } from "next/server";
import type { Shop } from "../../../types";
import { adminFirestore } from "../../../lib/firebaseAdmin";

const SHOPS_COLLECTION = "shops";

/**
 * GET /api/shops/[id] - Get single shop
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const db = adminFirestore();
    const doc = await db.collection(SHOPS_COLLECTION).doc(id).get();

    if (!doc.exists) {
      return NextResponse.json({ message: "ไม่พบร้านค้า" }, { status: 404 });
    }

    const shop: Shop = {
      id: doc.id,
      ...doc.data(),
    } as Shop;

    return NextResponse.json(shop);
  } catch (error) {
    console.error("[Shops API] GET error:", error);
    return NextResponse.json({ message: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}

/**
 * PUT /api/shops/[id] - Update shop
 */
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const updates = (await request.json()) as Partial<Shop>;

  try {
    const db = adminFirestore();
    const docRef = db.collection(SHOPS_COLLECTION).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ message: "ไม่พบร้านค้า" }, { status: 404 });
    }

    await docRef.update({
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    const updated = await docRef.get();
    const shop: Shop = {
      id: updated.id,
      ...updated.data(),
    } as Shop;

    return NextResponse.json(shop);
  } catch (error) {
    console.error("[Shops API] PUT error:", error);
    return NextResponse.json({ message: "ไม่สามารถอัปเดตร้านค้าได้" }, { status: 500 });
  }
}

/**
 * DELETE /api/shops/[id] - Delete shop
 */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const db = adminFirestore();
    await db.collection(SHOPS_COLLECTION).doc(id).delete();

    return NextResponse.json({ message: "ลบร้านค้าเรียบร้อยแล้ว" });
  } catch (error) {
    console.error("[Shops API] DELETE error:", error);
    return NextResponse.json({ message: "ไม่สามารถลบร้านค้าได้" }, { status: 500 });
  }
}
