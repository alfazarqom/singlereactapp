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

export default ProfileGuestPage;
