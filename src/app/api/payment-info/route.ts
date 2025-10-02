import { NextResponse } from "next/server";
import { adminFirestore } from "../../lib/firebaseAdmin";
import type { SavedPaymentInfo } from "@/app/types";

// GET: Fetch all saved payment info for a user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    console.log("[GET Payment Info] Fetching for userId:", userId);

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    // Query without orderBy to avoid index issues
    const snapshot = await adminFirestore()
      .collection("paymentInfo")
      .where("userId", "==", userId)
      .get();

    console.log("[GET Payment Info] Found documents:", snapshot.size);

    const paymentInfoList: SavedPaymentInfo[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as SavedPaymentInfo[];

    // Sort in memory by createdAt
    paymentInfoList.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA; // Descending order
    });

    console.log("[GET Payment Info] Returning:", paymentInfoList.length, "items");

    return NextResponse.json(paymentInfoList);
  } catch (error) {
    console.error("[GET Payment Info] Error:", error);
    return NextResponse.json(
      { message: "Failed to fetch payment information" },
      { status: 500 }
    );
  }
}

// POST: Create new saved payment info
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, name, firstName, lastName, address, phone, isDefault } = body;

    console.log("[POST Payment Info] Received data:", { userId, name, firstName, lastName, address, phone, isDefault });

    if (!userId || !name || !firstName || !lastName || !address || !phone) {
      console.log("[POST Payment Info] Missing required fields");
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // If this is set as default, unset all other defaults for this user
    if (isDefault) {
      console.log("[POST Payment Info] Unsetting other defaults for user:", userId);
      const snapshot = await adminFirestore()
        .collection("paymentInfo")
        .where("userId", "==", userId)
        .where("isDefault", "==", true)
        .get();

      const batch = adminFirestore().batch();
      snapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { isDefault: false });
      });
      await batch.commit();
      console.log("[POST Payment Info] Unset", snapshot.size, "defaults");
    }

    const now = new Date().toISOString();
    const paymentInfoData = {
      userId,
      name,
      firstName,
      lastName,
      address,
      phone,
      isDefault: isDefault || false,
      createdAt: now,
      updatedAt: now,
    };

    console.log("[POST Payment Info] Saving to Firestore:", paymentInfoData);

    const docRef = await adminFirestore()
      .collection("paymentInfo")
      .add(paymentInfoData);

    console.log("[POST Payment Info] Saved with ID:", docRef.id);

    const savedPaymentInfo: SavedPaymentInfo = {
      id: docRef.id,
      ...paymentInfoData,
    };

    return NextResponse.json(savedPaymentInfo, { status: 201 });
  } catch (error) {
    console.error("[POST Payment Info] Error:", error);
    return NextResponse.json(
      { message: "Failed to save payment information" },
      { status: 500 }
    );
  }
}
