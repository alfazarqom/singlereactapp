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

export default OrdersPage;
