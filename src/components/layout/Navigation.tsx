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
import type { NavigationItem } from "../../types/navigation";

export const STANDALONE_PAGES = [
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

  const navItems: NavigationItem[] = [
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
export { Header, BottomNavigation };
