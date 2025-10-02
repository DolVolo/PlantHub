import { NextResponse } from "next/server";
import { initialTreeProducts } from "../../../data/products";
import { seedFirestoreProducts, getFirestoreProducts } from "../firestore-products";

const USE_FIRESTORE = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? true : false;

export async function POST() {
  if (!USE_FIRESTORE) {
    return NextResponse.json(
      { message: "Firestore not configured. Set NEXT_PUBLIC_FIREBASE_PROJECT_ID to enable." },
      { status: 400 }
    );
  }

  try {
    // Check if products already exist
    const existing = await getFirestoreProducts();
    if (existing.length > 0) {
      return NextResponse.json(
        {
          message: `Database already has ${existing.length} products. Skipping seed.`,
          count: existing.length,
        },
        { status: 200 }
      );
    }

    // Seed products
    await seedFirestoreProducts(initialTreeProducts);

    return NextResponse.json(
      {
        message: "Seeded products successfully",
        count: initialTreeProducts.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Seed] Error:", error);
    return NextResponse.json({ message: "Failed to seed products" }, { status: 500 });
  }
}
