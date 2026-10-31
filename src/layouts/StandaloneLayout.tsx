import React from "react";
import { useApp } from "../app/context/AppContext";
import ProductDetailPage from "../pages/ProductDetailPage";
import CheckoutPage from "../pages/CheckoutPage";
import OrderSuccessPage from "../pages/OrderSuccessPage";
import WishlistPage from "../pages/WishlistPage";
import CartPage from "../pages/CartPage";
import OrdersPage from "../pages/OrdersPage";
import NotificationsPage from "../pages/NotificationsPage";

const StandalonePage = () => {
  const { currentPage, isLoading } = useApp();

  if (isLoading) return null;

  let page = null;
  switch (currentPage) {
    case "product-detail":
      page = <ProductDetailPage />;
      break;
    case "checkout":
      page = <CheckoutPage />;
      break;
    case "order-success":
      page = <OrderSuccessPage />;
      break;
    case "wishlist":
      page = <WishlistPage />;
      break;
    case "cart":
      page = <CartPage />;
      break;
    case "orders":
      page = <OrdersPage />;
      break;
    case "notifications":
      page = <NotificationsPage />;
      break;
    default:
      return null;
  }

  if (!page) return null;

  return (
    <main id="main-content-area" className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
      {page}
    </main>
  );
};

export default StandalonePage;
