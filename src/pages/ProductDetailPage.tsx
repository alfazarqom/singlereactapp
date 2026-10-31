import React, { useState, useEffect } from "react";
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

const ProductDetailPage = () => {
  const {
    selectedProduct,
    navigateTo,
    selectedColor,
    setSelectedColor,
    selectedSize,
    setSelectedSize,
    selectedQuantity: qty,
    setSelectedQuantity: setQty,
    wishlist
  } = useApp();
  const product = selectedProduct || MOCK_PRODUCTS[0];
  const [selectedImg, setSelectedImg] = useState(product.images[0]);
  const relatedProducts = MOCK_PRODUCTS.filter((item) => item.id !== product.id).slice(0, 4);
  const isWishlisted = wishlist.includes(product.id);
  const stock = Math.max(0, Number(product.stock) || 0);

  useEffect(() => {
    setSelectedImg(product.images[0]);
  }, [product.id, product.images]);

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
    } catch (error) {
      if (error?.name !== "AbortError") {
        // Keep the page usable when browser sharing is unavailable or dismissed.
      }
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
              <span className={stock > 0 ? "text-emerald-600 font-semibold" : "text-red-500 font-semibold"}>
                {stock > 0 ? `In Stock · ${stock} available` : "Out of Stock"}
              </span>
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
                  disabled={qty >= stock || stock === 0}
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

export default ProductDetailPage;
