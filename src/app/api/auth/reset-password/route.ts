import { NextResponse } from "next/server";
import { resetPasswordWithToken } from "../users-store";

export async function POST(request: Request) {
  const { token, newPassword } = (await request.json()) as { token?: string; newPassword?: string };

  if (!token || !newPassword) {
    return NextResponse.json({ message: "กรุณาระบุโทเค็นและรหัสผ่านใหม่" }, { status: 400 });
  }

  if (newPassword.length < 8) {
    return NextResponse.json({ message: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" }, { status: 400 });
  }

  const user = resetPasswordWithToken(token, newPassword);
  if (!user) {
    return NextResponse.json({ message: "โทเค็นไม่ถูกต้องหรือหมดอายุ" }, { status: 400 });
  }

  return NextResponse.json({ message: "รีเซ็ตรหัสผ่านเรียบร้อย", user }, { status: 200 });
}
