import React, { useState, useEffect, createContext, useContext, useCallback } from "react";
import {
  ShoppingCart,
  Heart,
  User,
  Home,
  Grid,
  Bell,
  ChevronRight,
  Star,
  Truck,
  ShieldCheck,
  Package,
  ArrowLeft,
  CheckCircle,
  Plus,
  Minus,
  Trash2,
  MapPin,
  CreditCard,
  X,
  SlidersHorizontal,
  Clock,
  Sparkles,
  ChevronDown,
  Tag,
  Share2,
  Check,
  Copy,
  LogOut,
  Settings,
  HelpCircle,
  Phone,
  Mail,
  RefreshCw,
  Eye,
  AlertCircle,
  ExternalLink,
  Loader2,
  Database,
  Shield,
  QrCode,
  DollarSign
} from "lucide-react";
import { supabase } from "./lib/supabaseClient";
import { createDuitkuInvoice, processDuitkuPayment } from "./lib/duitkuService";

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  banner: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  categorySlug: string;
  description: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviewCount: number;
  stock: number;
  soldCount: number;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  images: string[];
  colors: string[];
  sizes: string[];
  specs: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: string;
  selectedSize: string;
}

export interface Order {
  id: string;
  merchantOrderId: string;
  date: string;
  status: "PENDING" | "PAID" | "FAILED" | "EXPIRED" | string;
  total: number;
  items: CartItem[];
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  duitkuReference?: string;
  duitkuPaymentUrl?: string;
  duitkuVaNumber?: string;
  paymentMethod?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "promo" | "order" | "wallet";
}

// Initial Production Seed (identical to SQL migration in supabase/schema.sql)
// Used seamlessly on first startup before Supabase tables are initialized
const INITIAL_CATEGORIES: Category[] = [
  { id: "cat-1", name: "Fashion", slug: "fashion", icon: "Shirt", banner: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=1200" },
  { id: "cat-2", name: "Electronics", slug: "electronics", icon: "Smartphone", banner: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1200" },
  { id: "cat-3", name: "Beauty", slug: "beauty", icon: "Sparkles", banner: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=1200" },
  { id: "cat-4", name: "Home & Living", slug: "home-living", icon: "Home", banner: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=1200" },
  { id: "cat-5", name: "Sports", slug: "sports", icon: "Activity", banner: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=1200" },
  { id: "cat-6", name: "Accessories", slug: "accessories", icon: "Watch", banner: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1200" }
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Aura Noise-Canceling Wireless Headphones Pro",
    slug: "aura-wireless-headphones-pro",
    brand: "Aura Audio",
    category: "Electronics",
    categorySlug: "electronics",
    description: "Premium over-ear wireless headphones engineered with hybrid active noise cancellation, 30-hour playback, custom acoustic drivers, and spatial audio calibration.",
    price: 2499000,
    originalPrice: 3299000,
    discount: 24,
    rating: 4.9,
    reviewCount: 312,
    stock: 14,
    soldCount: 840,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=800"
    ],
    colors: ["Matte Black", "Silver Quartz", "Navy Blue"],
    sizes: ["Standard"],
    specs: ["Active Noise Cancellation", "30 Hours Battery", "Bluetooth 5.3", "Custom EQ App"]
  },
  {
    id: "prod-2",
    name: "Minimalist Leather Smartwatch Gen-4",
    slug: "minimalist-leather-smartwatch",
    brand: "Chronos",
    category: "Electronics",
    categorySlug: "electronics",
    description: "Sleek biometric smartwatch featuring AMOLED touch screen, heart rate & SpO2 tracking, GPS, 50m water resistance, and genuine Italian leather strap.",
    price: 1850000,
    originalPrice: 2200000,
    discount: 15,
    rating: 4.7,
    reviewCount: 184,
    stock: 9,
    soldCount: 410,
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=800"
    ],
    colors: ["Tan Brown", "Midnight Black"],
    sizes: ["40mm", "44mm"],
    specs: ["OLED Always-On", "Heart & ECG Sensor", "5 ATM Waterproof", "7-Day Battery Life"]
  },
  {
    id: "prod-3",
    name: "Urban Explorer Ergonomic 25L Backpack",
    slug: "urban-explorer-backpack",
    brand: "NORDIC",
    category: "Fashion",
    categorySlug: "fashion",
    description: "Weatherproof rolltop city backpack featuring 16-inch padded laptop sleeve, quick-access passport pocket, and breathable memory foam back panel.",
    price: 790000,
    originalPrice: 1100000,
    discount: 28,
    rating: 4.8,
    reviewCount: 96,
    stock: 22,
    soldCount: 630,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&q=80&w=800"
    ],
    colors: ["Charcoal Slate", "Olive Green", "Desert Sand"],
    sizes: ["One Size (25L)"],
    specs: ["Waterproof Cordura", "Fits 16-inch Laptop", "Luggage Pass-through", "YKK Zippers"]
  },
  {
    id: "prod-4",
    name: "Heavyweight Organic Cotton Oversized Hoodie",
    slug: "heavyweight-cotton-hoodie",
    brand: "KITH & CO",
    category: "Fashion",
    categorySlug: "fashion",
    description: "Crafted from 450 GSM organic French terry cotton. Double-layered hood, dropped shoulders, and pre-shrunk finish for long-lasting relaxed aesthetic.",
    price: 480000,
    originalPrice: 600000,
    discount: 20,
    rating: 4.6,
    reviewCount: 142,
    stock: 35,
    soldCount: 920,
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    images: [
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&q=80&w=800"
    ],
    colors: ["Washed Off-White", "Charcoal Gray", "Sage Green"],
    sizes: ["S", "M", "L", "XL"],
    specs: ["100% Organic Cotton", "450 GSM Fleece", "Pre-shrunk", "Ribbed Cuffs"]
  },
  {
    id: "prod-5",
    name: "Ceramic Pour-Over Coffee Dripper Set",
    slug: "ceramic-pour-over-coffee-set",
    brand: "KONO Studio",
    category: "Home & Living",
    categorySlug: "home-living",
    description: "Handcrafted ceramic V60 style pour-over dripper complete with heat-resistant 700ml glass carafe and precision walnut wood stand.",
    price: 649000,
    originalPrice: 799000,
    discount: 18,
    rating: 4.9,
    reviewCount: 215,
    stock: 11,
    soldCount: 540,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    images: [
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=800"
    ],
    colors: ["Matte White", "Japanese Black Ceramic"],
    sizes: ["600ml / 2-4 Cups"],
    specs: ["High-Fired Ceramic", "Borosilicate Carafe", "Includes 40 Paper Filters", "Dishwasher Safe"]
  },
  {
    id: "prod-6",
    name: "Botanical Hydrating Facial Essence 150ml",
    slug: "botanical-hydrating-facial-essence",
    brand: "LUMINA Skincare",
    category: "Beauty",
    categorySlug: "beauty",
    description: "Nourishing facial treatment essence formulated with green tea ferment, hyaluronic acid, and niacinamide for radiant skin elasticity.",
    price: 320000,
    originalPrice: 420000,
    discount: 23,
    rating: 4.8,
    reviewCount: 380,
    stock: 45,
    soldCount: 1200,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    images: [
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800"
    ],
    colors: ["Standard Bottle"],
    sizes: ["150ml"],
    specs: ["Cruelty-Free", "Dermatologist Tested", "Alcohol-Free", "Vegan Certified"]
  },
  {
    id: "prod-7",
    name: "Pro Performance Non-Slip Yoga Mat 6mm",
    slug: "pro-performance-yoga-mat",
    brand: "ZENFIT",
    category: "Sports",
    categorySlug: "sports",
    description: "Eco-friendly natural tree rubber yoga mat with laser-etched alignment guides, superior grip density, and antimicrobial surface coat.",
    price: 520000,
    originalPrice: 650000,
    discount: 20,
    rating: 4.7,
    reviewCount: 110,
    stock: 18,
    soldCount: 310,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    images: [
      "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&q=80&w=800"
    ],
    colors: ["Ocean Teal", "Deep Plum", "Midnight Ash"],
    sizes: ["183cm x 68cm x 6mm"],
    specs: ["Natural Rubber", "Antimicrobial Layer", "Laser Alignment", "Includes Carrying Strap"]
  },
  {
    id: "prod-8",
    name: "Polarized Titanium Frame Sunglasses",
    slug: "polarized-titanium-sunglasses",
    brand: "VERVE Eyewear",
    category: "Accessories",
    categorySlug: "accessories",
    description: "Ultra-lightweight aerospace titanium frames with UV400 anti-glare polarized lenses. Maximum comfort for outdoor performance and driving.",
    price: 890000,
    originalPrice: 1250000,
    discount: 28,
    rating: 4.9,
    reviewCount: 88,
    stock: 15,
    soldCount: 270,
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    images: [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=800"
    ],
    colors: ["Gunmetal Silver", "Gold Amber"],
    sizes: ["Medium Fit"],
    specs: ["100% UV400 Protection", "16g Titanium Frame", "Anti-Scratch Coating", "Includes Leather Case"]
  }
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  { id: "notif-1", title: "Duitku Payment Gateway Aktif 🚀", message: "Pembayaran otomatis via QRIS, Virtual Account & Kartu Kredit Duitku POP telah terhubung.", time: "Baru saja", read: false, type: "order" },
  { id: "notif-2", title: "Flash Sale Promo! ⚡", message: "Diskon hingga 28% untuk kategori Electronics & Fashion.", time: "1 jam lalu", read: false, type: "promo" },
  { id: "notif-3", title: "Supabase Database Terhubung 🗄️", message: "Katalog produk dan riwayat transaksi tersinkronisasi dengan Supabase.", time: "2 jam lalu", read: true, type: "wallet" }
];

// Helper: Format Rupiah IDR
export const formatIDR = (price: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(price || 0);
};

// ==========================================
// CONTEXT PROVIDER (GLOBAL APP STATE)
// ==========================================

interface AppContextType {
  currentPage: string;
  navigateTo: (page: string, data?: any) => void;
  categories: Category[];
  products: Product[];
  selectedProduct: Product | null;
  selectedColor: string;
  setSelectedColor: (c: string) => void;
  selectedSize: string;
  setSelectedSize: (s: string) => void;
  selectedQuantity: number;
  setSelectedQuantity: React.Dispatch<React.SetStateAction<number>>;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isLoading: boolean;
  toastMessage: string;
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, color?: string, size?: string) => boolean;
  updateQuantity: (index: number, delta: number) => void;
  removeFromCart: (index: number) => void;
  cartTotal: number;
  cartCount: number;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  activeOrder: Order | null;
  setActiveOrder: (order: Order | null) => void;
  notifications: NotificationItem[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>>;
  triggerToast: (msg: string) => void;
  customerInfo: { name: string; email: string; phone: string; address: string };
  setCustomerInfo: React.Dispatch<React.SetStateAction<{ name: string; email: string; phone: string; address: string }>>;
  handleDuitkuCheckout: () => Promise<void>;
  isPaymentProcessing: boolean;
  isDataLoading: boolean;
  isDbLive: boolean;
  refreshCatalog: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<string>("home");
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(INITIAL_PRODUCTS[0]);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  const [isDbLive, setIsDbLive] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [isPaymentProcessing, setIsPaymentProcessing] = useState<boolean>(false);

  // Customer Checkout Form State
  const [customerInfo, setCustomerInfo] = useState({
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    phone: "081234567890",
    address: "Jl. Jend. Sudirman No. 45, Jakarta Selatan 12190"
  });

  // Cart & Wishlist Local Storage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("mystore_cart");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { product: INITIAL_PRODUCTS[0], quantity: 1, selectedColor: "Matte Black", selectedSize: "Standard" }
    ];
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("mystore_wishlist");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [INITIAL_PRODUCTS[1].id, INITIAL_PRODUCTS[3].id];
  });

  const [orders, setOrders] = useState<Order[]>([
    {
      id: "ORD-98231",
      merchantOrderId: "ORD-98231",
      date: "2026-10-24",
      status: "PAID",
      total: 2499000,
      items: [{ product: INITIAL_PRODUCTS[0], quantity: 1, selectedColor: "Matte Black", selectedSize: "Standard" }],
      customerName: "Alex Johnson",
      customerAddress: "Jl. Jend. Sudirman No. 45, Jakarta Selatan, 12190",
      duitkuReference: "REF-PROD-98231",
      paymentMethod: "Duitku POP (BCA VA)"
    }
  ]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  // Fetch Live Data from Supabase
  const refreshCatalog = useCallback(async () => {
    setIsDataLoading(true);
    try {
      // 1. Fetch Categories
      const { data: catData, error: catErr } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });

      if (!catErr && catData && catData.length > 0) {
        setCategories(catData as Category[]);
        setIsDbLive(true);
      }

      // 2. Fetch Products
      const { data: prodData, error: prodErr } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (!prodErr && prodData && prodData.length > 0) {
        const normalized = prodData.map((row: any) => ({
          id: row.id,
          name: row.name,
          slug: row.slug,
          brand: row.brand || "Storefront",
          category: row.category,
          categorySlug: row.category_slug || row.category?.toLowerCase() || "",
          description: row.description || "",
          price: Number(row.price),
          originalPrice: Number(row.original_price || row.originalPrice || row.price),
          discount: Number(row.discount || 0),
          rating: Number(row.rating || 5.0),
          reviewCount: Number(row.review_count || row.reviewCount || 0),
          stock: Number(row.stock ?? 10),
          soldCount: Number(row.sold_count || row.soldCount || 0),
          isFeatured: Boolean(row.is_featured),
          isBestSeller: Boolean(row.is_best_seller),
          isNewArrival: Boolean(row.is_new_arrival),
          images: Array.isArray(row.images) ? row.images : [],
          colors: Array.isArray(row.colors) ? row.colors : [],
          sizes: Array.isArray(row.sizes) ? row.sizes : [],
          specs: Array.isArray(row.specs) ? row.specs : []
        }));
        setProducts(normalized);
        setSelectedProduct(normalized[0]);
        setIsDbLive(true);
      }

      // 3. Fetch Orders from Supabase
      const { data: orderData, error: orderErr } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (!orderErr && orderData && orderData.length > 0) {
        const mappedOrders: Order[] = orderData.map((ord: any) => ({
          id: ord.merchant_order_id || ord.id,
          merchantOrderId: ord.merchant_order_id || ord.id,
          date: ord.created_at ? ord.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
          status: ord.payment_status || "PENDING",
          total: Number(ord.total_amount),
          items: Array.isArray(ord.items) ? ord.items : [],
          customerName: ord.customer_name,
          customerEmail: ord.customer_email,
          customerPhone: ord.customer_phone,
          customerAddress: ord.customer_address,
          duitkuReference: ord.duitku_reference,
          duitkuPaymentUrl: ord.duitku_payment_url,
          duitkuVaNumber: ord.duitku_va_number,
          paymentMethod: ord.payment_method || "Duitku POP"
        }));
        setOrders(mappedOrders);
      }
    } catch (e) {
      console.warn("[AppProvider] Supabase query note:", e);
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCatalog();
  }, [refreshCatalog]);

  // Persist LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem("mystore_cart", JSON.stringify(cart));
    } catch {}
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem("mystore_wishlist", JSON.stringify(wishlist));
    } catch {}
  }, [wishlist]);

  // Enforce Zoom Blocking Completely (Requirement #3)
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };
    const handleGestureStart = (e: Event) => {
      e.preventDefault();
    };

    document.addEventListener("touchstart", handleTouchStart, { passive: false });
    document.addEventListener("wheel", handleWheel, { passive: false });
    document.addEventListener("gesturestart", handleGestureStart, { passive: false });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("wheel", handleWheel);
      document.removeEventListener("gesturestart", handleGestureStart);
    };
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const navigateTo = (page: string, data: any = null) => {
    setIsLoading(true);
    if (page === "product-detail" && data) {
      setSelectedProduct(data);
      setSelectedColor(data.colors ? data.colors[0] : "");
      setSelectedSize(data.sizes ? data.sizes[0] : "");
      setSelectedQuantity(1);
    }
    if (page === "category" && data) setSelectedCategory(data);
    if (page === "order-detail" && data) setActiveOrder(data);

    setTimeout(() => {
      setCurrentPage(page);
      setIsLoading(false);
      const mainElem = document.getElementById("main-content-area");
      if (mainElem) mainElem.scrollTop = 0;
    }, 200);
  };

  // Cart Operations
  const addToCart = (product: Product, quantity = 1, color = "", size = ""): boolean => {
    const chosenColor = color || (product.colors ? product.colors[0] : "");
    const chosenSize = size || (product.sizes ? product.sizes[0] : "");
    const existingItem = cart.find(
      (item) => item.product.id === product.id && item.selectedColor === chosenColor && item.selectedSize === chosenSize
    );
    const nextQuantity = (existingItem?.quantity || 0) + quantity;

    if (product.stock <= 0) {
      triggerToast("Produk ini sedang habis");
      return false;
    }
    if (quantity < 1 || nextQuantity > product.stock) {
      triggerToast(`Stok maksimal yang tersedia adalah ${product.stock}`);
      return false;
    }

    setCart((prevCart) => {
      const idx = prevCart.findIndex(
        (item) => item.product.id === product.id && item.selectedColor === chosenColor && item.selectedSize === chosenSize
      );
      if (idx > -1) {
        const next = [...prevCart];
        next[idx].quantity += quantity;
        return next;
      }
      return [...prevCart, { product, quantity, selectedColor: chosenColor, selectedSize: chosenSize }];
    });
    triggerToast(`"${product.name.slice(0, 22)}..." berhasil ditambahkan ke keranjang`);
    return true;
  };

  const updateQuantity = (index: number, delta: number) => {
    setCart((prev) => {
      const next = [...prev];
      const newQty = next[index].quantity + delta;
      if (newQty <= 0) {
        next.splice(index, 1);
      } else {
        next[index].quantity = newQty;
      }
      return next;
    });
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
    triggerToast("Item dihapus dari keranjang");
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      if (prev.includes(productId)) {
        triggerToast("Dihapus dari Wishlist");
        return prev.filter((id) => id !== productId);
      } else {
        triggerToast("Disimpan ke Wishlist! ❤️");
        return [...prev, productId];
      }
    });
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Official Duitku POP Checkout Flow
  const handleDuitkuCheckout = async () => {
    if (cart.length === 0) {
      triggerToast("Keranjang belanja kosong!");
      navigateTo("products");
      return;
    }

    if (!customerInfo.name.trim() || !customerInfo.phone.trim() || !customerInfo.address.trim()) {
      triggerToast("Lengkapi nama, no telepon, dan alamat pengiriman!");
      return;
    }

    setIsPaymentProcessing(true);
    triggerToast("Menghubungkan ke Duitku Payment Gateway...");

    const merchantOrderId = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    try {
      // 1. Create Order row in Supabase
      const newOrderPayload = {
        id: merchantOrderId,
        merchant_order_id: merchantOrderId,
        customer_name: customerInfo.name,
        customer_email: customerInfo.email || "customer@example.com",
        customer_phone: customerInfo.phone,
        customer_address: customerInfo.address,
        total_amount: cartTotal,
        payment_status: "PENDING",
        payment_method: "DUITKU_POP",
        items: cart
      };

      try {
        await supabase.from("orders").insert(newOrderPayload);
      } catch (insertErr) {
        console.warn("[Checkout] Supabase orders table insert warning:", insertErr);
      }

      // 2. Request Invoice from Duitku Inquiry API via Supabase Edge Function 'create-invoice'
      const invoiceData = await createDuitkuInvoice({
        merchantOrderId,
        paymentAmount: cartTotal,
        productDetails: `Pembelian ${cart.length} item di Storefront`,
        email: customerInfo.email || "customer@example.com",
        phoneNumber: customerInfo.phone,
        customerName: customerInfo.name,
        itemDetails: cart.map((item) => ({
          name: item.product.name.slice(0, 50),
          price: item.product.price,
          quantity: item.quantity
        }))
      });

      const initialOrderObj: Order = {
        id: merchantOrderId,
        merchantOrderId,
        date: new Date().toISOString().split("T")[0],
        status: "PENDING",
        total: cartTotal,
        items: [...cart],
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        customerAddress: customerInfo.address,
        duitkuReference: invoiceData.reference,
        duitkuPaymentUrl: invoiceData.paymentUrl,
        duitkuVaNumber: invoiceData.vaNumber,
        paymentMethod: "Duitku POP"
      };

      setOrders((prev) => [initialOrderObj, ...prev]);
      setActiveOrder(initialOrderObj);

      // 3. Trigger Official Duitku POP checkout.process(reference, options)
      await processDuitkuPayment(invoiceData.reference, {
        onSuccess: async (result) => {
          console.log("[Duitku POP] Payment Success:", result);
          setIsPaymentProcessing(false);

          // Update Supabase Database
          try {
            await supabase
              .from("orders")
              .update({
                payment_status: "PAID",
                updated_at: new Date().toISOString()
              })
              .eq("merchant_order_id", merchantOrderId);
          } catch (e) {
            console.warn("[Duitku POP] Database update note:", e);
          }

          // Update local state
          setOrders((prev) =>
            prev.map((ord) => (ord.merchantOrderId === merchantOrderId ? { ...ord, status: "PAID" } : ord))
          );
          setActiveOrder((prev) =>
            prev && prev.merchantOrderId === merchantOrderId ? { ...prev, status: "PAID" } : prev
          );
          setCart([]);
          localStorage.removeItem("mystore_cart");
          triggerToast("Pembayaran berhasil dikonfirmasi! Pesanan Anda diproses.");
          navigateTo("order-success");
        },

        onPending: async (result) => {
          console.log("[Duitku POP] Payment Pending:", result);
          setIsPaymentProcessing(false);
          setCart([]);
          localStorage.removeItem("mystore_cart");
          triggerToast("Menunggu pembayaran via Duitku. Silakan selesaikan tagihan.");
          navigateTo("orders");
        },

        onError: (result) => {
          console.error("[Duitku POP] Payment Error:", result);
          setIsPaymentProcessing(false);
          triggerToast("Pembayaran dibatalkan atau gagal diproses.");
        },

        onClose: (result) => {
          console.log("[Duitku POP] Window Closed by user:", result);
          setIsPaymentProcessing(false);
          triggerToast("Popup pembayaran ditutup. Anda dapat membayar nanti di menu Pesanan.");
          navigateTo("orders");
        }
      });
    } catch (err: any) {
      console.error("[Checkout] Error executing checkout:", err);
      setIsPaymentProcessing(false);
      triggerToast("Gagal memproses pembayaran. Coba lagi.");
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentPage,
        navigateTo,
        categories,
        products,
        selectedProduct,
        selectedColor,
        setSelectedColor,
        selectedSize,
        setSelectedSize,
        selectedQuantity,
        setSelectedQuantity,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        isLoading,
        toastMessage,
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        cartTotal,
        cartCount,
        wishlist,
        toggleWishlist,
        orders,
        setOrders,
        activeOrder,
        setActiveOrder,
        notifications,
        setNotifications,
        triggerToast,
        customerInfo,
        setCustomerInfo,
        handleDuitkuCheckout,
        isPaymentProcessing,
        isDataLoading,
        isDbLive,
        refreshCatalog
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

// ==========================================
// SKELETON LOADING COMPONENTS
// ==========================================

const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg ${className}`} />
);

const ProductCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800 space-y-3">
    <Skeleton className="w-full aspect-square rounded-xl" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-3 w-1/2" />
    <div className="flex justify-between items-center pt-2">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-8 w-8 rounded-full" />
    </div>
  </div>
);

const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

// ==========================================
// REUSABLE PRODUCT CARD
// ==========================================

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { navigateTo, wishlist, toggleWishlist } = useApp();
  const isWishlisted = wishlist.includes(product.id);

  return (
    <div className="group flex flex-col gap-0.5">
      {/* Product Media */}
      <div
        className="relative aspect-square rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden cursor-pointer"
        onClick={() => navigateTo("product-detail", product)}
      >
        <img
          src={product.images[0] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {product.discount > 0 && (
          <span className="absolute top-2.5 left-2.5 bg-orange-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
            -{product.discount}%
          </span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all cursor-pointer ${
            isWishlisted
              ? "bg-red-500 text-white"
              : "bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 hover:bg-white"
          }`}
          aria-label="Wishlist"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
        </button>
      </div>

      {/* Product Info */}
      <div className="flex flex-1 flex-col space-y-0.5 pt-1">
        <div className="space-y-0.5">
          <h3
            onClick={() => navigateTo("product-detail", product)}
            className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 hover:text-orange-600 dark:hover:text-orange-400 cursor-pointer transition-colors"
          >
            {product.name}
          </h3>
        </div>

        <div className="space-y-0.5">
          <div className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
            {formatIDR(product.price)}
          </div>
          {product.originalPrice > product.price && (
            <div className="text-[11px] text-slate-400 line-through">
              {formatIDR(product.originalPrice)}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 text-[11px] pt-0.5">
          <div className="flex items-center gap-0.5 font-semibold text-amber-500">
            <Star className="h-3 w-3 fill-current" />
            <span>{product.rating}</span>
          </div>
          <span className="font-medium text-slate-400">({product.reviewCount} ulasan)</span>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// STANDALONE PAGES LIST
// ==========================================

const STANDALONE_PAGES = [
  "product-detail",
  "checkout",
  "order-success",
  "wishlist",
  "cart",
  "orders",
  "order-detail",
  "notifications"
];

// ==========================================
// HEADER (No search, wishlist in profile, back on standalone)
// ==========================================

const Header: React.FC = () => {
  const { navigateTo, cartCount, notifications, currentPage, isDbLive } = useApp();
  const unreadNotifs = notifications.filter((n) => !n.read).length;
  const isStandalone = STANDALONE_PAGES.includes(currentPage);

  const handleBack = () => {
    switch (currentPage) {
      case "checkout":
        navigateTo("cart");
        break;
      case "product-detail":
        navigateTo("products");
        break;
      case "cart":
        navigateTo("home");
        break;
      case "wishlist":
      case "orders":
      case "order-detail":
      case "notifications":
        navigateTo("profile");
        break;
      case "order-success":
        navigateTo("home");
        break;
      default:
        navigateTo("home");
    }
  };

  return (
    <header className="flex-shrink-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3 sm:gap-6">
        {/* Left Side: Back button (on standalone pages) & Logo */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {isStandalone && (
            <button
              onClick={handleBack}
              className="p-2 -ml-1 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center cursor-pointer"
              aria-label="Back"
              title="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          {/* Logo */}
          <button
            onClick={() => navigateTo("home")}
            className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white flex items-center gap-2 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center font-semibold text-lg shadow-md shadow-orange-500/30">
              S
            </div>
            <span className="text-slate-900 dark:text-white">
              Storefront<span className="text-orange-500">.</span>
            </span>
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Notifications Icon */}
          <button
            onClick={() => navigateTo("notifications")}
            className="relative p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifs > 0 && (
              <span className="absolute top-1 right-1 bg-orange-500 text-white text-[10px] font-semibold rounded-full h-4 w-4 flex items-center justify-center">
                {unreadNotifs}
              </span>
            )}
          </button>

          {/* Cart Button */}
          <button
            onClick={() => navigateTo("cart")}
            className="relative p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            aria-label="Shopping Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-slate-900 dark:bg-orange-500 text-white text-[10px] font-semibold rounded-full h-5 w-5 flex items-center justify-center shadow-md">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Profile */}
          <button
            onClick={() => navigateTo("profile")}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
            aria-label="Profile"
          >
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-semibold text-slate-700 dark:text-slate-200">
              AJ
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

// ==========================================
// BOTTOM NAVIGATION BAR (Standard Pages)
// ==========================================

const BottomNavigation: React.FC = () => {
  const { currentPage, navigateTo, cartCount } = useApp();

  const navItems: Array<{ id: string; label: string; icon: any; badge?: number }> = [
    { id: "home", label: "Home", icon: Home },
    { id: "products", label: "Catalog", icon: Grid },
    { id: "cart", label: "Cart", icon: ShoppingCart, badge: cartCount },
    { id: "profile", label: "Profile", icon: User }
  ];

  return (
    <nav className="flex-shrink-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 py-2 px-4 shadow-lg z-30">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id || (item.id === "products" && currentPage === "category");

          return (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id)}
              className={`relative flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? "text-orange-600 dark:text-orange-400 font-semibold scale-105"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
              {Boolean(item.badge && item.badge > 0) && (
                <span className="absolute top-0 right-2 bg-orange-500 text-white text-[9px] font-semibold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

// ==========================================
// BOTTOM ACTION BAR (Standalone Pages - No back button per Req #7)
// ==========================================

const BottomActionBar: React.FC = () => {
  const {
    currentPage,
    navigateTo,
    selectedProduct,
    selectedColor,
    selectedSize,
    selectedQuantity,
    addToCart,
    cart,
    cartTotal,
    cartCount,
    wishlist,
    toggleWishlist,
    orders,
    handleDuitkuCheckout,
    isPaymentProcessing
  } = useApp();

  const isWishlisted = selectedProduct ? wishlist.includes(selectedProduct.id) : false;

  return (
    <aside className="flex-shrink-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 py-3 px-4 shadow-xl z-30">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {currentPage === "product-detail" && selectedProduct && (
          <div className="w-full flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleWishlist(selectedProduct.id)}
                className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                  isWishlisted
                    ? "bg-red-500 text-white border-red-500"
                    : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
                title="Wishlist"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
              </button>
              <div>
                <p className="text-[10px] text-slate-400">Total Harga</p>
                <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white leading-none">
                  {formatIDR(selectedProduct.price * selectedQuantity)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
              <button
                onClick={() => addToCart(selectedProduct, selectedQuantity, selectedColor, selectedSize)}
                disabled={selectedProduct.stock <= 0 || selectedQuantity > selectedProduct.stock}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-orange-500 text-orange-600 dark:text-orange-400 font-semibold text-xs hover:bg-orange-50 dark:hover:bg-orange-950/40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>+ Keranjang</span>
              </button>
              <button
                onClick={() => {
                  const added = addToCart(selectedProduct, selectedQuantity, selectedColor, selectedSize);
                  if (added) navigateTo("checkout");
                }}
                disabled={selectedProduct.stock <= 0 || selectedQuantity > selectedProduct.stock}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-xs shadow-md shadow-orange-500/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Beli Sekarang</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {currentPage === "cart" && (
          <div className="w-full flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] text-slate-400">Total ({cartCount} barang)</p>
              <p className="text-base sm:text-lg font-semibold text-orange-600 leading-none">
                {formatIDR(cartTotal)}
              </p>
            </div>

            <button
              onClick={() => navigateTo("checkout")}
              disabled={cart.length === 0}
              className={`px-7 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                cart.length > 0
                  ? "bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/25"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
              }`}
            >
              <span>Lanjut ke Checkout</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {currentPage === "checkout" && (
          <div className="w-full flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] text-slate-400">Total Pembayaran</p>
              <p className="text-base sm:text-lg font-semibold text-orange-600 leading-none">
                {formatIDR(cartTotal)}
              </p>
            </div>

            <button
              onClick={handleDuitkuCheckout}
              disabled={isPaymentProcessing || cart.length === 0}
              className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold text-xs shadow-md shadow-orange-500/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              {isPaymentProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses POP...</span>
                </>
              ) : (
                <>
                  <span>Bayar dengan Duitku</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {currentPage === "wishlist" && (
          <div className="w-full flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] text-slate-400">Wishlist Saya</p>
              <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                {wishlist.length} barang tersimpan
              </p>
            </div>

            <button
              onClick={() => navigateTo("products")}
              className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs shadow-md shadow-orange-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Jelajahi Produk</span>
            </button>
          </div>
        )}

        {currentPage === "orders" && (
          <div className="w-full flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] text-slate-400">Riwayat Pesanan</p>
              <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                {orders.length} Transaksi
              </p>
            </div>

            <button
              onClick={() => navigateTo("products")}
              className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs shadow-md shadow-orange-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Belanja Lagi</span>
            </button>
          </div>
        )}

        {currentPage === "order-detail" && (
          <div className="w-full flex items-center justify-between gap-3">
            <button
              onClick={() => navigateTo("orders")}
              className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Riwayat</span>
            </button>

            <button
              onClick={() => navigateTo("products")}
              className="py-2.5 px-5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs shadow-md shadow-orange-500/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Belanja Produk</span>
            </button>
          </div>
        )}

        {currentPage === "notifications" && (
          <div className="w-full flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Notifikasi pembaruan & transaksi
            </p>

            <button
              onClick={() => navigateTo("products")}
              className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs shadow-md shadow-orange-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Lihat Promo</span>
            </button>
          </div>
        )}

        {currentPage === "order-success" && (
          <div className="w-full flex items-center justify-between gap-3">
            <button
              onClick={() => navigateTo("orders")}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Package className="w-4 h-4 text-orange-500" />
              <span>Pesanan Saya</span>
            </button>

            <button
              onClick={() => navigateTo("products")}
              className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs shadow-md shadow-orange-500/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Belanja Lagi</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

// ==========================================
// STOREFRONT PAGES
// ==========================================

// --- A. HOME PAGE ---
const HomePage: React.FC = () => {
  const { navigateTo, setSelectedCategory, categories, products, isDbLive } = useApp();

  return (
    <div className="space-y-10 pb-12">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white p-6 sm:p-12 shadow-2xl min-h-[320px] flex items-center">
        <div className="absolute inset-0 z-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1400')] bg-cover bg-center" />
        <div className="relative z-10 max-w-xl space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-500/20 border border-orange-500/40 text-orange-400 rounded-full text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Resmi Duitku POP & Supabase
          </span>
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight leading-none text-white">
            Curated Gear for Modern Lifestyle.
          </h1>
          <p className="text-slate-300 text-xs sm:text-base leading-relaxed">
            Koleksi produk berkualitas dengan sistem pembayaran instan terintegrasi Duitku POP (QRIS, VA Bank & E-Wallet).
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => navigateTo("products")}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/30 transition-all flex items-center gap-2 text-xs sm:text-sm cursor-pointer"
            >
              Belanja Sekarang <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Horizontal Scroll */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Kategori Pilihan</h2>
          <button
            onClick={() => navigateTo("products")}
            className="text-xs font-semibold text-orange-600 hover:underline cursor-pointer"
          >
            Lihat Semua
          </button>
        </div>
        <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.name);
                navigateTo("category");
              }}
              className="flex flex-col items-center gap-2 group flex-shrink-0 cursor-pointer"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-800 group-hover:border-orange-500 transition-all shadow-sm">
                <img
                  src={cat.banner}
                  alt={cat.name}
                  className="w-full h-full object-cover rounded-xl group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-orange-600">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Value Propositions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
          <div className="p-2.5 bg-orange-100 dark:bg-orange-950 text-orange-600 rounded-xl">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white">Gratis Ongkir Kilat</h4>
            <p className="text-[11px] text-slate-500">Seluruh wilayah Indonesia</p>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
          <div className="p-2.5 bg-orange-100 dark:bg-orange-950 text-orange-600 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white">Pembayaran Aman Duitku</h4>
            <p className="text-[11px] text-slate-500">QRIS, Virtual Account & Kartu</p>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
          <div className="p-2.5 bg-orange-100 dark:bg-orange-950 text-orange-600 rounded-xl">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white">Supabase Cloud Database</h4>
            <p className="text-[11px] text-slate-500">Real-time sinkronisasi pesanan</p>
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">Produk Unggulan</h2>
            <p className="text-xs text-slate-500">Koleksi terlaris dengan rating tertinggi</p>
          </div>
          <button
            onClick={() => navigateTo("products")}
            className="text-xs font-semibold text-orange-600 hover:underline cursor-pointer"
          >
            Lihat Semua →
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
};

// --- B. PRODUCT LISTING PAGE ---
const ProductListingPage: React.FC = () => {
  const { selectedCategory, setSelectedCategory, products, categories } = useApp();
  const [priceRange, setPriceRange] = useState<number>(5000000);

  const filtered = products.filter((p) => {
    const catMatch = selectedCategory === "All" || p.category === selectedCategory;
    const priceMatch = p.price <= priceRange;
    return catMatch && priceMatch;
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            {selectedCategory === "All" ? "Katalog Lengkap" : selectedCategory}
          </h1>
          <p className="text-xs text-slate-500">Menampilkan {filtered.length} produk</p>
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {["All", ...categories.map((c) => c.name)].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Content */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
          <p className="text-sm text-slate-500">Tidak ada produk yang sesuai dengan filter.</p>
          <button
            onClick={() => {
              setSelectedCategory("All");
              setPriceRange(5000000);
            }}
            className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
};

// --- C. PRODUCT DETAIL PAGE ---
const ProductDetailPage: React.FC = () => {
  const {
    selectedProduct,
    products,
    navigateTo,
    selectedColor,
    setSelectedColor,
    selectedSize,
    setSelectedSize,
    selectedQuantity: qty,
    setSelectedQuantity: setQty
  } = useApp();

  const product = selectedProduct || products[0];
  const [selectedImg, setSelectedImg] = useState<string>(product?.images[0] || "");
  const relatedProducts = products.filter((item) => item.id !== product?.id).slice(0, 4);
  const stock = Math.max(0, Number(product?.stock) || 0);

  useEffect(() => {
    if (product && product.images && product.images.length > 0) {
      setSelectedImg(product.images[0]);
    }
  }, [product?.id]);

  if (!product) return null;

  return (
    <div className="space-y-8 pb-28">
      {/* Product Header */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => navigateTo("products")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateTo("cart")}
            aria-label="Open cart"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product Gallery + Product Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
        <section aria-label="Product gallery" className="space-y-3">
          <div className="aspect-square rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
            <img src={selectedImg || product.images[0]} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            {product.images.map((img, index) => (
              <button
                key={img}
                onClick={() => setSelectedImg(img)}
                aria-label={`Lihat gambar ${index + 1}`}
                className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer ${
                  selectedImg === img ? "border-orange-500" : "border-transparent opacity-70"
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </section>

        <section aria-label="Product information" className="space-y-5">
          <div className="space-y-2">
            <span className="inline-flex px-2.5 py-1 bg-orange-100 dark:bg-orange-950 text-orange-600 rounded-md text-[11px] font-semibold">
              {product.category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white leading-tight">
              {product.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500">
              <span className="flex items-center gap-1 text-amber-500 font-semibold">
                <Star className="w-4 h-4 fill-current" /> {product.rating}
              </span>
              <span>({product.reviewCount} ulasan)</span>
              <span className={stock > 0 ? "text-emerald-600 font-semibold" : "text-red-500 font-semibold"}>
                {stock > 0 ? `Tersedia · ${stock} unit` : "Stok Habis"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-semibold text-slate-900 dark:text-white">{formatIDR(product.price)}</span>
            {product.originalPrice > product.price && (
              <span className="text-sm text-slate-400 line-through">{formatIDR(product.originalPrice)}</span>
            )}
          </div>

          {/* Product Variants */}
          <div className="space-y-4">
            {product.colors?.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Warna: {selectedColor || product.colors[0]}
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        selectedColor === color || (!selectedColor && color === product.colors[0])
                          ? "border-orange-500 bg-orange-50 dark:bg-orange-950/40 text-orange-600"
                          : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {product.sizes?.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Ukuran / Pilihan: {selectedSize || product.sizes[0]}
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        selectedSize === size || (!selectedSize && size === product.sizes[0])
                          ? "border-orange-500 bg-orange-50 dark:bg-orange-950/40 text-orange-600"
                          : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Jumlah Pembelian</label>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl p-1 bg-white dark:bg-slate-900">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  disabled={qty <= 1}
                  className="p-1.5 text-slate-600 disabled:opacity-40 cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 font-semibold text-xs tabular-nums">{qty}</span>
                <button
                  onClick={() => setQty(Math.min(Math.max(stock, 1), qty + 1))}
                  disabled={qty >= stock || stock === 0}
                  className="p-1.5 text-slate-600 disabled:opacity-40 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-[11px] text-slate-400">Maksimal {stock} unit</span>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/70 p-4 space-y-1">
            <p className="text-[11px] text-slate-500">Subtotal ({qty} barang)</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">{formatIDR(product.price * qty)}</p>
          </div>
        </section>
      </div>

      {/* Product Description */}
      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Deskripsi Produk</h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{product.description}</p>
      </section>

      {/* Specifications */}
      {product.specs?.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Spesifikasi Utama</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {product.specs.map((spec) => (
              <li
                key={spec}
                className="flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-900 px-3 py-3 text-xs text-slate-600 dark:text-slate-300"
              >
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" /> {spec}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Produk Terkait</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {relatedProducts.map((item) => (
              <button
                key={item.id}
                onClick={() => navigateTo("product-detail", item)}
                className="text-left group space-y-2 cursor-pointer"
              >
                <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">
                  {item.name}
                </span>
                <span className="block text-xs font-semibold text-slate-900 dark:text-white">
                  {formatIDR(item.price)}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

// --- D. WISHLIST PAGE ---
const WishlistPage: React.FC = () => {
  const { wishlist, products } = useApp();
  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="space-y-6 pb-12">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Wishlist & Favorit Saya</h1>

      {wishlistedProducts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
          <Heart className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-sm text-slate-500">Wishlist Anda masih kosong.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {wishlistedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
};

// --- E. CART PAGE ---
const CartPage: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, cartTotal, navigateTo } = useApp();

  if (cart.length === 0) {
    return (
      <div className="text-center py-20 max-w-sm mx-auto space-y-4">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <ShoppingCart className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Keranjang Anda Kosong</h2>
        <p className="text-xs text-slate-500">Jelajahi produk kami dan temukan barang impian Anda.</p>
        <button
          onClick={() => navigateTo("products")}
          className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-orange-500/20 cursor-pointer"
        >
          Mulai Belanja
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Keranjang Belanja</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Item List */}
        <div className="lg:col-span-2 space-y-3">
          {cart.map((item, idx) => (
            <div
              key={idx}
              className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex gap-4 items-center"
            >
              <img
                src={item.product.images[0]}
                alt={item.product.name}
                className="w-16 h-16 object-cover rounded-xl bg-slate-100"
              />
              <div className="flex-1 space-y-1">
                <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">
                  {item.product.name}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {item.selectedColor && `Warna: ${item.selectedColor}`}
                  {item.selectedSize && ` · Ukuran: ${item.selectedSize}`}
                </p>
                <p className="text-xs font-semibold text-orange-600">{formatIDR(item.product.price)}</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-lg p-0.5">
                  <button
                    onClick={() => updateQuantity(idx, -1)}
                    className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="px-2 text-xs font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(idx, 1)}
                    className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <button
                  onClick={() => removeFromCart(idx)}
                  className="p-1.5 text-slate-400 hover:text-red-500 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4 h-fit">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Ringkasan Belanja</h3>
          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex justify-between">
              <span>Total Harga Produk</span>
              <span className="font-semibold text-slate-900 dark:text-white">{formatIDR(cartTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Ongkos Kirim Kilat</span>
              <span className="text-emerald-600 font-semibold">GRATIS</span>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex justify-between text-sm font-semibold text-slate-900 dark:text-white">
              <span>Total Tagihan</span>
              <span className="text-orange-600">{formatIDR(cartTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- F. CHECKOUT PAGE (Integrated with Duitku POP) ---
const CheckoutPage: React.FC = () => {
  const { cartTotal, cart, customerInfo, setCustomerInfo, handleDuitkuCheckout, isPaymentProcessing } = useApp();

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Checkout Pesanan</h1>
        <p className="text-xs text-slate-500 mt-1">
          Lengkapi data pengiriman dan selesaikan pembayaran resmi dengan Duitku POP.
        </p>
      </div>

      {/* Customer & Shipping Form */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <MapPin className="w-4 h-4 text-orange-500" /> Informasi Pengiriman
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={customerInfo.name}
              onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-orange-500"
              placeholder="Contoh: Alex Johnson"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              No. Handphone / WhatsApp
            </label>
            <input
              type="text"
              value={customerInfo.phone}
              onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-orange-500"
              placeholder="081234567890"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Email (untuk bukti transaksi Duitku)
            </label>
            <input
              type="email"
              value={customerInfo.email}
              onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-orange-500"
              placeholder="alex@example.com"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Alamat Lengkap Pengiriman
            </label>
            <textarea
              rows={2}
              value={customerInfo.address}
              onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-orange-500 resize-none"
              placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan, kota, kode pos"
            />
          </div>
        </div>
      </div>

      {/* Duitku POP Payment Method Gateway */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-orange-500" /> Metode Pembayaran Otomatis
          </h3>
          <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded-full">
            Duitku POP Resmi
          </span>
        </div>

        <div className="p-4 rounded-xl border-2 border-orange-500 bg-orange-50/40 dark:bg-orange-950/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500 ring-4 ring-orange-200 dark:ring-orange-950" />
              <span className="text-xs font-semibold text-slate-900 dark:text-white">
                Duitku Payment Gateway (POP Instant)
              </span>
            </div>
            <span className="text-[10px] text-orange-600 font-bold uppercase tracking-wider">
              checkout.process
            </span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
            Mendukung pembayaran instan dengan konfirmasi otomatis:
          </p>
          <div className="flex flex-wrap gap-1.5 text-[10px] font-medium text-slate-600 dark:text-slate-300">
            <span className="px-2 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">QRIS (GoPay, OVO, Dana, LinkAja)</span>
            <span className="px-2 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">BCA Virtual Account</span>
            <span className="px-2 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">Mandiri / BRI / BNI VA</span>
            <span className="px-2 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">Kartu Kredit / Debit Visa & Mastercard</span>
          </div>
        </div>
      </div>

      {/* Cart Summary Card */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3">
        <h4 className="text-xs font-semibold text-slate-900 dark:text-white">Barang yang dibeli ({cart.length})</h4>
        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {cart.map((item, idx) => (
            <div key={idx} className="py-2 flex justify-between items-center">
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{item.product.name}</p>
                <p className="text-[10px] text-slate-400">
                  {item.quantity} x {formatIDR(item.product.price)}
                </p>
              </div>
              <span className="font-semibold text-slate-900 dark:text-white">
                {formatIDR(item.product.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Total & Action */}
      <div className="p-5 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] text-slate-400">Total Tagihan Final</p>
          <p className="text-2xl font-bold text-orange-400">{formatIDR(cartTotal)}</p>
        </div>

        <button
          onClick={handleDuitkuCheckout}
          disabled={isPaymentProcessing || cart.length === 0}
          className="w-full sm:w-auto px-7 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold text-xs shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {isPaymentProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Membuka Duitku POP...</span>
            </>
          ) : (
            <>
              <Shield className="w-4 h-4" />
              <span>Bayar Sekarang via Duitku POP</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// --- G. ORDER SUCCESS PAGE ---
const OrderSuccessPage: React.FC = () => {
  const { activeOrder, navigateTo } = useApp();

  return (
    <div className="max-w-md mx-auto text-center py-16 space-y-6">
      <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
        <CheckCircle className="w-10 h-10" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Pembayaran Sukses!</h1>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          Terima kasih atas pesanan Anda. Transaksi Anda telah diverifikasi otomatis oleh Duitku.
        </p>
      </div>

      {activeOrder && (
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-left space-y-3 text-xs">
          <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="text-slate-500">Nomor Pesanan</span>
            <span className="font-semibold text-slate-900 dark:text-white">{activeOrder.merchantOrderId}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="text-slate-500">Duitku Reference</span>
            <span className="font-mono font-semibold text-orange-600">{activeOrder.duitkuReference || "-"}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="text-slate-500">Status Pembayaran</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold text-[10px]">
              {activeOrder.status}
            </span>
          </div>
          <div className="flex justify-between pt-1">
            <span className="text-slate-500">Total Dibayar</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm">{formatIDR(activeOrder.total)}</span>
          </div>
        </div>
      )}

      <div className="flex gap-3 justify-center pt-2">
        <button
          onClick={() => navigateTo("orders")}
          className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
        >
          Lihat Pesanan
        </button>
        <button
          onClick={() => navigateTo("products")}
          className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-md shadow-orange-500/20 cursor-pointer"
        >
          Belanja Lagi
        </button>
      </div>
    </div>
  );
};

// --- H. ORDERS PAGE ---
const OrdersPage: React.FC = () => {
  const { orders, navigateTo, setActiveOrder, triggerToast, setOrders } = useApp();

  const handlePayPendingOrder = (ord: Order) => {
    if (!ord.duitkuReference) {
      triggerToast("Nomor referensi Duitku belum tersedia.");
      return;
    }

    processDuitkuPayment(ord.duitkuReference, {
      onSuccess: async () => {
        try {
          await supabase
            .from("orders")
            .update({ payment_status: "PAID" })
            .eq("merchant_order_id", ord.merchantOrderId);
        } catch {}
        setOrders((prev) =>
          prev.map((o) => (o.merchantOrderId === ord.merchantOrderId ? { ...o, status: "PAID" } : o))
        );
        triggerToast("Pembayaran berhasil dikonfirmasi!");
      },
      onPending: () => triggerToast("Menunggu konfirmasi pembayaran."),
      onError: () => triggerToast("Pembayaran dibatalkan."),
      onClose: () => triggerToast("Popup pembayaran ditutup.")
    });
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Riwayat Transaksi</h1>
          <p className="text-xs text-slate-500">Status pesanan dan pelacakan pembayaran Duitku</p>
        </div>
        <button
          onClick={() => navigateTo("products")}
          className="text-xs font-semibold text-orange-600 hover:underline cursor-pointer"
        >
          + Belanja Baru
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
          <Package className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-sm text-slate-500">Belum ada riwayat transaksi.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => {
            const isPaid = ord.status === "PAID";
            const isPending = ord.status === "PENDING";

            return (
              <div
                key={ord.id}
                className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-sm"
              >
                <div className="flex justify-between items-center text-xs border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white">{ord.merchantOrderId}</span>
                    <span className="text-[11px] text-slate-400">· {ord.date}</span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      isPaid
                        ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-600"
                        : isPending
                        ? "bg-amber-100 dark:bg-amber-950 text-amber-600"
                        : "bg-red-100 dark:bg-red-950 text-red-600"
                    }`}
                  >
                    {ord.status}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {ord.items.length > 0
                        ? `${ord.items[0].product.name} ${
                            ord.items.length > 1 ? `(+${ord.items.length - 1} produk lainnya)` : ""
                          }`
                        : "Paket Belanja"}
                    </p>
                    {ord.duitkuReference && (
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Ref: {ord.duitkuReference}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {formatIDR(ord.total)}
                    </span>

                    {isPending && (
                      <button
                        onClick={() => handlePayPendingOrder(ord)}
                        className="px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
                      >
                        Bayar Duitku POP
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setActiveOrder(ord);
                        navigateTo("order-detail", ord);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                      title="Lihat Detail"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// --- H2. ORDER DETAIL PAGE ---
const OrderDetailPage: React.FC = () => {
  const { activeOrder, navigateTo } = useApp();

  if (!activeOrder) {
    return (
      <div className="text-center py-16 space-y-3">
        <p className="text-sm text-slate-500">Pesanan tidak ditemukan.</p>
        <button
          onClick={() => navigateTo("orders")}
          className="px-4 py-2 bg-orange-500 text-white text-xs font-semibold rounded-xl cursor-pointer"
        >
          Kembali ke Riwayat
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Detail Transaksi</h1>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            activeOrder.status === "PAID"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {activeOrder.status}
        </span>
      </div>

      <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="grid grid-cols-2 gap-3 text-xs border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <p className="text-slate-400 text-[11px]">Merchant Order ID</p>
            <p className="font-semibold text-slate-900 dark:text-white">{activeOrder.merchantOrderId}</p>
          </div>
          <div>
            <p className="text-slate-400 text-[11px]">Tanggal Pemesanan</p>
            <p className="font-semibold text-slate-900 dark:text-white">{activeOrder.date}</p>
          </div>
          <div>
            <p className="text-slate-400 text-[11px]">Metode Pembayaran</p>
            <p className="font-semibold text-slate-900 dark:text-white">{activeOrder.paymentMethod || "Duitku POP"}</p>
          </div>
          <div>
            <p className="text-slate-400 text-[11px]">Duitku Reference</p>
            <p className="font-mono font-semibold text-orange-600">{activeOrder.duitkuReference || "-"}</p>
          </div>
        </div>

        {/* Customer & Address */}
        <div className="space-y-1 text-xs">
          <p className="font-semibold text-slate-900 dark:text-white">Penerima & Alamat</p>
          <p className="text-slate-600 dark:text-slate-400">
            {activeOrder.customerName} · {activeOrder.customerPhone}
          </p>
          <p className="text-slate-500 text-[11px]">{activeOrder.customerAddress}</p>
        </div>

        {/* Items */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs font-semibold text-slate-900 dark:text-white">Daftar Barang</p>
          {activeOrder.items.map((item, i) => (
            <div key={i} className="flex justify-between text-xs py-1">
              <div>
                <p className="font-medium text-slate-800 dark:text-slate-200">{item.product.name}</p>
                <p className="text-[10px] text-slate-400">
                  {item.quantity} x {formatIDR(item.product.price)}
                </p>
              </div>
              <span className="font-semibold text-slate-900 dark:text-white">
                {formatIDR(item.product.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-sm font-semibold">
          <span>Total Pembayaran</span>
          <span className="text-orange-600">{formatIDR(activeOrder.total)}</span>
        </div>
      </div>
    </div>
  );
};

// --- I. PROFILE GUEST PAGE (Wishlist button moved here per Req #4) ---
const ProfileGuestPage: React.FC = () => {
  const { navigateTo, wishlist, orders } = useApp();

  return (
    <div className="max-w-md mx-auto space-y-6 pb-12">
      <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center space-y-4">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto flex items-center justify-center">
          <User className="w-9 h-9 text-slate-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Guest Account</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Alex Johnson (Customer)</p>
        </div>

        {/* Quick Shortcut Buttons in Profile (Wishlist here per requirement #4) */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {/* Wishlist Button Card */}
          <button
            onClick={() => navigateTo("wishlist")}
            className="p-3.5 bg-red-50/70 hover:bg-red-100/70 dark:bg-red-950/30 dark:hover:bg-red-950/50 rounded-2xl border border-red-200/60 dark:border-red-900/40 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between text-red-600 dark:text-red-400 mb-1.5">
              <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/40 group-hover:scale-110 transition-transform">
                <Heart className="w-4 h-4 fill-red-500 text-red-500" />
              </div>
              <span className="text-xs font-semibold bg-red-500 text-white px-2 py-0.5 rounded-full">
                {wishlist.length}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-900 dark:text-white">Wishlist</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {wishlist.length === 0 ? "0 item tersimpan" : `${wishlist.length} produk favorit`}
            </p>
          </button>

          {/* Orders Button Card */}
          <button
            onClick={() => navigateTo("orders")}
            className="p-3.5 bg-orange-50/70 hover:bg-orange-100/70 dark:bg-orange-950/30 dark:hover:bg-orange-950/50 rounded-2xl border border-orange-200/60 dark:border-orange-900/40 text-left transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between text-orange-600 dark:text-orange-400 mb-1.5">
              <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-900/40 group-hover:scale-110 transition-transform">
                <Package className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-xs font-semibold bg-orange-500 text-white px-2 py-0.5 rounded-full">
                {orders.length}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-900 dark:text-white">Pesanan Saya</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {orders.length === 0 ? "Belum ada pesanan" : `${orders.length} transaksi`}
            </p>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold overflow-hidden">
        {/* Wishlist Menu Row */}
        <button
          onClick={() => navigateTo("wishlist")}
          className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-500 flex items-center justify-center">
              <Heart className="w-4 h-4 fill-red-500 text-red-500" />
            </div>
            <div>
              <span className="text-slate-900 dark:text-white font-semibold">Wishlist & Favorit</span>
              <p className="text-[10px] text-slate-400 font-normal">
                {wishlist.length > 0 ? `${wishlist.length} item tersimpan` : "Lihat barang yang Anda sukai"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {wishlist.length > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-semibold rounded-full px-2 py-0.5">
                {wishlist.length}
              </span>
            )}
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        {/* My Orders Menu Row */}
        <button
          onClick={() => navigateTo("orders")}
          className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-500 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-900 dark:text-white font-semibold">Riwayat Pesanan</span>
              <p className="text-[10px] text-slate-400 font-normal">Status pembayaran & pengiriman</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Notifications Menu Row */}
        <button
          onClick={() => navigateTo("notifications")}
          className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-900 dark:text-white font-semibold">Notifikasi</span>
              <p className="text-[10px] text-slate-400 font-normal">Pemberitahuan & promo terbaru</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};

// --- J. NOTIFICATIONS PAGE ---
const NotificationsPage: React.FC = () => {
  const { notifications } = useApp();

  return (
    <div className="max-w-md mx-auto space-y-4 pb-12">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Notifikasi</h1>
      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-1"
          >
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white">{n.title}</h4>
            <p className="text-[11px] text-slate-500">{n.message}</p>
            <span className="text-[9px] text-slate-400">{n.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// STANDALONE PAGE CONTROLLER
// ==========================================

const StandalonePage: React.FC = () => {
  const { currentPage, isLoading } = useApp();

  if (isLoading) return null;

  let page: React.ReactNode = null;
  switch (currentPage) {
    case "product-detail":
      page = <ProductDetailPage />;
      break;
    case "checkout":
      page = <CheckoutPage />;
      break;
    case "order-success":
      page = <OrderSuccessPage />;
      break;
    case "wishlist":
      page = <WishlistPage />;
      break;
    case "cart":
      page = <CartPage />;
      break;
    case "orders":
      page = <OrdersPage />;
      break;
    case "order-detail":
      page = <OrderDetailPage />;
      break;
    case "notifications":
      page = <NotificationsPage />;
      break;
    default:
      return null;
  }

  if (!page) return null;

  return (
    <main
      id="main-content-area"
      className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto"
    >
      {page}
    </main>
  );
};

// ==========================================
// MAIN CONTENT CONTROLLER
// ==========================================

const MainContent: React.FC = () => {
  const { currentPage, isLoading } = useApp();

  if (isLoading) {
    return (
      <main
        id="main-content-area"
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto"
      >
        <ProductGridSkeleton count={8} />
      </main>
    );
  }

  switch (currentPage) {
    case "home":
      return (
        <main
          id="main-content-area"
          className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto"
        >
          <HomePage />
        </main>
      );
    case "category":
    case "products":
    case "search":
      return (
        <main
          id="main-content-area"
          className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto"
        >
          <ProductListingPage />
        </main>
      );
    case "profile":
    case "profile-guest":
      return (
        <main
          id="main-content-area"
          className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto"
        >
          <ProfileGuestPage />
        </main>
      );
    case "product-detail":
    case "checkout":
    case "order-success":
    case "wishlist":
    case "cart":
    case "orders":
    case "order-detail":
    case "notifications":
      return null;
    default:
      return (
        <main
          id="main-content-area"
          className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto"
        >
          <HomePage />
        </main>
      );
  }
};

// ==========================================
// APPSHELL MAIN CONTROLLER
// ==========================================

const AppShell: React.FC = () => {
  const { toastMessage, currentPage } = useApp();
  const isStandalone = STANDALONE_PAGES.includes(currentPage);

  return (
    <div className="h-[100dvh] w-full flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans select-none touch-manipulation">
      <Header />
      <MainContent />
      <StandalonePage />
      {isStandalone ? <BottomActionBar /> : <BottomNavigation />}

      {/* Global Toast */}
      {toastMessage && (
        <div className="fixed bottom-20 right-4 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
