import React from "react";
import { useApp } from "../hooks/useApp";
import { ProductGridSkeleton } from "../components/common/Skeletons";
import HomePage from "../pages/HomePage";
import ProductListingPage from "../pages/ProductListingPage";
import ProfileGuestPage from "../pages/ProfileGuestPage";

const MainContent = () => {
  const { currentPage, isLoading } = useApp();

  if (isLoading) {
    return (
      <main id="main-content-area" className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        <ProductGridSkeleton count={8} />
      </main>
    );
  }

  switch (currentPage) {
    case "home":
      return (
        <main id="main-content-area" className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <HomePage />
        </main>
      );
    case "category":
    case "products":
    case "search":
      return (
        <main id="main-content-area" className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <ProductListingPage />
        </main>
      );
    case "profile":
    case "profile-guest":
      return (
        <main id="main-content-area" className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <ProfileGuestPage />
        </main>
      );
    case "product-detail":
    case "checkout":
    case "order-success":
    case "wishlist":
    case "cart":
    case "orders":
    case "notifications":
      return null;
    default:
      return (
        <main id="main-content-area" className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <HomePage />
        </main>
      );
  }
};

export default MainContent;
