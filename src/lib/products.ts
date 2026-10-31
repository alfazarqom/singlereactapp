import { supabase } from "./supabaseClient";

export interface StoreProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviewCount: number;
  images: string[];
  colors: string[];
  sizes: string[];
  stock: number;
  specs: string[];
}

interface ProductRow {
  id: string;
  title: string;
  brand: string | null;
  price: number | null;
  sale_price: number | null;
  currency: string;
  description: string | null;
  category: string | null;
  availability: string | null;
  stock_quantity: number | null;
  colors: unknown;
  sizes: unknown;
  image_url: string | null;
  additional_image_urls: unknown;
  labels: unknown;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function mapProduct(row: ProductRow): StoreProduct {
  const basePrice = Number(row.price ?? 0);
  const salePrice = Number(row.sale_price ?? 0);
  const price = salePrice > 0 && salePrice < basePrice ? salePrice : basePrice;
  const images = [row.image_url, ...stringArray(row.additional_image_urls)]
    .filter((image): image is string => typeof image === "string" && image.length > 0);

  return {
    id: row.id,
    name: row.title,
    brand: row.brand ?? "",
    category: row.category ?? "Other",
    description: row.description ?? "",
    price,
    originalPrice: basePrice,
    discount: basePrice > price && basePrice > 0 ? Math.round((1 - price / basePrice) * 100) : 0,
    rating: 0,
    reviewCount: 0,
    images,
    colors: stringArray(row.colors),
    sizes: stringArray(row.sizes),
    stock: ["available", "in stock"].includes((row.availability ?? "").toLowerCase()) ? Math.max(0, Number(row.stock_quantity ?? 0)) : 0,
    specs: stringArray(row.labels),
  };
}

export async function fetchProducts(): Promise<StoreProduct[]> {
  const { data, error } = await supabase
    .from("apps_products")
    .select("id,title,brand,price,sale_price,currency,description,category,availability,stock_quantity,colors,sizes,image_url,additional_image_urls,labels")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message || "Unable to load products");
  return ((data ?? []) as ProductRow[]).map(mapProduct);
}
