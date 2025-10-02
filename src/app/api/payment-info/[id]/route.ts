import { NextResponse } from "next/server";
import { adminFirestore } from "../../../lib/firebaseAdmin";
import type { SavedPaymentInfo } from "@/app/types";

// PUT: Update saved payment info
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { name, firstName, lastName, address, phone, isDefault, userId } = body;

    if (!id) {
      return NextResponse.json(
        { message: "Payment info ID is required" },
        { status: 400 }
      );
    }

    // If this is set as default, unset all other defaults for this user
    if (isDefault && userId) {
      const snapshot = await adminFirestore()
        .collection("paymentInfo")
        .where("userId", "==", userId)
        .where("isDefault", "==", true)
        .get();

      const batch = adminFirestore().batch();
      snapshot.docs.forEach((doc) => {
        if (doc.id !== id) {
          batch.update(doc.ref, { isDefault: false });
        }
      });
      await batch.commit();
    }

    const updateData: Partial<SavedPaymentInfo> = {
      updatedAt: new Date().toISOString(),
    };

    if (name !== undefined) updateData.name = name;
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (address !== undefined) updateData.address = address;
    if (phone !== undefined) updateData.phone = phone;
    if (isDefault !== undefined) updateData.isDefault = isDefault;

    await adminFirestore()
      .collection("paymentInfo")
      .doc(id)
      .update(updateData);

    const updatedDoc = await adminFirestore()
      .collection("paymentInfo")
      .doc(id)
      .get();

    const savedPaymentInfo: SavedPaymentInfo = {
      id: updatedDoc.id,
      ...updatedDoc.data(),
    } as SavedPaymentInfo;

    return NextResponse.json(savedPaymentInfo);
  } catch (error) {
    console.error("[PUT Payment Info] Error:", error);
    return NextResponse.json(
      { message: "Failed to update payment information" },
      { status: 500 }
    );
  }
}

// DELETE: Delete saved payment info
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { message: "Payment info ID is required" },
        { status: 400 }
      );
    }

    await adminFirestore()
      .collection("paymentInfo")
      .doc(id)
      .delete();

    return NextResponse.json(
      { message: "Payment information deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[DELETE Payment Info] Error:", error);
    return NextResponse.json(
      { message: "Failed to delete payment information" },
      { status: 500 }
    );
  }
}
