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

import { useApp } from "../hooks/useApp";
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from "../data/mockData";
import { formatIDR } from "../utils/format";

const CheckoutPage = () => {
  const { cartTotal } = useApp();

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

export default CheckoutPage;
