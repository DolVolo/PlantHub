import type { TreeProduct } from "../types";

export const initialTreeProducts: TreeProduct[] = [
  {
    id: "albizia",
    slug: "albizia-saman",
    name: "Albizia saman",
    scientificName: "Samanea saman",
    description:
      "ต้นจามจุรียักษ์ร่มเงาดี โตเร็ว ทนแล้ง เหมาะสำหรับปลูกประดับสวนหรือเป็นต้นไม้ใหญ่ให้ร่มเงา",
    price: 1490,
    inStock: 12,
    heightRangeCm: [250, 350],
    category: "outdoor",
    tags: ["shade", "fast-growing", "evergreen"],
    imageUrl:
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=600&q=60",
    seller: {
      id: "plant-haven",
      name: "Plant Haven",
      location: "กรุงเทพมหานคร",
      rating: 4.8,
      totalSales: 842,
    },
    rating: 4.7,
    reviews: 126,
    featured: true,
    deliveryOptions: [
      {
        method: "pickup",
        price: 0,
        description: "รับเองที่กองบริหารงานทรัพย์สินฯ ชั้น 1",
      },
      {
        method: "ems",
        price: 50,
        description: "จัดส่ง EMS: ชิ้นแรก 50 บาท ชิ้นต่อไป +10 บาท",
      },
    ],
    careLevel: "beginner",
    light: "bright",
    water: "medium",
  },
  {
    id: "ficus",
    slug: "ficus-lyrata",
    name: "Fiddle Leaf Fig",
    scientificName: "Ficus lyrata",
    description:
      "ต้นไม้มงคลยอดนิยม เพิ่มความหรูหราให้กับบ้าน ดูแลไม่ยาก ต้องการแสงรำไร",
    price: 990,
    inStock: 34,
    heightRangeCm: [120, 180],
    category: "indoor",
    tags: ["air-purifying", "fiddle leaf", "decor"],
    imageUrl:
      "https://images.unsplash.com/photo-1483794344563-d27a8d18014e?auto=format&fit=crop&w=1200&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1483794344563-d27a8d18014e?auto=format&fit=crop&w=600&q=60",
    seller: {
      id: "urban-jungle",
      name: "Urban Jungle Studio",
      location: "เชียงใหม่",
      rating: 4.9,
      totalSales: 1230,
    },
    rating: 4.9,
    reviews: 412,
    featured: true,
    deliveryOptions: [
      {
        method: "pickup",
        price: 0,
        description: "รับเองที่หน้าร้าน (เชียงใหม่)",
      },
      {
        method: "courier",
        price: 90,
        description: "ขนส่งเอกชน แพ็คกันกระแทก",
      },
    ],
    careLevel: "intermediate",
    light: "medium",
    water: "medium",
  },
  {
    id: "bonsai",
    slug: "bonsai-juniper",
    name: "Bonsai Juniper",
    scientificName: "Juniperus procumbens",
    description:
      "บอนไซจูนิเปอร์ทรงสวย ศิลปะการจัดทรงต้นไม้ที่สะท้อนความประณีต มีลวดและดินพรีเมียม",
    price: 2590,
    inStock: 6,
    heightRangeCm: [35, 50],
    category: "bonsai",
    tags: ["collectible", "bonsai", "gift"],
    imageUrl:
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=60",
    seller: {
      id: "bonsai-club",
      name: "Bonsai Club Thailand",
      location: "นนทบุรี",
      rating: 4.95,
      totalSales: 569,
    },
    rating: 4.95,
    reviews: 98,
    featured: false,
    deliveryOptions: [
      {
        method: "ems",
        price: 50,
        description: "จัดส่ง EMS: ชิ้นแรก 50 บาท ชิ้นต่อไป +10 บาท",
      },
      {
        method: "same-day",
        price: 180,
        description: "จัดส่งด่วนภายในกรุงเทพฯ และปริมณฑล",
      },
    ],
    careLevel: "advanced",
    light: "bright",
    water: "low",
  },
  {
    id: "succulent",
    slug: "succulent-echinocactus",
    name: "Echinocactus Grusonii",
    scientificName: "Golden Barrel Cactus",
    description:
      "กระบองเพชรถังคายักษ์ พร้อมกระถางเซรามิกดีไซน์โมเดิร์น เหมาะกับตกแต่งโต๊ะทำงาน",
    price: 590,
    inStock: 48,
    heightRangeCm: [15, 25],
    category: "succulent",
    tags: ["low-maintenance", "office", "sun-loving"],
    imageUrl:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=60",
    seller: {
      id: "green-corner",
      name: "Green Corner Studio",
      location: "ขอนแก่น",
      rating: 4.6,
      totalSales: 312,
    },
    rating: 4.6,
    reviews: 57,
    featured: false,
    deliveryOptions: [
      {
        method: "courier",
        price: 70,
        description: "ขนส่งพิเศษสำหรับไม้อวบน้ำ แพ็คกันกระแทก",
      },
      {
        method: "ems",
        price: 50,
        description: "จัดส่ง EMS: ชิ้นแรก 50 บาท ชิ้นต่อไป +10 บาท",
      },
    ],
    careLevel: "beginner",
    light: "bright",
    water: "low",
  },
];
