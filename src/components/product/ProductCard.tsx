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

import { useApp } from "../../app/context/AppContext";

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
export default ProductCard;
