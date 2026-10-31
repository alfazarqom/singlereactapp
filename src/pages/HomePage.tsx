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
import ProductCard from "../components/product/ProductCard";

const HomePage = () => {
  const { navigateTo, setSelectedCategory } = useApp();

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
          {MOCK_CATEGORIES.map((cat) => (
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
          {MOCK_PRODUCTS.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
