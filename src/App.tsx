import React, { useState, useEffect, createContext, useContext } from "react";
import {
  ShoppingCart,
  Heart,
  Search,
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
  Filter,
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
  Eye
} from "lucide-react";

// ==========================================
// TYPES & INTERFACES (JS Mock Definitions)
// ==========================================

const MOCK_CATEGORIES = [
  { id: "cat-1", name: "Fashion", slug: "fashion", icon: "Shirt", banner: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=1200" },
  { id: "cat-2", name: "Electronics", slug: "electronics", icon: "Smartphone", banner: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1200" },
  { id: "cat-3", name: "Beauty", slug: "beauty", icon: "Sparkles", banner: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=1200" },
  { id: "cat-4", name: "Home & Living", slug: "home-living", icon: "Home", banner: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=1200" },
  { id: "cat-5", name: "Sports", slug: "sports", icon: "Activity", banner: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=1200" },
  { id: "cat-6", name: "Accessories", slug: "accessories", icon: "Watch", banner: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1200" }
];

const MOCK_PRODUCTS = [
  {
    id: "prod-1",
    name: "Aura Noise-Canceling Wireless Headphones Pro",
    slug: "aura-wireless-headphones-pro",
    brand: "Aura Audio",
    category: "Electronics",
    description: "Premium over-ear wireless headphones engineered with hybrid active noise cancellation, 30-hour playback, custom acoustic drivers, and spatial audio calibration.",
    price: 2499000,
    originalPrice: 3299000,
    discount: 24,
    rating: 4.9,
    reviewCount: 312,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=800"
    ],
    colors: ["Matte Black", "Silver Quartz", "Navy Blue"],
    sizes: ["Standard"],
    stock: 14,
    soldCount: 840,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    specs: ["Active Noise Cancellation", "30 Hours Battery", "Bluetooth 5.3", "Custom EQ App"]
  },
  {
    id: "prod-2",
    name: "Minimalist Leather Smartwatch Gen-4",
    slug: "minimalist-leather-smartwatch",
    brand: "Chronos",
    category: "Electronics",
    description: "Sleek biometric smartwatch featuring AMOLED touch screen, heart rate & SpO2 tracking, GPS, 50m water resistance, and genuine Italian leather strap.",
    price: 1850000,
    originalPrice: 2200000,
    discount: 15,
    rating: 4.7,
    reviewCount: 184,
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=800"
    ],
    colors: ["Tan Brown", "Midnight Black"],
    sizes: ["40mm", "44mm"],
    stock: 9,
    soldCount: 410,
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    specs: ["OLED Always-On", "Heart & ECG Sensor", "5 ATM Waterproof", "7-Day Battery Life"]
  },
  {
    id: "prod-3",
    name: "Urban Explorer Ergonomic 25L Backpack",
    slug: "urban-explorer-backpack",
    brand: "NORDIC",
    category: "Fashion",
    description: "Weatherproof rolltop city backpack featuring 16-inch padded laptop sleeve, quick-access passport pocket, and breathable memory foam back panel.",
    price: 790000,
    originalPrice: 1100000,
    discount: 28,
    rating: 4.8,
    reviewCount: 96,
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&q=80&w=800"
    ],
    colors: ["Charcoal Slate", "Olive Green", "Desert Sand"],
    sizes: ["One Size (25L)"],
    stock: 22,
    soldCount: 630,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    specs: ["Waterproof Cordura", "Fits 16-inch Laptop", "Luggage Pass-through", "YKK Zippers"]
  },
  {
    id: "prod-4",
    name: "Heavyweight Organic Cotton Oversized Hoodie",
    slug: "heavyweight-cotton-hoodie",
    brand: "KITH & CO",
    category: "Fashion",
    description: "Crafted from 450 GSM organic French terry cotton. Double-layered hood, dropped shoulders, and pre-shrunk finish for long-lasting relaxed aesthetic.",
    price: 480000,
    originalPrice: 600000,
    discount: 20,
    rating: 4.6,
    reviewCount: 142,
    images: [
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&q=80&w=800"
    ],
    colors: ["Washed Off-White", "Charcoal Gray", "Sage Green"],
    sizes: ["S", "M", "L", "XL"],
    stock: 35,
    soldCount: 920,
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    specs: ["100% Organic Cotton", "450 GSM Fleece", "Pre-shrunk", "Ribbed Cuffs"]
  },
  {
    id: "prod-5",
    name: "Ceramic Pour-Over Coffee Dripper Set",
    slug: "ceramic-pour-over-coffee-set",
    brand: "KONO Studio",
    category: "Home & Living",
    description: "Handcrafted ceramic V60 style pour-over dripper complete with heat-resistant 700ml glass carafe and precision walnut wood stand.",
    price: 649000,
    originalPrice: 799000,
    discount: 18,
    rating: 4.9,
    reviewCount: 215,
    images: [
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=800"
    ],
    colors: ["Matte White", "Japanese Black Ceramic"],
    sizes: ["600ml / 2-4 Cups"],
    stock: 11,
    soldCount: 540,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    specs: ["High-Fired Ceramic", "Borosilicate Carafe", "Includes 40 Paper Filters", "Dishwasher Safe"]
  },
  {
    id: "prod-6",
    name: "Botanical Hydrating Facial Essence 150ml",
    slug: "botanical-hydrating-facial-essence",
    brand: "LUMINA Skincare",
    category: "Beauty",
    description: "Nourishing facial treatment essence formulated with green tea ferment, hyaluronic acid, and niacinamide for radiant skin elasticity.",
    price: 320000,
    originalPrice: 420000,
    discount: 23,
    rating: 4.8,
    reviewCount: 380,
    images: [
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800"
    ],
    colors: ["Standard Bottle"],
    sizes: ["150ml"],
    stock: 45,
    soldCount: 1200,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    specs: ["Cruelty-Free", "Dermatologist Tested", "Alcohol-Free", "Vegan Certified"]
  },
  {
    id: "prod-7",
    name: "Pro Performance Non-Slip Yoga Mat 6mm",
    slug: "pro-performance-yoga-mat",
    brand: "ZENFIT",
    category: "Sports",
    description: "Eco-friendly natural tree rubber yoga mat with laser-etched alignment guides, superior grip density, and antimicrobial surface coat.",
    price: 520000,
    originalPrice: 650000,
    discount: 20,
    rating: 4.7,
    reviewCount: 110,
    images: [
      "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&q=80&w=800"
    ],
    colors: ["Ocean Teal", "Deep Plum", "Midnight Ash"],
    sizes: ["183cm x 68cm x 6mm"],
    stock: 18,
    soldCount: 310,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    specs: ["Natural Rubber", "Antimicrobial Layer", "Laser Alignment", "Includes Carrying Strap"]
  },
  {
    id: "prod-8",
    name: "Polarized Titanium Frame Sunglasses",
    slug: "polarized-titanium-sunglasses",
    brand: "VERVE Eyewear",
    category: "Accessories",
    description: "Ultra-lightweight aerospace titanium frames with UV400 anti-glare polarized lenses. Maximum comfort for outdoor performance and driving.",
    price: 890000,
    originalPrice: 1250000,
    discount: 28,
    rating: 4.9,
    reviewCount: 88,
    images: [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=800"
    ],
    colors: ["Gunmetal Silver", "Gold Amber"],
    sizes: ["Medium Fit"],
    stock: 15,
    soldCount: 270,
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    specs: ["100% UV400 Protection", "16g Titanium Frame", "Anti-Scratch Coating", "Includes Leather Case"]
  }
];

const MOCK_NOTIFICATIONS = [
  { id: "notif-1", title: "Flash Sale Alert! ⚡", message: "Up to 50% discount on Electronics ending tonight at 23:59 WIB.", time: "10 mins ago", read: false, type: "promo" },
  { id: "notif-2", title: "Order Shipped! 🚚", message: "Order #ORD-89213 has been picked up by JNE courier.", time: "2 hours ago", read: false, type: "order" },
  { id: "notif-3", title: "Cashback Received 🪙", message: "Rp 50.000 Store Credit has been added to your account wallet.", time: "1 day ago", read: true, type: "wallet" }
];

// Helper Function: Format Rupiah
const formatIDR = (price) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(price);
};

// ==========================================
// CONTEXT PROVIDER (GLOBAL APP STATE)
// ==========================================

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedProduct, setSelectedProduct] = useState(MOCK_PRODUCTS[0]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  
  // Storage States
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("mystore_cart");
    return saved ? JSON.parse(saved) : [
      { product: MOCK_PRODUCTS[0], quantity: 1, selectedColor: "Matte Black", selectedSize: "Standard" }
    ];
  });
  
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem("mystore_wishlist");
    return saved ? JSON.parse(saved) : [MOCK_PRODUCTS[1].id, MOCK_PRODUCTS[3].id];
  });

  const [orders, setOrders] = useState([
    {
      id: "ORD-98231",
      date: "2026-10-24",
      status: "In Transit",
      total: 2499000,
      items: [{ product: MOCK_PRODUCTS[0], quantity: 1, selectedColor: "Matte Black", selectedSize: "Standard" }],
      trackingNumber: "JNE-9921039102",
      address: "Jl. Jend. Sudirman No. 45, Jakarta Selatan, 12190"
    }
  ]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  // Sync LocalStorage
  useEffect(() => {
    localStorage.setItem("mystore_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("mystore_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // Toast Trigger
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Simulate Page Transitions with Loading Skeleton
  const navigateTo = (page, data = null) => {
    setIsLoading(true);
    if (page === "product-detail" && data) setSelectedProduct(data);
    if (page === "category" && data) setSelectedCategory(data);
    if (page === "order-detail" && data) setActiveOrder(data);

    setTimeout(() => {
      setCurrentPage(page);
      setIsLoading(false);
      // Reset scroll on main
      const mainElem = document.getElementById("main-content-area");
      if (mainElem) mainElem.scrollTop = 0;
    }, 300);
  };

  // Cart Operations
  const addToCart = (product, quantity = 1, color = "", size = "") => {
    const chosenColor = color || (product.colors ? product.colors[0] : "");
    const chosenSize = size || (product.sizes ? product.sizes[0] : "");

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
    triggerToast(`Added "${product.name.slice(0, 20)}..." to cart`);
  };

  const updateQuantity = (index, delta) => {
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

  const removeFromCart = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
    triggerToast("Item removed from cart");
  };

  const toggleWishlist = (productId) => {
    setWishlist((prev) => {
      if (prev.includes(productId)) {
        triggerToast("Removed from Wishlist");
        return prev.filter((id) => id !== productId);
      } else {
        triggerToast("Saved to Wishlist!");
        return [...prev, productId];
      }
    });
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <AppContext.Provider
      value={{
        currentPage,
        navigateTo,
        selectedProduct,
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
        notifications,
        setNotifications,
        triggerToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

const useApp = () => useContext(AppContext);

// ==========================================
// SKELETON LOADING COMPONENTS
// ==========================================

const Skeleton = ({ className = "" }) => (
  <div className={`bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg ${className}`} />
);

const ProductCardSkeleton = () => (
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

const ProductGridSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

// ==========================================
// REUSABLE UI COMPONENTS
// ==========================================

const ProductCard = ({ product }) => {
  const { navigateTo, wishlist, toggleWishlist } = useApp();
  const isWishlisted = wishlist.includes(product.id);

  return (
    <div className="group flex flex-col gap-0.5">
      {/* Product Media */}
      <div className="relative aspect-square rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden cursor-pointer" onClick={() => navigateTo("product-detail", product)}>
        <img
          src={product.images[0]}
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
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all ${
            isWishlisted ? "bg-red-500 text-white" : "bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 hover:bg-white"
          }`}
          aria-label="Wishlist"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
        </button>
      </div>

      {/* Product Info: price above, rating and review count at the bottom */}
      <div className="flex flex-1 flex-col space-y-0.5">
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

        <div className="flex items-center justify-between gap-2 text-[11px]">
          <div
            className="flex items-center gap-0.5 font-semibold text-amber-500"
            aria-label={`Rating ${product.rating} dari 5`}
          >
            <Star className="h-3 w-3 fill-current" />
            <span>{product.rating}</span>
          </div>
          <span
            className="font-medium text-slate-400"
            aria-label={`${product.reviewCount} ulasan`}
          >
            ({product.reviewCount})
          </span>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// HEADER & NAVIGATION COMPONENTS
// ==========================================

const STANDALONE_PAGES = [
  "product-detail",
  "checkout",
  "order-success",
  "wishlist",
  "cart",
  "orders",
  "notifications"
];

const Header = () => {
  const { navigateTo, cartCount, notifications, currentPage } = useApp();
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
      

      {/* Main Bar */}
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
            <span className="text-slate-900 dark:text-white">Storefront<span className="text-orange-500">.</span></span>
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Notifications Icon */}
          <button
            onClick={() => navigateTo("notifications")}
            className="relative p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
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
            className="relative p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
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
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1"
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

const BottomNavigation = () => {
  const { currentPage, navigateTo } = useApp();

  const navItems: { id: string; label: string; icon: any; badge?: number }[] = [
    { id: "home", label: "Home", icon: Home },
    { id: "category", label: "Categories", icon: Grid },
    { id: "profile", label: "Profile", icon: User }
  ];

  return (
    <nav className="flex-shrink-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 py-2 px-4 shadow-lg z-30">
      <div className="max-w-md mx-auto flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id)}
              className={`relative flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
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

const BottomActionBar = () => {
  const {
    currentPage,
    navigateTo,
    selectedProduct,
    addToCart,
    cart,
    cartTotal,
    cartCount,
    wishlist,
    toggleWishlist,
    orders,
    setOrders,
    triggerToast
  } = useApp();

  const isWishlisted = selectedProduct ? wishlist.includes(selectedProduct.id) : false;


      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Checkout</h1>

      <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <MapPin className="w-4 h-4 text-orange-500" /> Shipping Address
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <input
            type="text"
            defaultValue="Alex Johnson"
            className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
            placeholder="Full Name"
          />
          <input
            type="text"
            defaultValue="+62 812-3456-7890"
            className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
            placeholder="Phone Number"
          />
          <input
            type="text"
            defaultValue="Jl. Jend. Sudirman No. 45, Jakarta Selatan"
            className="sm:col-span-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
            placeholder="Address"
          />
        </div>
      </div>

      <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-orange-500" /> Payment Method
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <label className="p-3 border-2 border-orange-500 rounded-xl bg-orange-50/30 dark:bg-orange-950/20 flex items-center gap-2 cursor-pointer">
            <input type="radio" name="pay" defaultChecked className="accent-orange-500" />
            <span className="text-xs font-semibold text-slate-900 dark:text-white">Bank Transfer</span>
          </label>
          <label className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-2 cursor-pointer">
            <input type="radio" name="pay" className="accent-orange-500" />
            <span className="text-xs font-semibold text-slate-900 dark:text-white">GoPay / QRIS</span>
          </label>
        </div>
      </div>

      <div className="p-5 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
        <div>
          <p className="text-[10px] text-slate-400">Total Payment</p>
          <p className="text-xl font-semibold text-orange-400">{formatIDR(cartTotal)}</p>
        </div>
      </div>
    </div>
  );
};

// --- G. ORDER SUCCESS PAGE ---
const OrderSuccessPage = () => {
  const { navigateTo } = useApp();

  return (
    <div className="max-w-md mx-auto text-center py-16 space-y-4">
      <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Order Successful!</h1>
      <p className="text-xs text-slate-500">Thank you for your purchase. We are preparing your shipment.</p>

const OrdersPage = () => {
  const { orders, navigateTo } = useApp();

  return (
    <div className="space-y-6 pb-12">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Order History</h1>
      <div className="space-y-4">
        {orders.map((ord) => (
          <div
            key={ord.id}
            className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3"
          >
            <div className="flex justify-between items-center text-xs border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="font-semibold text-slate-900 dark:text-white">{ord.id}</span>
              <span className="px-2.5 py-0.5 bg-orange-100 dark:bg-orange-950 text-orange-600 rounded-full text-[10px] font-semibold">
                {ord.status}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Date: {ord.date}</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">{formatIDR(ord.total)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- I. PROFILE & NOTIFICATIONS PAGES ---
const ProfileGuestPage = () => {
  const { navigateTo, wishlist, orders } = useApp();

  return (
    <div className="max-w-md mx-auto space-y-6 pb-12">
      <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center space-y-4">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto flex items-center justify-center">
          <User className="w-9 h-9 text-slate-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Guest Profile</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">You are currently browsing as a guest.</p>
        </div>

        {/* Quick Shortcut Buttons in Profile */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {/* Wishlist Button Card */}
          <button
            onClick={() => navigateTo("wishlist")}
            className="p-3.5 bg-red-50/70 hover:bg-red-100/70 dark:bg-red-950/30 dark:hover:bg-red-950/50 rounded-2xl border border-red-200/60 dark:border-red-900/40 text-left transition-all group"
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
              {wishlist.length === 0 ? "0 saved items" : `${wishlist.length} saved product${wishlist.length > 1 ? "s" : ""}`}
            </p>
          </button>

          {/* Orders Button Card */}
          <button
            onClick={() => navigateTo("orders")}
            className="p-3.5 bg-orange-50/70 hover:bg-orange-100/70 dark:bg-orange-950/30 dark:hover:bg-orange-950/50 rounded-2xl border border-orange-200/60 dark:border-orange-900/40 text-left transition-all group"
          >
            <div className="flex items-center justify-between text-orange-600 dark:text-orange-400 mb-1.5">
              <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-900/40 group-hover:scale-110 transition-transform">
                <Package className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-xs font-semibold bg-orange-500 text-white px-2 py-0.5 rounded-full">
                {orders.length}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-900 dark:text-white">My Orders</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {orders.length === 0 ? "No orders" : `${orders.length} active orders`}
            </p>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold overflow-hidden">
        {/* Wishlist Menu Row */}
        <button
          onClick={() => navigateTo("wishlist")}
          className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
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
          className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-500 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-900 dark:text-white font-semibold">My Orders</span>
              <p className="text-[10px] text-slate-400 font-normal">Status pengiriman & riwayat belanja</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Notifications Menu Row */}
        <button
          onClick={() => navigateTo("notifications")}
          className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-900 dark:text-white font-semibold">Notifications</span>
              <p className="text-[10px] text-slate-400 font-normal">Pemberitahuan & promo terbaru</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};

const NotificationsPage = () => {
  const { notifications } = useApp();

  return (
    <div className="max-w-md mx-auto space-y-4 pb-12">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Notifications</h1>
      <div className="space-y-3">
        {notifications.map((n) => (
          <div key={n.id} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-1">
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

const StandalonePage = () => {
  const { currentPage, isLoading } = useApp();

  if (isLoading) return null;

  let page = null;
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
    case "notifications":
      page = <NotificationsPage />;
      break;
    default:
      return null;
  }

  if (!page) return null;

  return (
    <main id="main-content-area" className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
      {page}
    </main>
  );
};

// ==========================================
// MAIN CONTENT CONTROLLER
// ==========================================

const MainContent = () => {
  const { currentPage, isLoading } = useApp();

  if (isLoading) {
    return (
      <main id="main-content-area" className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        <ProductGridSkeleton count={8} />
      </main>
    );
  }

  switch (currentPage) {
    case "home":
      return (
        <main id="main-content-area" className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <HomePage />
        </main>
      );
    case "category":
    case "products":
    case "search":
      return (
        <main id="main-content-area" className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <ProductListingPage />
        </main>
      );
    case "profile":
    case "profile-guest":
      return (
        <main id="main-content-area" className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <ProfileGuestPage />
        </main>
      );
    case "product-detail":
    case "checkout":
    case "order-success":
    case "wishlist":
    case "cart":
    case "orders":
    case "notifications":
      return null;
    default:
      return (
        <main id="main-content-area" className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <HomePage />
        </main>
      );
  }
};

// ==========================================
// APPSHELL MAIN CONTROLLER
// ==========================================

const AppShell = () => {
  const { toastMessage, currentPage } = useApp();
  const isStandalone = STANDALONE_PAGES.includes(currentPage);

  return (
    <div className="h-[100dvh] w-full flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
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
