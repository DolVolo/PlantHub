import { NextResponse } from "next/server";
import { adminFirestore } from "../../../../lib/firebaseAdmin";

// POST: Increment product view count (once per user/session)
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { userId, sessionId } = body;

    if (!id) {
      return NextResponse.json(
        { message: "Product ID is required" },
        { status: 400 }
      );
    }

    // Use either userId or sessionId to track unique views
    const viewerId = userId || sessionId;
    if (!viewerId) {
      return NextResponse.json(
        { message: "User ID or Session ID is required" },
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

    // Check if this user/session has already viewed this product
    const viewsRef = adminFirestore()
      .collection("productViews")
      .doc(`${id}_${viewerId}`);
    
    const viewDoc = await viewsRef.get();

    // If already viewed, don't increment
    if (viewDoc.exists) {
      return NextResponse.json({ 
        message: "Already viewed",
        views: productDoc.data()?.views || 0,
        alreadyViewed: true
      });
    }

    // Record this view
    await viewsRef.set({
      productId: id,
      viewerId,
      viewedAt: new Date().toISOString(),
    });

    // Increment view count
    const currentViews = productDoc.data()?.views || 0;
    await productRef.update({
      views: currentViews + 1,
    });

    return NextResponse.json({ 
      message: "View count incremented",
      views: currentViews + 1,
      alreadyViewed: false
    });
  } catch (error) {
    console.error("[Increment View] Error:", error);
    return NextResponse.json(
      { message: "Failed to increment view count" },
      { status: 500 }
    );
  }
}
