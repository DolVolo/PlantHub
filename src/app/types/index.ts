export type TreeCategory = "indoor" | "outdoor" | "flowering" | "bonsai" | "succulent";

export type DeliveryMethod =
  | "pickup"
  | "ems"
  | "courier"
  | "same-day";

export interface SellerProfile {
  id: string;
  name: string;
  location: string;
  rating: number;
  totalSales: number;
  shopId?: string; // Link to shop details
}

export interface Shop {
  id: string;
  ownerId: string; // User ID of the shop owner
  name: string;
  description: string;
  location: string;
  phone?: string;
  imageUrl?: string;
  openingHours?: string;
  rating: number;
  totalSales: number;
  createdAt: string;
  updatedAt: string;
}

export interface TreeProduct {
  id: string;
  slug: string;
  name: string;
  scientificName: string;
  description: string;
  price: number;
  inStock: number;
  heightRangeCm: [number, number];
  category: TreeCategory;
  tags: string[];
  imageUrl: string;
  thumbnailUrl?: string;
  seller: SellerProfile;
  rating: number;
  reviews: number;
  featured?: boolean;
  deliveryOptions: Array<{
    method: DeliveryMethod;
    price: number;
    description: string;
  }>;
  careLevel: "beginner" | "intermediate" | "advanced";
  light: "low" | "medium" | "bright";
  water: "low" | "medium" | "high";
}

export interface BasketItem {
  productId: string;
  quantity: number;
}

export interface CustomerDetails {
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  purchaseDate: string;
  deliveryMethod: DeliveryMethod;
  paymentMethod: "bank" | "promptpay" | "cash";
  pickupLocation?: string;
  bankSlipUrl?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "buyer" | "seller" | "admin";
  profileImageUrl?: string;
}

export interface SavedPaymentInfo {
  id: string;
  userId: string;
  name: string; // Name for this saved info (e.g., "บ้าน", "ที่ทำงาน")
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}
