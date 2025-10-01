// Firestore helpers for products (server-side via Admin SDK)
import { adminFirestore } from "../../lib/firebaseAdmin";
import type { TreeProduct } from "../../types";

type Product = TreeProduct;

const PRODUCTS_COLLECTION = "products";

/**
 * Get all products from Firestore
 */
export async function getFirestoreProducts(): Promise<Product[]> {
  try {
    const snapshot = await adminFirestore().collection(PRODUCTS_COLLECTION).get();
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
      } as Product;
    });
  } catch (error) {
    console.error("[Firestore] Get products failed:", error);
    return [];
  }
}

/**
 * Get a single product by ID
 */
export async function getFirestoreProduct(id: string): Promise<Product | null> {
  try {
    const doc = await adminFirestore().collection(PRODUCTS_COLLECTION).doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return {
      id: doc.id,
      ...doc.data(),
    } as Product;
  } catch (error) {
    console.error("[Firestore] Get product failed:", error);
    return null;
  }
}

/**
 * Create a new product in Firestore
 */
export async function createFirestoreProduct(product: Omit<Product, "id">): Promise<Product> {
  try {
    const docRef = await adminFirestore()
      .collection(PRODUCTS_COLLECTION)
      .add({
        ...product,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

    return {
      id: docRef.id,
      ...product,
    };
  } catch (error) {
    console.error("[Firestore] Create product failed:", error);
    throw new Error("ไม่สามารถสร้างสินค้าได้");
  }
}

/**
 * Update an existing product
 */
export async function updateFirestoreProduct(
  id: string,
  updates: Partial<Omit<Product, "id">>,
): Promise<void> {
  try {
    await adminFirestore()
      .collection(PRODUCTS_COLLECTION)
      .doc(id)
      .update({
        ...updates,
        updatedAt: new Date().toISOString(),
      });
  } catch (error) {
    console.error("[Firestore] Update product failed:", error);
    throw new Error("ไม่สามารถอัปเดตสินค้าได้");
  }
}

/**
 * Delete a product
 */
export async function deleteFirestoreProduct(id: string): Promise<void> {
  try {
    await adminFirestore().collection(PRODUCTS_COLLECTION).doc(id).delete();
  } catch (error) {
    console.error("[Firestore] Delete product failed:", error);
    throw new Error("ไม่สามารถลบสินค้าได้");
  }
}

/**
 * Get products by seller ID
 */
export async function getFirestoreProductsBySeller(sellerId: string): Promise<Product[]> {
  try {
    const snapshot = await adminFirestore()
      .collection(PRODUCTS_COLLECTION)
      .where("sellerId", "==", sellerId)
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[];
  } catch (error) {
    console.error("[Firestore] Get seller products failed:", error);
    return [];
  }
}

/**
 * Seed initial products (run once)
 */
export async function seedFirestoreProducts(products: Omit<Product, "id">[]): Promise<void> {
  try {
    const batch = adminFirestore().batch();
    
    for (const product of products) {
      const docRef = adminFirestore().collection(PRODUCTS_COLLECTION).doc();
      batch.set(docRef, {
        ...product,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    
    await batch.commit();
    console.info(`[Firestore] Seeded ${products.length} products`);
  } catch (error) {
    console.error("[Firestore] Seed products failed:", error);
    throw new Error("ไม่สามารถเพิ่มข้อมูลเริ่มต้นได้");
  }
}
