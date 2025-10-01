## PlantHub 🌱

PlantHub คือแพลตฟอร์มอีคอมเมิร์ซสำหรับซื้อ-ขายต้นไม้ คุณสามารถเลือกต้นไม้จากร้านค้าที่คัดสรร แสดงรายละเอียดสินค้า เพิ่มลงตะกร้า กรอกฟอร์มชำระเงิน และเปิดร้านขายของคุณเองได้ภายในระบบเดียว โดยระบบดึงข้อมูลผ่าน Next.js API + Zustand store ทำให้การอัปเดตสินค้าและตะกร้าเป็นแบบเรียลไทม์

### ฟีเจอร์หลัก

- 🏠 **หน้าหลัก**: ค้นหาและกรองต้นไม้ตามคีย์เวิร์ด ประเภท และระดับการดูแล พร้อมการ์ดสินค้าแบบ Amazon/Shopee
- 🌳 **หน้ารายละเอียดสินค้า**: แสดงข้อมูลครบถ้วน ราคา สต็อก รีวิว ตัวเลือกการจัดส่ง และปุ่มเพิ่มลงตะกร้า (ต้องเข้าสู่ระบบก่อน)
- 🛒 **ตะกร้าสินค้า & ชำระเงิน**: ตรวจสอบคำสั่งซื้อและกรอกฟอร์มข้อมูลลูกค้าพร้อมช่องทางการชำระเงินภาษาไทยครบถ้วน
- 👤 **บัญชีผู้ใช้ครบวงจร**: สมัครสมาชิก, เข้าสู่ระบบ, ขอรีเซ็ตรหัสผ่าน, ตั้งรหัสผ่านใหม่
- 🧑‍🌾 **แดชบอร์ดผู้ขาย**: ผู้ใช้ที่ล็อกอินสามารถเพิ่มสินค้าใหม่ ปรับสต็อก และดูภาพรวมร้านได้

### โครงสร้างโค้ด

- `src/app/page.tsx` — หน้าโฮมพร้อมแถบค้นหาและกรอง รวมการ์ดสินค้า ใช้ข้อมูลจาก Zustand store
- `src/app/product/[slug]/page.tsx` — หน้ารายละเอียดสินค้าแต่ละรายการ ตรวจสอบสถานะโหลด/ข้อผิดพลาดก่อนแสดงผล
- `src/app/cart/page.tsx` & `src/app/checkout/page.tsx` — การจัดการตะกร้าและฟอร์มชำระเงิน พร้อมป้องกันกรณีข้อมูลสินค้าไม่พร้อมใช้งาน
- `src/app/(user)/login/page.tsx` — แบบฟอร์มเข้าสู่ระบบ เรียก API `/api/auth/login`
- `src/app/(user)/register/page.tsx` — สมัครสมาชิกใหม่ เลือกบทบาทผู้ซื้อหรือผู้ขาย และเรียก API `/api/auth/register`
- `src/app/(user)/forgot-password/page.tsx` — ขอรีเซ็ตรหัสผ่าน แสดงโทเค็นตัวอย่างจาก API `/api/auth/forgot-password`
- `src/app/(user)/reset-password/page.tsx` — ตั้งรหัสผ่านใหม่ด้วยโทเค็น ผ่าน API `/api/auth/reset-password`
- `src/app/(admin)/dashboard/page.tsx` — แดชบอร์ดจัดการร้านสำหรับผู้ขาย เพิ่มสินค้าใหม่ผ่าน API `/api/products`
- `src/app/store` — Zustand stores + hooks (สินค้า, ตะกร้า, ผู้ใช้) เชื่อมต่อ Axios และ LocalStorage
- `src/app/api` — Next.js Route Handlers สำหรับสินค้า (`/api/products`) และระบบสมาชิก (`/api/auth/*`)
- `src/app/component` — ส่วนประกอบ UI เช่น Header, FilterBar, ProductCard, Dialogs, Footer
- `src/app/data/products.ts` — ข้อมูลต้นไม้เริ่มต้นที่ใช้ seed ให้ API (ใช้เฉพาะฝั่งเซิร์ฟเวอร์)

### การเริ่มต้นใช้งาน

```bash
npm install
npm run dev
```

เปิดเบราว์เซอร์ที่ [http://localhost:3000](http://localhost:3000) เพื่อดูหน้าเว็บ

#### การตั้งค่าอีเมลสำหรับลิงก์รีเซ็ตรหัสผ่าน

สร้างไฟล์ `.env.local` แล้วกำหนดค่าตามตัวอย่าง (รองรับ Gmail App Password):

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-app-password
# หากใช้เซิร์ฟเวอร์อื่น ปรับค่าดังนี้
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=465
# SMTP_SECURE=true
```

> หมายเหตุ: หากไม่ระบุ `SMTP_USER/SMTP_PASS` ระบบจะยังสร้างโทเค็นและแสดงบนหน้าจอ แต่จะไม่ส่งอีเมลออกไป

### หมายเหตุ

- โปรเจกต์นี้ใช้ Next.js App Router + Tailwind CSS (ผ่าน `@import "tailwindcss";` ใน `globals.css`)
- รูปสินค้านำมาจาก Unsplash และถูกอนุญาตไว้ใน `next.config.ts`
- สถานะผู้ใช้ สินค้า และตะกร้าถูกจัดการด้วย Zustand + Axios ซึ่งคุยกับ Next.js API Routes ในโปรเจกต์ หากต้องการใช้งานจริงควรเชื่อมต่อฐานข้อมูลและระบบยืนยันตัวตนที่ปลอดภัย

### อธิบายโค้ดแบบละเอียด (ภาษาไทย)

| ส่วนประกอบ | ไฟล์ | อธิบายการทำงาน |
| --- | --- | --- |
| Zustand Store สินค้า | `src/app/store/useProductStore.ts` | จัดการสถานะสินค้าด้วย Zustand มีสถานะ `status` บอกการโหลด, ดึงข้อมูลผ่าน `axios.get("/api/products")`, เพิ่มสินค้าใหม่ผ่าน `axios.post`, และให้ฟังก์ชัน `getProductBySlug` สำหรับหน้าแสดงรายละเอียด |
| Hook สินค้า | `src/app/hooks/useProducts.ts` | ครอบ Store เพื่อใช้งานในคอมโพเนนต์ ฝัง `useEffect` ให้โหลดสินค้าทันทีเมื่อ Store ยังเป็น `idle` และคืนค่าฟังก์ชัน CRUD พร้อมสถานะ |
| Zustand Store ตะกร้า | `src/app/store/useBasketStore.ts` | เก็บสินค้าในตะกร้า แยกตาม `productId`, บันทึกลง LocalStorage, มีฟังก์ชัน `addItem`, `removeItem`, `updateQuantity`, `clearBasket`, และคำนวณ `subtotal` |
| Hook ตะกร้า | `src/app/hooks/useBasket.ts` | เชื่อมคอมโพเนนต์กับ Basket store พร้อม hydrate จาก LocalStorage เมื่อหน้าโหลด |
| Zustand Store ผู้ใช้ | `src/app/store/useAuthStore.ts` | จัดการข้อมูลผู้ใช้ ปรับสถานะโหลด/สำเร็จ/ข้อผิดพลาด เรียก API `login`/`register` ผ่าน Axios และบันทึก token ลง LocalStorage |
| Hook ผู้ใช้ | `src/app/hooks/useAuth.ts` | ห่อ Store ให้ใช้ง่ายในคอมโพเนนต์ พร้อม auto-hydrate token เมื่อโหลดหน้า |
| API รายการสินค้า | `src/app/api/products/route.ts` | Route handler ของ Next.js ที่ตอบกลับ `GET` ด้วยสินค้าตัวอย่าง และรับ `POST` เพื่อบันทึกสินค้าจากผู้ขายใหม่ (จัดเก็บชั่วคราวในหน่วยความจำ) |
| API ระบบสมาชิก | `src/app/api/auth/login/route.ts`, `src/app/api/auth/register/route.ts` | จำลองระบบล็อกอิน/สร้างบัญชี บันทึกข้อมูลผู้ใช้ไว้ในหน่วยความจำ (`users-store.ts`) และคืน token หลอก เพื่อใช้กับ Zustand Auth store |
| API รีเซ็ตรหัสผ่าน | `src/app/api/auth/forgot-password/route.ts`, `src/app/api/auth/reset-password/route.ts` | สร้างโทเค็นตั้งรหัสผ่านใหม่ (จำกัดเวลา 15 นาที) และอัปเดตรหัสผ่านใน store ชั่วคราว พร้อม log โทเค็นในคอนโซลสำหรับเดโม |
| Mailer | `src/app/api/auth/mailer.ts` | จัดการการส่งอีเมลรีเซ็ตรหัสผ่านผ่าน SMTP/Gmail App Password พร้อม fallback หากยังไม่ได้ตั้งค่า |
| หน้าโฮม | `src/app/page.tsx` | ดึงสินค้าจาก `useProducts`, มีแถบค้นหา + ตัวกรอง + การ์ดสินค้า แสดง skeleton ระหว่างโหลด และปุ่มรีเฟรชเมื่อ error |
| หน้าแสดงสินค้า | `src/app/product/[slug]/page.tsx` | ใช้ `getProductBySlug`, แสดงสถานะโหลด/ไม่พบ/ข้อผิดพลาด พร้อมปุ่มเพิ่มลงตะกร้าหลังเข้าสู่ระบบ และคำนวณยอดรวมตามจำนวน |
| หน้าตะกร้า | `src/app/cart/page.tsx` | แสดงรายการสินค้าในตะกร้าพร้อมปรับจำนวน จำกัดตามสต็อกจริง และแสดงสถานะโหลด + ข้อผิดพลาดจาก store |
| หน้าชำระเงิน | `src/app/checkout/page.tsx` | ฟอร์มเก็บข้อมูลลูกค้า, อัปเดตค่าส่งตามจำนวน, แสดงผลรวมคำสั่งซื้อ, ป้องกันเมื่อสินค้าโหลดไม่สำเร็จ (แสดงปุ่มลองใหม่) |
| หน้าเข้าสู่ระบบ | `src/app/(user)/login/page.tsx` | ฟอร์มกรอกอีเมล/รหัสผ่าน ใช้ `useAuth` เพื่อเรียก API ล็อกอิน และจัดการข้อความผิดพลาด พร้อมลิงก์ไปสมัคร/ลืมรหัส |
| หน้าสมัครสมาชิก | `src/app/(user)/register/page.tsx` | รับข้อมูลผู้ใช้ใหม่ เลือกบทบาท buyer/seller และเรียก `register` จาก store เพื่อสมัครและเปลี่ยนเส้นทาง |
| หน้าลืมรหัสผ่าน | `src/app/(user)/forgot-password/page.tsx` | ส่งอีเมลไปยัง API ขอรีเซ็ต แสดงโทเค็นที่ได้สำหรับการทดสอบ และบอกเวลาหมดอายุ |
| หน้าตั้งรหัสผ่านใหม่ | `src/app/(user)/reset-password/page.tsx` | รับโทเค็นและรหัสผ่านใหม่ ตรวจสอบความถูกต้อง แล้วเรียก `resetPassword` เพื่ออัปเดตข้อมูลก่อนเปลี่ยนเส้นทางเข้าสู่ระบบ |
| แดชบอร์ดผู้ขาย | `src/app/(admin)/dashboard/page.tsx` | เช็กสถานะผู้ใช้, แสดงข้อมูลร้าน, กรอกฟอร์มเพิ่มสินค้าใหม่ผ่าน API พร้อมแสดงสถานะโหลดและ error |
| Header & Footer | `src/app/component/Header.tsx`, `src/app/component/Footer.tsx` | Header แสดงสถานะล็อกอิน/จำนวนสินค้าในตะกร้า ปรับตาม Zustand; Footer ให้ข้อมูลติดต่อและลิงก์โซเชียล |
| การ์ดสินค้า & กริด | `src/app/component/ProductCard.tsx`, `src/app/component/ProductGrid.tsx` | แสดงข้อมูลสินค้าแบบการ์ดพร้อมปุ่มดูรายละเอียดและเพิ่มลงตะกร้า มี state แสดงระหว่างโหลด |
| Dialogs | `src/app/component/dialogs.tsx` | รวมคอมโพเนนต์ Dialog เช่น `LoginDialog` สำหรับบังคับเข้าสู่ระบบก่อนทำรายการ |
| สไตล์หลัก | `src/app/globals.css` | กำหนด Tailwind base + ฟอนต์ + พื้นหลัง gradient ให้บรรยากาศสวนพฤกษา |
