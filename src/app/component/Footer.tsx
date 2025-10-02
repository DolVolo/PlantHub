export function Footer() {
  return (
    <footer className="mt-16 border-t border-emerald-100 bg-white py-10 text-sm text-emerald-700">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-emerald-800">PlantHub</h3>
          <p className="mt-2 max-w-sm text-emerald-700/80">
            ศูนย์รวมต้นไม้พรีเมียมสำหรับนักสะสมและคนรักสวน ปลูกง่าย ส่งเร็ว พร้อมดูแลทุกขั้นตอนตั้งแต่เลือกจนถึงจัดส่งถึงมือคุณ
          </p>
        </div>
        <div className="flex gap-12">
          <div className="space-y-2">
            <p className="font-medium text-emerald-800">บริการลูกค้า</p>
            <ul className="space-y-2 text-emerald-700/80">
              <li>ศูนย์ช่วยเหลือ</li>
              <li>การติดตามสินค้า</li>
              <li>นโยบายการคืนสินค้า</li>
            </ul>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-emerald-800">สำหรับผู้ขาย</p>
            <ul className="space-y-2 text-emerald-700/80">
              <li>สมัครเปิดร้าน</li>
              <li>คู่มือการใช้งาน</li>
              <li>จัดการสต็อก</li>
            </ul>
          </div>
        </div>
      </div>
      <p className="mt-8 text-center text-xs text-emerald-600/70">© {new Date().getFullYear()} PlantHub. All rights reserved.</p>
    </footer>
  );
}
