import React, { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "./lib/supabaseClient";
import { fetchProducts, type StoreProduct } from "./lib/products";
import { readJsonStorage, isStringArray, isCartArray } from "./lib/storage";
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

// Categories are derived from live product records.

const MOCK_NOTIFICATIONS = [
  { id: "notif-1", title: "Flash Sale Alert! ⚡", message: "Up to 50% discount on Electronics ending tonight at 23:59 WIB.", time: "10 mins ago", read: false, type: "promo" },
  { id: "notif-2", title: "Order Shipped! 🚚", message: "Order #ORD-89213 has been picked up by JNE courier.", time: "2 hours ago", read: false, type: "order" },
  { id: "notif-3", title: "Cashback Received 🪙", message: "Rp 50.000 Store Credit has been added to your account wallet.", time: "1 day ago", read: true, type: "wallet" }
];

// Helper Function: Format Rupiah
const SHIPPING_FEE = 52000;

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
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [productLoadError, setProductLoadError] = useState("");
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [checkoutDetails, setCheckoutDetails] = useState({ name: "", phone: "", email: "", address: "" });
  const [activeOrder, setActiveOrder] = useState(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  
  // Storage States
  const [cart, setCart] = useState(() => readJsonStorage("mystore_cart", [], isCartArray));
  const [wishlist, setWishlist] = useState(() => readJsonStorage("mystore_wishlist", [], isStringArray));
  const [orders, setOrders] = useState([]);
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  useEffect(() => {
    let cancelled = false;
    fetchProducts()
      .then((items) => {
        if (cancelled) return;
        setProducts(items);
        setSelectedProduct((current) => current ? items.find((item) => item.id === current.id) ?? items[0] ?? null : items[0] ?? null);
        setCart((current) => current.flatMap((entry) => {
          const product = items.find((item) => item.id === entry.product.id);
          if (!product || !product.isPurchasable || product.stock <= 0) return [];
          return [{ ...entry, product, quantity: Math.min(entry.quantity, product.stock) }];
        }));
        setWishlist((current) => current.filter((id) => items.some((item) => item.id === id)));
        setProductLoadError("");
      })
      .catch((error: unknown) => {
        if (!cancelled) setProductLoadError(error instanceof Error ? error.message : "Unable to load products");
      })
      .finally(() => { if (!cancelled) setIsProductsLoading(false); });
    return () => { cancelled = true; };
  }, []);

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
    if (page === "product-detail" && data) {
      setSelectedProduct(data);
      setSelectedColor(data.colors ? data.colors[0] : "");
      setSelectedSize(data.sizes ? data.sizes[0] : "");
      setSelectedQuantity(1);
    }
    if (page === "category" && data) setSelectedCategory(data);
    if ((page === "order-detail" || page === "order-success") && data) setActiveOrder(data);

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
    const existingItem = cart.find(
      (item) => item.product.id === product.id && item.selectedColor === chosenColor && item.selectedSize === chosenSize
    );
    const nextQuantity = (existingItem?.quantity || 0) + quantity;

    if (!product.isPurchasable || product.stock <= 0) {
      triggerToast("Product is not available for purchase");
      return false;
    }
    if (quantity < 1 || nextQuantity > product.stock) {
      triggerToast(`Maximum available quantity is ${product.stock}`);
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
    triggerToast(`Added "${product.name.slice(0, 20)}..." to cart`);
    return true;
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
  const cartGrandTotal = cartTotal + (cart.length > 0 ? SHIPPING_FEE : 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <AppContext.Provider
      value={{
        currentPage,
        navigateTo,
        selectedProduct,
        products,
        productLoadError,
        isProductsLoading,
        checkoutDetails,
        setCheckoutDetails,
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
        setCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        cartTotal,
        cartGrandTotal,
        cartCount,
        wishlist,
        toggleWishlist,
        orders,
        setOrders,
        activeOrder,
        setActiveOrder,
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
    selectedColor,
    selectedSize,
    selectedQuantity,
    addToCart,
    cart,
    setCart,
    cartTotal,
    cartGrandTotal,
    cartCount,
    checkoutDetails,
    wishlist,
    toggleWishlist,
    orders,
    setOrders,
    setActiveOrder,
    triggerToast
  } = useApp();

  const isWishlisted = selectedProduct ? wishlist.includes(selectedProduct.id) : false;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleCompleteOrder = async () => {
    if (cart.length === 0) { triggerToast("Cart is empty"); navigateTo("products"); return; }
    if (!checkoutDetails.name.trim() || !checkoutDetails.phone.trim() || !checkoutDetails.email.trim() || !checkoutDetails.address.trim()) { triggerToast("Complete all shipping details before checkout"); return; }
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-order", {
        body: { customerName: checkoutDetails.name, customerPhone: checkoutDetails.phone, customerEmail: checkoutDetails.email, shippingAddress: { address: checkoutDetails.address }, items: cart.map((item) => ({ productId: item.product.id, quantity: item.quantity, color: item.selectedColor, size: item.selectedSize })) },
      });
      if (error || !data?.success || !data?.order?.paymentUrl) { triggerToast(data?.error || error?.message || "Backend has not confirmed this order"); return; }
      const confirmedOrder = data.order;
      setActiveOrder(confirmedOrder);
      setOrders((current) => [{ id: confirmedOrder.merchantOrderId, date: new Date().toISOString().slice(0, 10), status: confirmedOrder.status, total: confirmedOrder.amount, items: [...cart], trackingNumber: "", address: checkoutDetails.address }, ...current]);
      setCart([]);
      navigateTo("order-success", confirmedOrder);
    } catch { triggerToast("Checkout failed. No order success was recorded."); }
    finally { setIsSubmitting(false); }
  };

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
                <p className="text-[10px] text-slate-400">Total Price</p>
                <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white leading-none">
                  {formatIDR(selectedProduct.price * selectedQuantity)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
              <button
                onClick={() => addToCart(selectedProduct, selectedQuantity, selectedColor, selectedSize)}
                disabled={!selectedProduct.isPurchasable || selectedProduct.stock <= 0 || selectedQuantity > selectedProduct.stock}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-orange-500 text-orange-600 dark:text-orange-400 font-semibold text-xs hover:bg-orange-50 dark:hover:bg-orange-950/40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>+ Cart</span>
              </button>
              <button
                onClick={() => {
                  const added = addToCart(selectedProduct, selectedQuantity, selectedColor, selectedSize);
                  if (added) navigateTo("checkout");
                }}
                disabled={!selectedProduct.isPurchasable || selectedProduct.stock <= 0 || selectedQuantity > selectedProduct.stock}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-xs shadow-md shadow-orange-500/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Buy Now</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {currentPage === "cart" && (
          <div className="w-full flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] text-slate-400">Total ({cartCount} items)</p>
              <p className="text-base sm:text-lg font-semibold text-orange-600 leading-none">
                {formatIDR(cartGrandTotal)}
              </p>
            </div>

            <button
              onClick={() => navigateTo("checkout")}
              disabled={cart.length === 0}
              className={`px-7 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all ${
                cart.length > 0
                  ? "bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/25 cursor-pointer"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
              }`}
            >
              <span>Proceed to Checkout</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {currentPage === "checkout" && (
          <div className="w-full flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] text-slate-400">Total Payable</p>
              <p className="text-base sm:text-lg font-semibold text-orange-600 leading-none">
                {formatIDR(cartGrandTotal)}
              </p>
            </div>

            <button
              onClick={handleCompleteOrder}
              disabled={isSubmitting}
              className="px-7 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs shadow-md shadow-orange-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>{isSubmitting ? "Processing..." : "Place Order"}</span>
              <Check className="w-4 h-4" />
            </button>
          </div>
        )}

        {currentPage === "wishlist" && (
          <div className="w-full flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] text-slate-400">My Wishlist</p>
              <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                {wishlist.length} saved item{wishlist.length !== 1 ? "s" : ""}
              </p>
            </div>

            <button
              onClick={() => navigateTo("products")}
              className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs shadow-md shadow-orange-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Explore Products</span>
            </button>
          </div>
        )}

        {currentPage === "orders" && (
          <div className="w-full flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] text-slate-400">Order History</p>
              <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                {orders.length} Order{orders.length !== 1 ? "s" : ""}
              </p>
            </div>

            <button
              onClick={() => navigateTo("products")}
              className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs shadow-md shadow-orange-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Continue Shopping</span>
            </button>
          </div>
        )}

        {currentPage === "notifications" && (
          <div className="w-full flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Stay tuned for promo & order alerts
            </p>

            <button
              onClick={() => navigateTo("products")}
              className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs shadow-md shadow-orange-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Explore Deals</span>
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
              <span>My Orders</span>
            </button>

            <button
              onClick={() => navigateTo("products")}
              className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs shadow-md shadow-orange-500/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Shop More</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

// ==========================================
// INDIVIDUAL STOREFRONT PAGES
// ==========================================

// --- A. HOME PAGE ---
const HomePage = () => {
  const { navigateTo, setSelectedCategory, products, isProductsLoading, productLoadError } = useApp();
  const categories: Array<{ id: string; name: string; banner: string }> = [...new Set<string>(products.map((product: StoreProduct) => product.category))].map((name) => ({ id: name, name, banner: products.find((product: StoreProduct) => product.category === name)?.images[0] ?? "" }));

  return (
    <div className="space-y-10 pb-12">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white p-6 sm:p-12 shadow-2xl min-h-[320px] flex items-center">
        <div className="absolute inset-0 z-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1400')] bg-cover bg-center" />
        <div className="relative z-10 max-w-xl space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-500/20 border border-orange-500/40 text-orange-400 rounded-full text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Autumn Tech & Fashion 2026
          </span>
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight leading-none text-white">
            Curated Gear for Modern Lifestyle.
          </h1>
          <p className="text-slate-300 text-xs sm:text-base leading-relaxed">
            Discover precision-engineered electronics, heavy cotton apparel, and artisan lifestyle essentials with fast nationwide delivery.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => navigateTo("products")}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/30 transition-all flex items-center gap-2 text-xs sm:text-sm"
            >
              Shop Collection <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Horizontal Scroll */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Explore Categories</h2>
          <button onClick={() => navigateTo("category")} className="text-xs font-semibold text-orange-600 hover:underline">
            View All
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
              className="flex flex-col items-center gap-2 group flex-shrink-0"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-800 group-hover:border-orange-500 transition-all shadow-sm">
                <img src={cat.banner} alt={cat.name} className="w-full h-full object-cover rounded-xl group-hover:scale-110 transition-transform duration-300" />
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
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white">Free Nationwide Express</h4>
            <p className="text-[11px] text-slate-500">Orders above Rp 500k</p>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
          <div className="p-2.5 bg-orange-100 dark:bg-orange-950 text-orange-600 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white">2-Year Warranty</h4>
            <p className="text-[11px] text-slate-500">Official authentic products</p>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
          <div className="p-2.5 bg-orange-100 dark:bg-orange-950 text-orange-600 rounded-xl">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white">30-Day Easy Return</h4>
            <p className="text-[11px] text-slate-500">Hassle-free money back</p>
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">Featured Selections</h2>
            <p className="text-xs text-slate-500">Handpicked premium items for you</p>
          </div>
          <button onClick={() => navigateTo("products")} className="text-xs font-semibold text-orange-600 hover:underline">
            Explore All →
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {productLoadError ? <p className="col-span-full text-sm text-red-600">{productLoadError}</p> :
            isProductsLoading ? <ProductGridSkeleton count={4} /> :
            products.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </div>
  );
};

// --- B. CATEGORY & PRODUCT LISTING PAGE ---
const ProductListingPage = () => {
  const { selectedCategory, setSelectedCategory, navigateTo, products, isProductsLoading, productLoadError } = useApp();
  const categories: string[] = [...new Set<string>(products.map((product: StoreProduct) => product.category))];
  const [sortBy, setSortBy] = useState("popular");
  const [priceRange, setPriceRange] = useState(5000000);

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
            {selectedCategory === "All" ? "Catalog Overview" : selectedCategory}
          </h1>
          <p className="text-xs text-slate-500">Showing {filtered.length} products</p>
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {["All", ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
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
      {productLoadError ? (
        <div role="alert" className="text-center py-16 text-sm text-red-600">{productLoadError}</div>
      ) : isProductsLoading ? (
        <ProductGridSkeleton count={8} />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
          <p className="text-sm text-slate-500">No products found matching filters.</p>
          <button
            onClick={() => {
              setSelectedCategory("All");
              setPriceRange(5000000);
            }}
            className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-semibold"
          >
            Reset Filters
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
const ProductDetailPage = () => {
  const {
    selectedProduct,
    products,
    navigateTo,
    selectedColor,
    setSelectedColor,
    selectedSize,
    setSelectedSize,
    selectedQuantity: qty,
    setSelectedQuantity: setQty,
    wishlist
  } = useApp();
  const product = selectedProduct ?? products[0];
  const [selectedImg, setSelectedImg] = useState(product?.images?.[0] ?? "");
  const relatedProducts = products.filter((item) => item.id !== product?.id).slice(0, 4);
  useEffect(() => {
    if (product?.images?.[0]) setSelectedImg(product.images[0]);
  }, [product?.id, product?.images]);

  if (!product) return <div className="py-16 text-center text-sm text-slate-500">Product is not available.</div>;

  const isWishlisted = wishlist.includes(product.id);
  const stock = Math.max(0, Number(product.stock) || 0);
  const canPurchase = product.isPurchasable && stock > 0;

  const handleShare = async () => {
    const shareData = { title: product.name, url: window.location.href };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareData.url);
      } else {
        throw new Error("Sharing is unavailable");
      }
    } catch {
      // Keep the page usable when browser sharing is unavailable or dismissed.
    }
  };

  return (
    <div className="space-y-8 pb-28">
      {/* Product Header */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => navigateTo("products")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            aria-label="Share product"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigateTo("cart")}
            aria-label="Open cart"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product Gallery + Product Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
        <section aria-label="Product gallery" className="space-y-3">
          <div className="aspect-square rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
            <img src={selectedImg} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            {product.images.map((img, index) => (
              <button
                key={img}
                onClick={() => setSelectedImg(img)}
                aria-label={`View product image ${index + 1}`}
                aria-pressed={selectedImg === img}
                className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
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
              <span>({product.reviewCount} reviews)</span>
              <span className={product.isPurchasable ? "text-emerald-600 font-semibold" : "text-red-500 font-semibold"}>
                {product.isPurchasable ? "Available for purchase" : "Not available for purchase"}
              </span>
              <span className="text-slate-500">Stock · {stock}</span>
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
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Color: {selectedColor}</label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      aria-pressed={selectedColor === color}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        selectedColor === color
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
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Size / Option: {selectedSize}</label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      aria-pressed={selectedSize === size}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        selectedSize === size
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
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Quantity</label>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl p-1 bg-white dark:bg-slate-900">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  disabled={qty <= 1}
                  aria-label="Decrease quantity"
                  className="p-1.5 text-slate-600 disabled:opacity-40"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 font-semibold text-xs tabular-nums">{qty}</span>
                <button
                  onClick={() => setQty(Math.min(Math.max(stock, 1), qty + 1))}
                  disabled={!canPurchase || qty >= stock || stock === 0}
                  aria-label="Increase quantity"
                  className="p-1.5 text-slate-600 disabled:opacity-40"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-[11px] text-slate-400">Maximum {stock} items</span>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 dark:bg-slate-900/70 p-4 space-y-1">
            <p className="text-[11px] text-slate-500">Subtotal ({qty} item{qty > 1 ? "s" : ""})</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">{formatIDR(product.price * qty)}</p>
          </div>
        </section>
      </div>

      {/* Product Description */}
      <section className="space-y-2">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Product Description</h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{product.description}</p>
      </section>

      {/* Product Specifications */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Product Specifications</h2>
        {product.specs?.length > 0 ? (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {product.specs.map((spec) => (
              <li key={spec} className="flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-900 px-3 py-3 text-xs text-slate-600 dark:text-slate-300">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" /> {spec}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-slate-500">Specifications are not available for this product.</p>
        )}
      </section>

      {/* Product Reviews */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Customer Reviews</h2>
          <span className="text-xs text-slate-500">{product.reviewCount} reviews</span>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-4">
          <div>
            <p className="text-3xl font-semibold text-slate-900 dark:text-white">{product.rating}</p>
            <div className="flex items-center gap-1 text-amber-500"><Star className="w-4 h-4 fill-current" /><span className="text-xs">out of 5</span></div>
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Review Summary</p>
            <p className="text-[11px] text-slate-500">Based on {product.reviewCount} customer ratings</p>
          </div>
        </div>
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 p-4 text-xs text-slate-500">
          Individual review entries are not included in the current product data.
        </div>
      </section>

      {/* Related Products */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Related Products</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {relatedProducts.map((item) => (
            <button
              key={item.id}
              onClick={() => navigateTo("product-detail", item)}
              className="text-left group space-y-2"
            >
              <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">{item.name}</span>
              <span className="block text-xs font-semibold text-slate-900 dark:text-white">{formatIDR(item.price)}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

// --- D. WISHLIST PAGE ---
const WishlistPage = () => {
  const { wishlist, products } = useApp();
  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="space-y-6 pb-12">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">My Saved Wishlist</h1>

      {wishlistedProducts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
          <Heart className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-sm text-slate-500">Your wishlist is currently empty.</p>
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
const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, cartTotal, cartGrandTotal, navigateTo } = useApp();

  if (cart.length === 0) {
    return (
      <div className="text-center py-20 max-w-sm mx-auto space-y-4">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <ShoppingCart className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500">Explore our curated collection and add items to your cart.</p>
        <button
          onClick={() => navigateTo("products")}
          className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-orange-500/20"
        >
          Browse Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Shopping Cart</h1>

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
                <p className="text-[11px] text-slate-400">Color: {item.selectedColor}</p>
                <p className="text-xs font-semibold text-orange-600">{formatIDR(item.product.price)}</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-lg p-0.5">
                  <button onClick={() => updateQuantity(idx, -1)} className="p-1 text-slate-500">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="px-2 text-xs font-semibold">{item.quantity}</span>
                  <button onClick={() => updateQuantity(idx, 1)} className="p-1 text-slate-500">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <button onClick={() => removeFromCart(idx)} className="p-1.5 text-slate-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4 h-fit">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Order Summary</h3>
          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900 dark:text-white">{formatIDR(cartTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Delivery</span>
              <span className="font-semibold text-slate-900 dark:text-white">{formatIDR(SHIPPING_FEE)}</span>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex justify-between text-sm font-semibold text-slate-900 dark:text-white">
              <span>Total Payable</span>
              <span className="text-orange-600">{formatIDR(cartGrandTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- F. CHECKOUT PAGE ---
const CheckoutPage = () => {
  const { cartTotal, cartGrandTotal, checkoutDetails, setCheckoutDetails } = useApp();
  const updateField = (field, value) => setCheckoutDetails((current) => ({ ...current, [field]: value }));

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Checkout</h1>

      <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <MapPin className="w-4 h-4 text-orange-500" /> Shipping Address
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <input
            type="text"
            value={checkoutDetails.name}
            onChange={(event) => updateField("name", event.target.value)}
            autoComplete="name"
            className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
            placeholder="Full Name"
          />
          <input
            type="text"
            value={checkoutDetails.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            autoComplete="tel"
            className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
            placeholder="Phone Number"
          />
          <input
            type="email"
            value={checkoutDetails.email}
            onChange={(event) => updateField("email", event.target.value)}
            autoComplete="email"
            className="sm:col-span-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
            placeholder="Email"
          />
          <input
            type="text"
            value={checkoutDetails.address}
            onChange={(event) => updateField("address", event.target.value)}
            autoComplete="street-address"
            className="sm:col-span-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
            placeholder="Shipping address"
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
          <div className="space-y-1 text-xs text-slate-300">
            <p>Subtotal: {formatIDR(cartTotal)}</p>
            <p>Shipping: {formatIDR(SHIPPING_FEE)}</p>
            <p className="pt-1 text-xl font-semibold text-orange-400">Total: {formatIDR(cartGrandTotal)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- G. ORDER SUCCESS PAGE ---
const OrderSuccessPage = () => {
  const { activeOrder } = useApp();
  return (
    <div className="max-w-md mx-auto text-center py-16 space-y-4">
      <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Order Created — Payment Pending</h1>
      <p className="text-xs text-slate-500">Your order is saved. Complete payment to confirm your purchase.</p>
      {activeOrder?.merchantOrderId && <p className="text-xs font-semibold">Order: {activeOrder.merchantOrderId}</p>}
      {activeOrder?.paymentUrl && <a href={activeOrder.paymentUrl} rel="noreferrer" className="inline-flex px-5 py-3 rounded-xl bg-emerald-600 text-white text-sm font-semibold">Continue to payment</a>}
    </div>
  );
};

// --- H. ORDERS PAGE ---
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
