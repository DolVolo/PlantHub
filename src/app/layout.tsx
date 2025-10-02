import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "./component/Header";
import { Footer } from "./component/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | PlantHub",
    default: "PlantHub - สวนออนไลน์สำหรับคนรักต้นไม้",
  },
  description:
    "PlantHub ร้านค้าออนไลน์สำหรับต้นไม้พรีเมียม รวมร้านค้าคุณภาพ ดูรายละเอียดต้นไม้ เพิ่มลงตะกร้า และชำระเงินได้ในที่เดียว",
  keywords: [
    "PlantHub",
    "ซื้อต้นไม้",
    "ร้านต้นไม้",
    "ต้นไม้หายาก",
    "ต้นไม้ในร่ม",
    "บอนไซ",
  ],
  icons: {
    icon: [
      { url: "/image/icon.png?v=1", sizes: "32x32", type: "image/png" },
      { url: "/image/icon.png?v=1", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/image/icon.png?v=1",
    apple: "/image/icon.png?v=1",
  },
  openGraph: {
    title: "PlantHub - แพลตฟอร์มร้านค้าต้นไม้ครบวงจร",
    description:
      "เลือกซื้อต้นไม้จากผู้ขายที่คัดสรร ดูรายละเอียด ดูสต็อก และชำระเงินอย่างปลอดภัยบน PlantHub",
    url: "https://planthub.example.com",
    siteName: "PlantHub",
    locale: "th_TH",
    type: "website",
    images: [
      {
        url: "/image/icon.png?v=1",
        width: 512,
        height: 512,
        alt: "PlantHub logo",
      },
    ],
  },
  metadataBase: new URL("https://planthub.example.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <head>
        <link rel="icon" href="/image/icon.png?v=1" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/image/icon.png?v=1" />
        <link rel="icon" type="image/png" sizes="16x16" href="/image/icon.png?v=1" />
        <link rel="shortcut icon" href="/image/icon.png?v=1" />
        <link rel="apple-touch-icon" sizes="180x180" href="/image/icon.png?v=1" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-emerald-50 antialiased`}>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1 bg-gradient-to-b from-emerald-50 via-emerald-50 to-white">
            <div className="mx-auto w-full max-w-6xl px-6 py-10">{children}</div>
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
