import { NextResponse } from "next/server";
import { adminFirestore } from "../../lib/firebaseAdmin";

// POST: Submit order and decrease stock
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, customerDetails, userId } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { message: "No items in order" },
        { status: 400 }
      );
    }

    if (!customerDetails) {
      return NextResponse.json(
        { message: "Customer details are required" },
        { status: 400 }
      );
    }

    const batch = adminFirestore().batch();
    const orderItems = [];

    // Check stock and prepare updates
    for (const item of items) {
      const productRef = adminFirestore().collection("products").doc(item.productId);
      const productDoc = await productRef.get();

      if (!productDoc.exists) {
        return NextResponse.json(
          { message: `Product ${item.productId} not found` },
          { status: 404 }
        );
      }

      const product = productDoc.data();
      const currentStock = product?.inStock || 0;

      if (currentStock < item.quantity) {
        return NextResponse.json(
          { message: `Insufficient stock for ${product?.name}` },
          { status: 400 }
        );
      }

      // Prepare stock update
      batch.update(productRef, {
        inStock: currentStock - item.quantity,
      });

      orderItems.push({
        productId: item.productId,
        productName: product?.name,
        quantity: item.quantity,
        price: product?.price,
      });
    }

    // Create order document
    const orderData = {
      userId: userId || null,
      items: orderItems,
      customerDetails,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    const orderRef = adminFirestore().collection("orders").doc();
    batch.set(orderRef, orderData);

    // Commit all changes
    await batch.commit();

    return NextResponse.json(
      {
        message: "Order submitted successfully",
        orderId: orderRef.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Submit Order] Error:", error);
    return NextResponse.json(
      { message: "Failed to submit order" },
      { status: 500 }
    );
  }
}
