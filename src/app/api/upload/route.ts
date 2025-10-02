import { NextResponse } from "next/server";
import { adminStorage } from "../../lib/firebaseAdmin";

/**
 * POST /api/upload - Upload image to Firebase Storage
 */
export async function POST(request: Request) {
  try {
    console.log("[Upload API] Starting upload process");
    
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      console.log("[Upload API] No file provided");
      return NextResponse.json({ message: "ไม่พบไฟล์" }, { status: 400 });
    }

    console.log("[Upload API] File received:", file.name, file.type, file.size);

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

    console.log("[Upload API] Generated filename:", filename);

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log("[Upload API] File converted to buffer, size:", buffer.length);

    // Upload to Firebase Storage
    try {
      const bucket = adminStorage().bucket();
      console.log("[Upload API] Storage bucket:", bucket.name);
      
      const fileRef = bucket.file(filename);
      
      await fileRef.save(buffer, {
        metadata: {
          contentType: file.type,
        },
      });

      console.log("[Upload API] File saved to storage");

      // Make the file publicly accessible
      await fileRef.makePublic();

      console.log("[Upload API] File made public");

      // Get public URL
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

      console.log("[Upload API] Public URL:", publicUrl);

      return NextResponse.json({ 
        url: publicUrl,
        message: "อัปโหลดรูปภาพสำเร็จ" 
      });
    } catch (storageError) {
      console.error("[Upload API] Storage Error:", storageError);
      throw storageError;
    }
  } catch (error) {
    console.error("[Upload API] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[Upload API] Error message:", errorMessage);
    return NextResponse.json(
      { 
        message: "ไม่สามารถอัปโหลดรูปภาพได้",
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}
