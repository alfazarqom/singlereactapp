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
export default NotificationsPage;
