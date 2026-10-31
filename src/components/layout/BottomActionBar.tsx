import React from "react";
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

import { useApp } from "../../hooks/useApp";
import { formatIDR } from "../../utils/format";

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
    cartTotal,
    cartCount,
    wishlist,
    toggleWishlist,
    orders,
    setOrders,
    triggerToast
  } = useApp();

  const isWishlisted = selectedProduct ? wishlist.includes(selectedProduct.id) : false;

  const handleCompleteOrder = () => {
    if (cart.length === 0) {
      triggerToast("Cart is empty");
      navigateTo("products");
      return;
    }
    const newOrd = {
      id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toISOString().split("T")[0],
      status: "Processing",
      total: cartTotal,
      items: [...cart],
      trackingNumber: "JNE-8821903",
      address: "Jl. Jend. Sudirman No. 45, Jakarta Selatan"
    };
    setOrders([newOrd, ...orders]);
    navigateTo("order-success");
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
                disabled={selectedProduct.stock <= 0 || selectedQuantity > selectedProduct.stock}
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
                disabled={selectedProduct.stock <= 0 || selectedQuantity > selectedProduct.stock}
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
                {formatIDR(cartTotal)}
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
                {formatIDR(cartTotal)}
              </p>
            </div>

            <button
              onClick={handleCompleteOrder}
              className="px-7 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs shadow-md shadow-orange-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Place Order</span>
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
export default BottomActionBar;
