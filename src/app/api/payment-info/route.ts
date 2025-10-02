import { NextResponse } from "next/server";
import { adminFirestore } from "../../lib/firebaseAdmin";
import type { SavedPaymentInfo } from "@/app/types";

// GET: Fetch all saved payment info for a user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    const snapshot = await adminFirestore()
      .collection("paymentInfo")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    const paymentInfoList: SavedPaymentInfo[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as SavedPaymentInfo[];

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

    if (!userId || !name || !firstName || !lastName || !address || !phone) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // If this is set as default, unset all other defaults for this user
    if (isDefault) {
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

    const docRef = await adminFirestore()
      .collection("paymentInfo")
      .add(paymentInfoData);

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
