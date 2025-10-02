import { NextResponse } from "next/server";
import { adminFirestore } from "../../../../lib/firebaseAdmin";

// POST: Increment product view count
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { message: "Product ID is required" },
        { status: 400 }
      );
    }

    const productRef = adminFirestore().collection("products").doc(id);
    const productDoc = await productRef.get();

    if (!productDoc.exists) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    const currentViews = productDoc.data()?.views || 0;
    await productRef.update({
      views: currentViews + 1,
    });

    return NextResponse.json({ 
      message: "View count incremented",
      views: currentViews + 1 
    });
  } catch (error) {
    console.error("[Increment View] Error:", error);
    return NextResponse.json(
      { message: "Failed to increment view count" },
      { status: 500 }
    );
  }
}
