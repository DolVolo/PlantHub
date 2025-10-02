## PlantHub 🌱

PlantHub คือแพลตฟอร์มอีคอมเมิร์ซสำหรับซื้อ-ขายต้นไม้ คุณสามารถเลือกต้นไม้จากร้านค้าที่คัดสรร แสดงรายละเอียดสินค้า เพิ่มลงตะกร้า กรอกฟอร์มชำระเงิน และเปิดร้านขายของคุณเองได้ภายในระบบเดียว โดยระบบดึงข้อมูลผ่าน Next.js API + Zustand store + Firebase (Firestore + Authentication) ทำให้การอัปเดตสินค้าและตะกร้าเป็นแบบเรียลไทม์

### ฟีเจอร์หลัก

- 🏠 **หน้าหลัก**: ค้นหาและกรองต้นไม้ตามคีย์เวิร์ด ประเภท และระดับการดูแล พร้อมการ์ดสินค้าแบบ Amazon/Shopee
- 🌳 **หน้ารายละเอียดสินค้า**: แสดงข้อมูลครบถ้วน ราคา สต็อก รีวิว ตัวเลือกการจัดส่ง และปุ่มเพิ่มลงตะกร้า (ต้องเข้าสู่ระบบก่อน)
- 🛒 **ตะกร้าสินค้า & ชำระเงิน**: ตรวจสอบคำสั่งซื้อและกรอกฟอร์มข้อมูลลูกค้าพร้อมช่องทางการชำระเงินภาษาไทยครบถ้วน
- 👤 **บัญชีผู้ใช้ครบวงจร**: สมัครสมาชิก, เข้าสู่ระบบ, ขอรีเซ็ตรหัสผ่าน, ตั้งรหัสผ่านใหม่ (รองรับ Firebase Auth + custom email)
- 🧑‍🌾 **แดชบอร์ดผู้ขาย**: ผู้ใช้ที่ล็อกอินสามารถเพิ่มสินค้าใหม่ ปรับสต็อก และดูภาพรวมร้านได้
- 🔥 **Firebase Integration**: ใช้ Firestore เก็บข้อมูลสินค้าและผู้ใช้ + Firebase Auth สำหรับล็อกอิน/สมัครสมาชิก
- 🚦 **Rate Limiting**: ป้องกันการ abuse forgot-password endpoint (in-memory, best-effort)

### โครงสร้างโค้ด

- `src/app/page.tsx` — หน้าโฮมพร้อมแถบค้นหาและกรอง รวมการ์ดสินค้า ใช้ข้อมูลจาก Zustand store
- `src/app/product/[slug]/page.tsx` — หน้ารายละเอียดสินค้าแต่ละรายการ ตรวจสอบสถานะโหลด/ข้อผิดพลาดก่อนแสดงผล
- `src/app/cart/page.tsx` & `src/app/checkout/page.tsx` — การจัดการตะกร้าและฟอร์มชำระเงิน พร้อมป้องกันกรณีข้อมูลสินค้าไม่พร้อมใช้งาน
- `src/app/(user)/login/page.tsx` — แบบฟอร์มเข้าสู่ระบบ เรียก Firebase Auth client SDK
- `src/app/(user)/register/page.tsx` — สมัครสมาชิกใหม่ เลือกบทบาทผู้ซื้อหรือผู้ขาย และเรียก API `/api/auth/register` (สร้าง Firebase Auth user + Firestore profile)
- `src/app/(user)/forgot-password/page.tsx` — ขอรีเซ็ตรหัสผ่าน ใช้ Firebase Auth `sendPasswordResetEmail` (ถ้ามี Firebase) หรือ custom token
- `src/app/(user)/reset-password/page.tsx` — ตั้งรหัสผ่านใหม่ด้วยโทเค็น (custom flow สำหรับ non-Firebase)
- `src/app/(admin)/dashboard/page.tsx` — แดชบอร์ดจัดการร้านสำหรับผู้ขาย เพิ่มสินค้าใหม่ผ่าน API `/api/products`
- `src/app/store` — Zustand stores + hooks (สินค้า, ตะกร้า, ผู้ใช้) เชื่อมต่อ Axios, Firebase Auth และ LocalStorage
- `src/app/api` — Next.js Route Handlers สำหรับสินค้า (`/api/products`, `/api/products/seed`) และระบบสมาชิก (`/api/auth/*`)
- `src/app/api/auth/firebase-auth.ts` — Firebase Admin SDK helpers (สร้าง/ตรวจสอบผู้ใช้ใน Firestore)
- `src/app/api/products/firestore-products.ts` — Firestore helpers (CRUD operations สำหรับสินค้า)
- `src/app/lib/firebaseClient.ts` — Firebase client SDK initialization (สำหรับ browser)
- `src/app/lib/firebaseAdmin.ts` — Firebase Admin SDK initialization (สำหรับ API routes)
- `src/app/component` — ส่วนประกอบ UI เช่น Header, FilterBar, ProductCard, Dialogs, Footer
- `src/app/data/products.ts` — ข้อมูลต้นไม้เริ่มต้นที่ใช้ seed ให้ Firestore (ใช้เฉพาะฝั่งเซิร์ฟเวอร์)

### การเริ่มต้นใช้งาน

#### 1. ติดตั้ง Dependencies

```bash
npm install
```

#### 2. ตั้งค่า Firebase (สำคัญ!)

**อ่านเอกสารโดยละเอียดที่**: [FIREBASE_MIGRATION.md](./FIREBASE_MIGRATION.md)

สรุปขั้นตอน:
1. สร้างโปรเจกต์ใน [Firebase Console](https://console.firebase.google.com/)
2. เปิดใช้งาน **Authentication** (Email/Password)
3. เปิดใช้งาน **Firestore Database** (production mode)
4. คัดลอกค่า config มาใส่ใน `.env.local`:

```env
# Firebase Client (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Firebase Admin (Secret - Server only)
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'

# SMTP (Optional - for custom password reset emails)
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-app-password
```

#### 3. รันในโหมด Development

```bash
npm run dev
```

เปิดเบราว์เซอร์ที่ [http://localhost:3000](http://localhost:3000)

#### 4. Seed ข้อมูลสินค้าเริ่มต้น (ครั้งแรกเท่านั้น)

```bash
curl -X POST http://localhost:3000/api/products/seed
```

หรือเปิด URL ใน Browser: [http://localhost:3000/api/products/seed](http://localhost:3000/api/products/seed)

---

### 🚀 การ Deploy บน Vercel + Firebase

#### ขั้นตอนที่ 1: เตรียมโค้ด

```bash
git add .
git commit -m "feat: Firebase integration ready"
git push origin master
```

#### ขั้นตอนที่ 2: ตั้งค่า Environment Variables ใน Vercel

1. เข้า [Vercel Dashboard](https://vercel.com/dashboard)
2. เลือกโปรเจกต์ PlantHub
3. ไปที่ **Settings** → **Environment Variables**
4. เพิ่มตัวแปรต่อไปนี้:

**Production + Preview:**
```
NEXT_PUBLIC_APP_URL=https://plant-hub-1kbf.vercel.app
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
```

> ⚠️ **สำคัญ**: `FIREBASE_PRIVATE_KEY` ต้องมี `\n` character ให้ครบ และครอบด้วย `"` quotes

#### ขั้นตอนที่ 3: Redeploy

Vercel จะ auto-deploy เมื่อ push ใหม่ หรือกด **Redeploy** ใน Dashboard

#### ขั้นตอนที่ 4: Seed ข้อมูลสินค้าใน Production

```bash
curl -X POST https://plant-hub-1kbf.vercel.app/api/products/seed
```

#### ขั้นตอนที่ 5: ตรวจสอบผู้ใช้ใน Firebase Console

1. ไปที่ [Firebase Console](https://console.firebase.google.com/)
2. เลือกโปรเจกต์ของคุณ
3. ไปที่ **Authentication** → **Users** tab → จะเห็นรายชื่อผู้ใช้ที่สมัครแล้ว
4. ไปที่ **Firestore Database** → เลือก collection `users` หรือ `products` → เห็นข้อมูลแบบละเอียด

---

### 📋 การตรวจสอบว่าใช้งาน Firebase หรือไม่

ระบบจะใช้ Firebase อัตโนมัติเมื่อตั้งค่า `NEXT_PUBLIC_FIREBASE_PROJECT_ID` ใน environment variables

- **มี Firebase**: ใช้ Firebase Auth + Firestore
- **ไม่มี Firebase**: ใช้ in-memory storage (สำหรับทดสอบ local)

ดูได้จาก console logs:
- `[Auth] Firebase sign-in success: xxx` = ใช้ Firebase Auth
- `[Register] Firebase user created: xxx` = ใช้ Firebase Auth + Firestore
- `[Register] In-memory user created: xxx` = ใช้ in-memory fallback

---

### 🔒 Firestore Security Rules

ต้องตั้งค่า security rules ใน Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    // Products: public read, seller write
    match /products/{productId} {
      allow read: if true;
      allow create: if isSignedIn() && 
                       request.auth.token.role == 'seller' &&
                       request.resource.data.sellerId == request.auth.uid;
      allow update, delete: if isSignedIn() && 
                               resource.data.sellerId == request.auth.uid;
    }
    
    // Users: owner only
    match /users/{userId} {
      allow read, write: if isOwner(userId);
    }
  }
}
```

---

### 📚 เอกสารเพิ่มเติม

- [FIREBASE_MIGRATION.md](./FIREBASE_MIGRATION.md) - คู่มือละเอียดการย้ายไป Firebase
- [Firebase Console](https://console.firebase.google.com/) - จัดการ Authentication & Firestore
- [Vercel Dashboard](https://vercel.com/dashboard) - จัดการ deployment

---

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
