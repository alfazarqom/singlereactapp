import React, { useState, useEffect, createContext, useContext } from "react";
import { MOCK_NOTIFICATIONS, MOCK_PRODUCTS } from "../../data/mockData";

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedProduct, setSelectedProduct] = useState(MOCK_PRODUCTS[0]);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  
  // Storage States
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("mystore_cart");
    return saved ? JSON.parse(saved) : [
      { product: MOCK_PRODUCTS[0], quantity: 1, selectedColor: "Matte Black", selectedSize: "Standard" }
    ];
  });
  
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem("mystore_wishlist");
    return saved ? JSON.parse(saved) : [MOCK_PRODUCTS[1].id, MOCK_PRODUCTS[3].id];
  });

  const [orders, setOrders] = useState([
    {
      id: "ORD-98231",
      date: "2026-10-24",
      status: "In Transit",
      total: 2499000,
      items: [{ product: MOCK_PRODUCTS[0], quantity: 1, selectedColor: "Matte Black", selectedSize: "Standard" }],
      trackingNumber: "JNE-9921039102",
      address: "Jl. Jend. Sudirman No. 45, Jakarta Selatan, 12190"
    }
  ]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  // Sync LocalStorage
  useEffect(() => {
    localStorage.setItem("mystore_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("mystore_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // Toast Trigger
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Simulate Page Transitions with Loading Skeleton
  const navigateTo = (page, data = null) => {
    setIsLoading(true);
    if (page === "product-detail" && data) {
      setSelectedProduct(data);
      setSelectedColor(data.colors ? data.colors[0] : "");
      setSelectedSize(data.sizes ? data.sizes[0] : "");
      setSelectedQuantity(1);
    }
    if (page === "category" && data) setSelectedCategory(data);
    if (page === "order-detail" && data) setActiveOrder(data);

    setTimeout(() => {
      setCurrentPage(page);
      setIsLoading(false);
      // Reset scroll on main
      const mainElem = document.getElementById("main-content-area");
      if (mainElem) mainElem.scrollTop = 0;
    }, 300);
  };

  // Cart Operations
  const addToCart = (product, quantity = 1, color = "", size = "") => {
    const chosenColor = color || (product.colors ? product.colors[0] : "");
    const chosenSize = size || (product.sizes ? product.sizes[0] : "");
    const existingItem = cart.find(
      (item) => item.product.id === product.id && item.selectedColor === chosenColor && item.selectedSize === chosenSize
    );
    const nextQuantity = (existingItem?.quantity || 0) + quantity;

    if (product.stock <= 0) {
      triggerToast("Product is out of stock");
      return false;
    }
    if (quantity < 1 || nextQuantity > product.stock) {
      triggerToast(`Maximum available quantity is ${product.stock}`);
      return false;
    }

    setCart((prevCart) => {
      const idx = prevCart.findIndex(
        (item) => item.product.id === product.id && item.selectedColor === chosenColor && item.selectedSize === chosenSize
      );
      if (idx > -1) {
        const next = [...prevCart];
        next[idx].quantity += quantity;
        return next;
      }
      return [...prevCart, { product, quantity, selectedColor: chosenColor, selectedSize: chosenSize }];
    });
    triggerToast(`Added "${product.name.slice(0, 20)}..." to cart`);
    return true;
  };

  const updateQuantity = (index, delta) => {
    setCart((prev) => {
      const next = [...prev];
      const newQty = next[index].quantity + delta;
      if (newQty <= 0) {
        next.splice(index, 1);
      } else {
        next[index].quantity = newQty;
      }
      return next;
    });
  };

  const removeFromCart = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
    triggerToast("Item removed from cart");
  };

  const toggleWishlist = (productId) => {
    setWishlist((prev) => {
      if (prev.includes(productId)) {
        triggerToast("Removed from Wishlist");
        return prev.filter((id) => id !== productId);
      } else {
        triggerToast("Saved to Wishlist!");
        return [...prev, productId];
      }
    });
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <AppContext.Provider
      value={{
        currentPage,
        navigateTo,
        selectedProduct,
        selectedColor,
        setSelectedColor,
        selectedSize,
        setSelectedSize,
        selectedQuantity,
        setSelectedQuantity,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        isLoading,
        toastMessage,
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        cartTotal,
        cartCount,
        wishlist,
        toggleWishlist,
        orders,
        setOrders,
        activeOrder,
        notifications,
        setNotifications,
        triggerToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);