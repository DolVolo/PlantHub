import { NextResponse } from "next/server";
import { adminFirestore, adminAuth } from "../../../../lib/firebaseAdmin";
import type { AuthUser } from "@/app/types";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { name, profileImageUrl } = body;

    if (!id) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { message: "Name is required" },
        { status: 400 }
      );
    }

    // Update Firestore user document
    const updateData: Record<string, unknown> = {
      name: name.trim(),
      updatedAt: new Date().toISOString(),
    };

    if (profileImageUrl !== undefined) {
      updateData.profileImageUrl = profileImageUrl;
    }

    await adminFirestore().collection("users").doc(id).update(updateData);

    // Update Firebase Auth display name
    try {
      await adminAuth().updateUser(id, {
        displayName: name.trim(),
        ...(profileImageUrl && { photoURL: profileImageUrl }),
      });
    } catch (authError) {
      console.warn("[Update User] Failed to update Firebase Auth:", authError);
      // Continue even if Auth update fails
    }

    // Fetch updated user
    const userDoc = await adminFirestore().collection("users").doc(id).get();
    const userData = userDoc.data();

    const user: AuthUser = {
      id: userDoc.id,
      email: userData?.email || "",
      name: userData?.name || "User",
      role: userData?.role || "buyer",
    };

    return NextResponse.json(user);
  } catch (error) {
    console.error("[Update User] Error:", error);
    return NextResponse.json(
      { message: "Failed to update user profile" },
      { status: 500 }
    );
  }
}
