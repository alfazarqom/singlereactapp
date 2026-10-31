import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { STANDALONE_PAGES, Header, BottomNavigation } from "../components/layout/Navigation";
import BottomActionBar from "../components/layout/BottomActionBar";
import MainLayout from "../layouts/MainLayout";
import StandaloneLayout from "../layouts/StandaloneLayout";

const AppShell = () => {
  const { toastMessage, currentPage } = useApp();
  const isStandalone = STANDALONE_PAGES.includes(currentPage);

  return (
    <div className="h-[100dvh] w-full flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <Header />
      <MainLayout />
      <StandaloneLayout />
      {isStandalone ? <BottomActionBar /> : <BottomNavigation />}

      {/* Global Toast */}
      {toastMessage && (
        <div className="fixed bottom-20 right-4 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
