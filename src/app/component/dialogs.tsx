"use client";

import Link from "next/link";

interface BaseDialogProps {
  onClose: () => void;
}

export function LoginDialog({ onClose }: BaseDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-emerald-900">กรุณาเข้าสู่ระบบ</h2>
        <p className="mt-2 text-sm text-emerald-900/80">
          คุณต้องเข้าสู่ระบบก่อนจึงจะสามารถเพิ่มสินค้าในตะกร้าได้
        </p>
        <div className="mt-6 flex justify-end gap-3 text-sm">
          <button
            onClick={onClose}
            className="rounded-full border border-emerald-200 px-4 py-2 text-emerald-700 transition hover:bg-emerald-50"
          >
            ปิด
          </button>
          <Link
            href="/login"
            className="rounded-full bg-emerald-500 px-4 py-2 font-medium text-white shadow-sm transition hover:bg-emerald-600"
            onClick={onClose}
          >
            ไปหน้าเข้าสู่ระบบ
          </Link>
        </div>
      </div>
    </div>
  );
}
