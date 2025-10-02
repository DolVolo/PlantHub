import { NextResponse } from "next/server";
import { adminFirestore } from "../../../lib/firebaseAdmin";
import type { AuthUser } from "@/app/types";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    if (!id) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    // Fetch user from Firestore
    const userDoc = await adminFirestore().collection("users").doc(id).get();
    
    if (!userDoc.exists) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const user: AuthUser = {
      id: userDoc.id,
      email: userData?.email || "",
      name: userData?.name || "User",
      role: userData?.role || "buyer",
    };

    return NextResponse.json(user);
  } catch (error) {
    console.error("[GET User] Error:", error);
    return NextResponse.json(
      { message: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
