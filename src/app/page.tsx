'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sprout,
  Sparkles,
  Users,
  LogIn,
  Store,
  UserCircle,
  ShoppingCart,
  ChevronDown,
  Package,
  LogOut,
  Shield,
} from "lucide-react";
import { onValue, ref } from "firebase/database";

import { useAuthContext } from "./providers/AuthProvider";
import { useCartStore } from "../store/cartStore";
import { realtimeDb } from "@/lib/firebaseClient";

type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  stock: number;
  description: string;
  sellerId?: string;
  active?: boolean;
};

export default function Home() {
  const router = useRouter();
  const { profile, signOut: signOutUser } = useAuthContext();
  const addToCart = useCartStore((state) => state.addItem);
  const itemCount = useCartStore((state) => state.itemCount);
  const [query, setQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [products, setProducts] = useState<Record<string, Product>>({});

  useEffect(() => {
    const productsRef = ref(realtimeDb, "products");
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const value = snapshot.val() ?? {};
      setProducts(value);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      window.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [profile]);

  const goTo = (path: string) => {
    setIsMenuOpen(false);
    router.push(path);
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setIsMenuOpen(false);
      router.push("/");
    } catch (error) {
      console.error("Failed to sign out", error);
    }
  };

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const items = Object.entries(products)
      .map(([id, product]) => ({ ...product, id }))
      .filter((product) => product.active !== false);

    if (!normalized) {
      return items;
    }

    return items.filter((product) => product.name.toLowerCase().includes(normalized));
  }, [products, query]);

  return (
    <div className="min-h-screen bg-emerald-50 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-emerald-100 bg-white/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-lime-400 text-white font-semibold">
              PH
            </span>
            <span className="text-2xl font-bold tracking-tight text-emerald-700">PlantHub</span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <Link href="#featured" className="flex items-center gap-2 transition hover:text-emerald-600">
              <Sprout className="h-4 w-4" /> สินค้าแนะนำ
            </Link>
            <Link href="#benefits" className="flex items-center gap-2 transition hover:text-emerald-600">
              <Sparkles className="h-4 w-4" /> จุดเด่น
            </Link>
            <Link href="#community" className="flex items-center gap-2 transition hover:text-emerald-600">
              <Users className="h-4 w-4" /> คอมมูนิตี้
            </Link>

            <div className="ml-4 flex items-center gap-3">
              <Link
                href="/cart"
                className="relative inline-flex items-center justify-center rounded-full border border-emerald-600 p-2 text-emerald-700 transition hover:bg-emerald-600 hover:text-white"
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-xs font-semibold text-white">
                    {itemCount}
                  </span>
                )}
              </Link>
              {profile ? (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setIsMenuOpen((prev) => !prev)}
                    className="inline-flex items-center gap-2 rounded-full border border-emerald-600 px-5 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-600 hover:text-white"
                  >
                    <UserCircle className="h-4 w-4" /> สวัสดี {profile.firstName}
                    <ChevronDown className={`h-4 w-4 transition ${isMenuOpen ? "rotate-180" : "rotate-0"}`} />
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-emerald-100 bg-white p-2 text-sm shadow-2xl">
                      <button
                        onClick={() => goTo("/profile")}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        <UserCircle className="h-4 w-4" /> โปรไฟล์ของฉัน
                      </button>
                      <button
                        onClick={() => goTo("/orders")}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        <Package className="h-4 w-4" /> คำสั่งซื้อของฉัน
                      </button>
                      {profile.role === "seller" && (
                        <button
                          onClick={() => goTo("/my-shop")}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700"
                        >
                          <Store className="h-4 w-4" /> ร้านของฉัน
                        </button>
                      )}
                      {profile.role === "admin" && (
                        <>
                          <div className="my-2 h-px bg-slate-200" />
                          <button
                            onClick={() => goTo("/admin/dashboard")}
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-slate-800 transition hover:bg-slate-50 hover:text-slate-900"
                          >
                            <Shield className="h-4 w-4" /> แอดมิน
                          </button>
                        </>
                      )}
                      <div className="my-2 h-px bg-emerald-100" />
                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-rose-500 transition hover:bg-rose-50"
                      >
                        <LogOut className="h-4 w-4" /> ออกจากระบบ
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 rounded-full border border-emerald-600 px-5 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-600 hover:text-white"
                  >
                    <Store className="h-4 w-4" /> สมัครสมาชิกร้านค้า
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-emerald-500 to-lime-400 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:brightness-110"
                  >
                    <LogIn className="h-4 w-4" /> เข้าสู่ระบบ
                  </Link>
                </>
              )}
            </div>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/cart"
              className="hidden items-center gap-2 rounded-full border border-emerald-300 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 md:inline-flex"
            >
              <ShoppingCart className="h-4 w-4" /> ตะกร้า
            </Link>
            <button className="inline-flex items-center gap-2 rounded-full border border-emerald-200 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 md:hidden">
              เมนู
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-500 to-lime-400 pb-24 pt-20 text-white">
          <div className="absolute inset-0 opacity-20 mix-blend-soft-light" aria-hidden>
            <div className="absolute -left-10 top-12 h-40 w-40 rounded-full border border-white/40" />
            <div className="absolute -right-10 bottom-10 h-56 w-56 rounded-full border border-white/20" />
          </div>

          <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 md:flex-row md:items-center">
            <div className="max-w-xl space-y-6">
              <p className="inline-flex items-center rounded-full bg-white/10 px-4 py-1 text-sm font-medium tracking-wide text-white/90 backdrop-blur">
                🌿 ตลาดออนไลน์สำหรับคนรักต้นไม้
              </p>
              <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl md:text-6xl">
                ยินดีต้อนรับสู่ PlantHub
              </h1>
              <p className="text-lg text-white/90 md:text-xl">
                เลือกชมต้นไม้และดอกไม้ที่คัดสรรอย่างพิถีพิถัน พร้อมระบบจัดการร้านค้าสำหรับผู้ขาย และบริการจัดส่งทั่วประเทศ
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="#featured"
                  className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-base font-semibold text-emerald-600 shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-50"
                >
                  ค้นหาต้นไม้ที่ชอบ
                </Link>
                <Link
                  href="/my-shop"
                  className="inline-flex items-center justify-center rounded-full bg-transparent px-6 py-3 text-base font-semibold text-white backdrop-blur transition hover:bg-white/15"
                >
                  เปิดร้านกับเรา
                </Link>
              </div>

              <dl className="grid grid-cols-2 gap-6 pt-4 sm:grid-cols-3">
                <div>
                  <dt className="text-sm text-white/60">พันธุ์ไม้ในคลัง</dt>
                  <dd className="text-2xl font-bold">2,500+</dd>
                </div>
                <div>
                  <dt className="text-sm text-white/60">ร้านค้าพาร์ทเนอร์</dt>
                  <dd className="text-2xl font-bold">480+</dd>
                </div>
                <div>
                  <dt className="text-sm text-white/60">การสั่งซื้อสำเร็จ</dt>
                  <dd className="text-2xl font-bold">35k</dd>
                </div>
              </dl>
            </div>

            <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-3xl bg-white/10 backdrop-blur md:mx-0">
          <Image
                src="https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=900"
                alt="Greenhouse filled with plants"
                width={720}
                height={890}
                priority
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-6 bottom-6 rounded-2xl bg-white/90 p-4 text-emerald-700 shadow-xl">
                <p className="text-sm font-semibold uppercase tracking-wide text-emerald-500">
                  Plant of the week
                </p>
                <h3 className="text-lg font-bold">ฟิโลเดนดรอน บิรูซ่า</h3>
                <p className="text-sm text-emerald-600">
                  สีเขียวอมฟ้าสุดหายาก ช่วยฟอกอากาศและลดความเครียดภายในบ้าน
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="featured" className="mx-auto w-full max-w-6xl px-4 py-16">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                สินค้าแนะนำสำหรับคุณ
              </h2>
              <p className="mt-2 max-w-2xl text-lg text-slate-600">
                สำรวจพันธุ์ไม้ยอดนิยมที่ได้รับความนิยมสูงสุดจากคอมมูนิตี้ของเรา
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center rounded-full border border-emerald-600 px-5 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-600 hover:text-white"
            >
              ดูทั้งหมด
            </Link>
          </div>

          <div className="mt-10 flex flex-col gap-6">
            <label className="relative flex w-full items-center">
              <span className="absolute left-4 text-sm text-slate-400">🔍</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="ค้นหาต้นไม้ ดอกไม้ หรือชื่อร้าน..."
                className="w-full rounded-full border border-emerald-100 bg-white px-12 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
              />
            </label>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <article
                  key={product.id}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-60 overflow-hidden">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        width={540}
                        height={320}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-100">
                        <span className="text-slate-400">ไม่มีรูปภาพ</span>
                      </div>
                    )}
                    {product.stock === 0 ? (
                      <span className="absolute left-4 top-4 rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white">
                        สินค้าหมดชั่วคราว
                      </span>
                    ) : (
                      <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-emerald-700 shadow">
                        คงเหลือ {product.stock} ต้น
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-3 p-6">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
                      <p className="mt-1 text-sm text-slate-600">{product.description}</p>
                    </div>

                    <div className="mt-auto flex items-center justify-between">
                      <p className="text-xl font-bold text-emerald-600">
                        ฿{product.price.toLocaleString("th-TH")}
                      </p>
                      <button
                        onClick={() =>
                          addToCart({
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            stock: product.stock,
                            image: product.imageUrl,
                            sellerId: product.sellerId ?? "",
                          })
                        }
                        className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-500"
                        disabled={product.stock === 0}
                      >
                        เพิ่มลงตะกร้า
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="rounded-3xl border border-dashed border-emerald-200 bg-white py-16 text-center">
                <p className="text-lg font-medium text-slate-600">
                  ไม่พบสินค้าที่ตรงกับคำค้นหานี้ ลองใช้คำอื่นดูนะคะ 🌱
                </p>
              </div>
            )}
          </div>
        </section>

        <section id="benefits" className="bg-white py-16">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-4 md:grid-cols-3">
            <div className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-emerald-700">ระบบจัดส่งคุณภาพ</h3>
              <p className="mt-3 text-sm text-slate-600">
                บรรจุอย่างพิถีพิถันพร้อมอุปกรณ์ป้องกัน ผ่่านการรับรองจากผู้เชี่ยวชาญ เพื่อให้ต้นไม้ถึงมืออย่างสมบูรณ์แบบ
              </p>
            </div>
            <div className="rounded-3xl border border-emerald-100 bg-white p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-emerald-700">คอมมูนิตี้คนรักต้นไม้</h3>
              <p className="mt-3 text-sm text-slate-600">
                แชร์ประสบการณ์การปลูก ดูแล และแต่งบ้านกับผู้ใช้กว่า 50,000 คน พร้อมกิจกรรมออนไลน์ทุกเดือน
              </p>
            </div>
            <div className="rounded-3xl border border-emerald-100 bg-white p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-emerald-700">แดชบอร์ดสำหรับผู้ขาย</h3>
              <p className="mt-3 text-sm text-slate-600">
                บริหารจัดการสต็อก คำสั่งซื้อ และโปรโมชั่นได้ในที่เดียว พร้อมเครื่องมือการตลาดครบวงจร
              </p>
            </div>
          </div>
        </section>

        <section id="community" className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-500 py-20 text-white">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-8 px-4 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-white/70">PlantHub Community</p>
            <h2 className="max-w-3xl text-3xl font-bold leading-tight sm:text-4xl">
              ร่วมสร้างโลกที่เต็มไปด้วยพื้นที่สีเขียวไปกับเรา
            </h2>
            <p className="max-w-2xl text-lg text-white/90">
              เพียงสมัครสมาชิกวันนี้ รับทันทีคูปองส่วนลดสำหรับคำสั่งซื้อครั้งแรก พร้อมเข้าถึงเวิร์กช็อปออนไลน์และคำแนะนำจากผู้เชี่ยวชาญ
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-base font-semibold text-emerald-600 shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-50"
              >
                สมัครสมาชิก
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full border border-white/70 px-6 py-3 text-base font-semibold text-white transition hover:bg-white/15"
              >
                เข้าสู่ระบบ
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 py-8 text-slate-300">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 text-sm md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} PlantHub. สงวนลิขสิทธิ์.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/privacy" className="transition hover:text-white">
              นโยบายความเป็นส่วนตัว
            </Link>
            <Link href="/terms" className="transition hover:text-white">
              เงื่อนไขการใช้บริการ
            </Link>
            <Link href="mailto:support@planthub.com" className="transition hover:text-white">
              ติดต่อเรา
            </Link>
          </div>
        </div>
      </footer>
=======
"use client";

import { useMemo, useState } from "react";
import { FilterBar } from "./component/FilterBar";
import { ProductGrid } from "./component/ProductGrid";
import { useProducts } from "./hooks/useProducts";
import type { TreeProduct } from "./types";

function filterProducts(
  products: TreeProduct[],
  {
    keyword,
    category,
    careLevel,
    tags,
  }: {
    keyword: string;
    category: "all" | TreeProduct["category"];
    careLevel: "all" | TreeProduct["careLevel"];
    tags: string[];
  },
) {
  return products.filter((product) => {
    const keywordMatch = keyword
      ? [product.name, product.scientificName, product.description, product.tags.join(" ")]
          .join(" ")
          .toLowerCase()
          .includes(keyword.toLowerCase())
      : true;

    const categoryMatch = category === "all" ? true : product.category === category;

    const careMatch = careLevel === "all" ? true : product.careLevel === careLevel;

    const tagsMatch = tags.length === 0 ? true : tags.every((tag) => product.tags.includes(tag));

    return keywordMatch && categoryMatch && careMatch && tagsMatch;
  });
}

export default function Home() {
  const { products, status, error, fetchProducts } = useProducts();
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState<"all" | TreeProduct["category"]>("all");
  const [careLevel, setCareLevel] = useState<"all" | TreeProduct["careLevel"]>("all");
  const [tags, setTags] = useState<string[]>([]);

  const filteredProducts = useMemo(
    () => filterProducts(products, { keyword, category, careLevel, tags }),
    [category, careLevel, keyword, products, tags],
  );

  const isLoading = status === "idle" || status === "loading";

  return (
    <div className="space-y-10">
      <section className="grid gap-8 rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-400 p-10 text-white shadow-lg">
        <div className="space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1 text-sm font-medium">
            🌿 PlantHub Marketplace
          </span>
          <h1 className="text-3xl font-semibold md:text-4xl">
            ค้นหาต้นไม้ที่ใช่ ส่งตรงจากร้านต้นไม้คุณภาพทั่วประเทศ
          </h1>
          <p className="max-w-2xl text-sm text-emerald-50 md:text-base">
            ซื้อต้นไม้เหมือนช้อปปิ้งบน Amazon หรือ Shopee เลือกดูรายละเอียด ราคา และสต็อกได้ก่อนตัดสินใจ เพิ่มลงตะกร้า และชำระเงินได้ในที่เดียว
          </p>
        </div>
        <div className="grid gap-4 text-sm text-emerald-50 md:grid-cols-3">
          <div className="rounded-2xl bg-white/15 p-4">
            <p className="text-lg font-semibold">2,000+ ต้นไม้พร้อมส่ง</p>
            <p className="mt-2 text-emerald-50/80">ร้านค้าที่ผ่านการคัดเลือก มีรีวิวจริงจากลูกค้า</p>
          </div>
          <div className="rounded-2xl bg-white/15 p-4">
            <p className="text-lg font-semibold">จัดส่งรวดเร็วทั่วไทย</p>
            <p className="mt-2 text-emerald-50/80">เลือกวิธีรับสินค้าได้ตามสะดวก พร้อมแพ็คกันกระแทก</p>
          </div>
          <div className="rounded-2xl bg-white/15 p-4">
            <p className="text-lg font-semibold">เปิดร้านง่ายใน 3 นาที</p>
            <p className="mt-2 text-emerald-50/80">เครื่องมือผู้ขายครบ ดูยอดขายและจัดการสต็อกได้ทันที</p>
          </div>
        </div>
      </section>

      <FilterBar
        keyword={keyword}
        onKeywordChange={setKeyword}
        category={category}
        onCategoryChange={setCategory}
        careLevel={careLevel}
        onCareLevelChange={setCareLevel}
        tags={tags}
        onTagsChange={setTags}
      />

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-80 animate-pulse rounded-3xl border border-emerald-100 bg-white/60"
            />
          ))}
        </div>
      ) : error ? (
        <div className="space-y-4 rounded-3xl border border-red-100 bg-red-50/60 p-8 text-red-700">
          <p>ไม่สามารถโหลดรายการสินค้าได้ในขณะนี้</p>
          <button
            onClick={() => fetchProducts({ force: true })}
            className="rounded-full bg-red-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-600"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      ) : (
        <ProductGrid products={filteredProducts} />
      )}
    </div>
  );
}
