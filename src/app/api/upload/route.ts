import { NextResponse } from "next/server";
import { adminStorage } from "../../lib/firebaseAdmin";

/**
 * POST /api/upload - Upload image to Firebase Storage
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ message: "ไม่พบไฟล์" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ message: "ไฟล์ต้องเป็นรูปภาพเท่านั้น" }, { status: 400 });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ message: "ไฟล์ต้องมีขนาดไม่เกิน 5MB" }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split(".").pop();
    const filename = `products/${timestamp}-${randomString}.${extension}`;

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Firebase Storage
    const bucket = adminStorage().bucket();
    const fileRef = bucket.file(filename);
    
    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    });

    // Make the file publicly accessible
    await fileRef.makePublic();

    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

    return NextResponse.json({ 
      url: publicUrl,
      message: "อัปโหลดรูปภาพสำเร็จ" 
    });
  } catch (error) {
    console.error("[Upload API] Error:", error);
    return NextResponse.json(
      { message: "ไม่สามารถอัปโหลดรูปภาพได้" },
      { status: 500 }
    );
  }
}
