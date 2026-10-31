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

import { useApp } from "../app/context/AppContext";
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from "../data/mockData";
import { formatIDR } from "../utils/format";

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, cartTotal, navigateTo } = useApp();

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
              <span className="text-emerald-600 font-semibold">FREE</span>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex justify-between text-sm font-semibold text-slate-900 dark:text-white">
              <span>Total Payable</span>
              <span className="text-orange-600">{formatIDR(cartTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
