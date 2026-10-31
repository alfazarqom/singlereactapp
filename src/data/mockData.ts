export const MOCK_CATEGORIES = [
  { id: "cat-1", name: "Fashion", slug: "fashion", icon: "Shirt", banner: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=1200" },
  { id: "cat-2", name: "Electronics", slug: "electronics", icon: "Smartphone", banner: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1200" },
  { id: "cat-3", name: "Beauty", slug: "beauty", icon: "Sparkles", banner: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=1200" },
  { id: "cat-4", name: "Home & Living", slug: "home-living", icon: "Home", banner: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=1200" },
  { id: "cat-5", name: "Sports", slug: "sports", icon: "Activity", banner: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=1200" },
  { id: "cat-6", name: "Accessories", slug: "accessories", icon: "Watch", banner: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1200" }
];

export const MOCK_PRODUCTS = [
  {
    id: "prod-1",
    name: "Aura Noise-Canceling Wireless Headphones Pro",
    slug: "aura-wireless-headphones-pro",
    brand: "Aura Audio",
    category: "Electronics",
    description: "Premium over-ear wireless headphones engineered with hybrid active noise cancellation, 30-hour playback, custom acoustic drivers, and spatial audio calibration.",
    price: 2499000,
    originalPrice: 3299000,
    discount: 24,
    rating: 4.9,
    reviewCount: 312,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=800"
    ],
    colors: ["Matte Black", "Silver Quartz", "Navy Blue"],
    sizes: ["Standard"],
    stock: 14,
    soldCount: 840,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    specs: ["Active Noise Cancellation", "30 Hours Battery", "Bluetooth 5.3", "Custom EQ App"]
  },
  {
    id: "prod-2",
    name: "Minimalist Leather Smartwatch Gen-4",
    slug: "minimalist-leather-smartwatch",
    brand: "Chronos",
    category: "Electronics",
    description: "Sleek biometric smartwatch featuring AMOLED touch screen, heart rate & SpO2 tracking, GPS, 50m water resistance, and genuine Italian leather strap.",
    price: 1850000,
    originalPrice: 2200000,
    discount: 15,
    rating: 4.7,
    reviewCount: 184,
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=800"
    ],
    colors: ["Tan Brown", "Midnight Black"],
    sizes: ["40mm", "44mm"],
    stock: 9,
    soldCount: 410,
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    specs: ["OLED Always-On", "Heart & ECG Sensor", "5 ATM Waterproof", "7-Day Battery Life"]
  },
  {
    id: "prod-3",
    name: "Urban Explorer Ergonomic 25L Backpack",
    slug: "urban-explorer-backpack",
    brand: "NORDIC",
    category: "Fashion",
    description: "Weatherproof rolltop city backpack featuring 16-inch padded laptop sleeve, quick-access passport pocket, and breathable memory foam back panel.",
    price: 790000,
    originalPrice: 1100000,
    discount: 28,
    rating: 4.8,
    reviewCount: 96,
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&q=80&w=800"
    ],
    colors: ["Charcoal Slate", "Olive Green", "Desert Sand"],
    sizes: ["One Size (25L)"],
    stock: 22,
    soldCount: 630,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    specs: ["Waterproof Cordura", "Fits 16-inch Laptop", "Luggage Pass-through", "YKK Zippers"]
  },
  {
    id: "prod-4",
    name: "Heavyweight Organic Cotton Oversized Hoodie",
    slug: "heavyweight-cotton-hoodie",
    brand: "KITH & CO",
    category: "Fashion",
    description: "Crafted from 450 GSM organic French terry cotton. Double-layered hood, dropped shoulders, and pre-shrunk finish for long-lasting relaxed aesthetic.",
    price: 480000,
    originalPrice: 600000,
    discount: 20,
    rating: 4.6,
    reviewCount: 142,
    images: [
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&q=80&w=800"
    ],
    colors: ["Washed Off-White", "Charcoal Gray", "Sage Green"],
    sizes: ["S", "M", "L", "XL"],
    stock: 35,
    soldCount: 920,
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    specs: ["100% Organic Cotton", "450 GSM Fleece", "Pre-shrunk", "Ribbed Cuffs"]
  },
  {
    id: "prod-5",
    name: "Ceramic Pour-Over Coffee Dripper Set",
    slug: "ceramic-pour-over-coffee-set",
    brand: "KONO Studio",
    category: "Home & Living",
    description: "Handcrafted ceramic V60 style pour-over dripper complete with heat-resistant 700ml glass carafe and precision walnut wood stand.",
    price: 649000,
    originalPrice: 799000,
    discount: 18,
    rating: 4.9,
    reviewCount: 215,
    images: [
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=800"
    ],
    colors: ["Matte White", "Japanese Black Ceramic"],
    sizes: ["600ml / 2-4 Cups"],
    stock: 11,
    soldCount: 540,
    isFeatured: false,
    isBestSeller: true,
    isNewArrival: false,
    specs: ["High-Fired Ceramic", "Borosilicate Carafe", "Includes 40 Paper Filters", "Dishwasher Safe"]
  },
  {
    id: "prod-6",
    name: "Botanical Hydrating Facial Essence 150ml",
    slug: "botanical-hydrating-facial-essence",
    brand: "LUMINA Skincare",
    category: "Beauty",
    description: "Nourishing facial treatment essence formulated with green tea ferment, hyaluronic acid, and niacinamide for radiant skin elasticity.",
    price: 320000,
    originalPrice: 420000,
    discount: 23,
    rating: 4.8,
    reviewCount: 380,
    images: [
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800"
    ],
    colors: ["Standard Bottle"],
    sizes: ["150ml"],
    stock: 45,
    soldCount: 1200,
    isFeatured: true,
    isBestSeller: true,
    isNewArrival: false,
    specs: ["Cruelty-Free", "Dermatologist Tested", "Alcohol-Free", "Vegan Certified"]
  },
  {
    id: "prod-7",
    name: "Pro Performance Non-Slip Yoga Mat 6mm",
    slug: "pro-performance-yoga-mat",
    brand: "ZENFIT",
    category: "Sports",
    description: "Eco-friendly natural tree rubber yoga mat with laser-etched alignment guides, superior grip density, and antimicrobial surface coat.",
    price: 520000,
    originalPrice: 650000,
    discount: 20,
    rating: 4.7,
    reviewCount: 110,
    images: [
      "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&q=80&w=800"
    ],
    colors: ["Ocean Teal", "Deep Plum", "Midnight Ash"],
    sizes: ["183cm x 68cm x 6mm"],
    stock: 18,
    soldCount: 310,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: true,
    specs: ["Natural Rubber", "Antimicrobial Layer", "Laser Alignment", "Includes Carrying Strap"]
  },
  {
    id: "prod-8",
    name: "Polarized Titanium Frame Sunglasses",
    slug: "polarized-titanium-sunglasses",
    brand: "VERVE Eyewear",
    category: "Accessories",
    description: "Ultra-lightweight aerospace titanium frames with UV400 anti-glare polarized lenses. Maximum comfort for outdoor performance and driving.",
    price: 890000,
    originalPrice: 1250000,
    discount: 28,
    rating: 4.9,
    reviewCount: 88,
    images: [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=800"
    ],
    colors: ["Gunmetal Silver", "Gold Amber"],
    sizes: ["Medium Fit"],
    stock: 15,
    soldCount: 270,
    isFeatured: true,
    isBestSeller: false,
    isNewArrival: true,
    specs: ["100% UV400 Protection", "16g Titanium Frame", "Anti-Scratch Coating", "Includes Leather Case"]
  }
];

export const MOCK_NOTIFICATIONS = [
  { id: "notif-1", title: "Flash Sale Alert! ⚡", message: "Up to 50% discount on Electronics ending tonight at 23:59 WIB.", time: "10 mins ago", read: false, type: "promo" },
  { id: "notif-2", title: "Order Shipped! 🚚", message: "Order #ORD-89213 has been picked up by JNE courier.", time: "2 hours ago", read: false, type: "order" },
  { id: "notif-3", title: "Cashback Received 🪙", message: "Rp 50.000 Store Credit has been added to your account wallet.", time: "1 day ago", read: true, type: "wallet" }
];
