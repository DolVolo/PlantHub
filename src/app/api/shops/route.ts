import { NextResponse } from "next/server";
import type { Shop } from "../../types";
import { adminFirestore } from "../../lib/firebaseAdmin";

const SHOPS_COLLECTION = "shops";

/**
 * GET /api/shops - Get all shops or shops by owner
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get("ownerId");

    const db = adminFirestore();
    const query = db.collection(SHOPS_COLLECTION);

    if (ownerId) {
      const queryWithFilter = query.where("ownerId", "==", ownerId);
      const snapshot = await queryWithFilter.get();
      const shops = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Shop[];
      return NextResponse.json(shops);
    }

    const snapshot = await query.get();
    const shops = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Shop[];

    return NextResponse.json(shops);
  } catch (error) {
    console.error("[Shops API] GET error:", error);
    return NextResponse.json({ message: "ไม่สามารถโหลดข้อมูลร้านค้าได้" }, { status: 500 });
  }
}

/**
 * POST /api/shops - Create a new shop
 */
export async function POST(request: Request) {
  try {
    const data = (await request.json()) as Omit<Shop, "id" | "createdAt" | "updatedAt">;

    if (!data.ownerId || !data.name) {
      return NextResponse.json({ message: "ต้องระบุเจ้าของร้านและชื่อร้าน" }, { status: 400 });
    }

    const db = adminFirestore();
    
    // Check if owner already has a shop
    const existingShops = await db
      .collection(SHOPS_COLLECTION)
      .where("ownerId", "==", data.ownerId)
      .get();

    if (!existingShops.empty) {
      return NextResponse.json({ message: "คุณมีร้านค้าอยู่แล้ว" }, { status: 409 });
    }

    const now = new Date().toISOString();
    const shopData = {
      ...data,
      rating: data.rating || 5,
      totalSales: data.totalSales || 0,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await db.collection(SHOPS_COLLECTION).add(shopData);

    const newShop: Shop = {
      id: docRef.id,
      ...shopData,
    };

    return NextResponse.json(newShop, { status: 201 });
  } catch (error) {
    console.error("[Shops API] POST error:", error);
    return NextResponse.json({ message: "ไม่สามารถสร้างร้านค้าได้" }, { status: 500 });
  }
}
