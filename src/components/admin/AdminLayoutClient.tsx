"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

export default function AdminLayoutClient({
  children,
  user,
  sidebar,
}: {
  children: React.ReactNode;
  user: any;
  sidebar: React.ReactNode;
}) {
  const pathname = usePathname();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isConfigPage = pathname === "/admin/configuracion";

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileOpen]);

  const MobileDrawer = (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-[70] transform transition-transform duration-300 ease-in-out lg:hidden w-72 ${
          isMobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {sidebar}
      </div>
    </>
  );

  if (isConfigPage) {
    return (
      <div className="flex h-screen w-full bg-[#020617] overflow-hidden relative">
        {MobileDrawer}

        <button
          onClick={() => setIsMobileOpen(true)}
          className="lg:hidden absolute top-4 right-4 z-50 p-3 bg-white/10 text-white rounded-xl backdrop-blur-md hover:bg-white/20 transition-all active:scale-95 shadow-xl"
        >
          <Menu size={20} />
        </button>

        <aside className="w-72 flex-shrink-0 h-full hidden lg:block z-50">
          {sidebar}
        </aside>
        <main className="flex-1 h-full overflow-y-auto custom-scrollbar relative">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {MobileDrawer}

      <aside className="fixed inset-y-0 left-0 z-50 w-72 hidden lg:block border-r border-slate-200 bg-white">
        {sidebar}
      </aside>

      <div className="lg:pl-72 flex flex-col flex-1 min-w-0">
        <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 sm:px-8 shadow-sm">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 text-slate-600 bg-slate-100 hover:bg-primary-dynamic hover:text-white rounded-xl transition-all active:scale-95"
            >
              <Menu size={20} />
            </button>

            <div className="h-10 w-1 px-0 bg-primary-dynamic rounded-full hidden sm:block" />
            <h1 className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400 italic">
              Panel <span className="hidden sm:inline">de Control</span>{" "}
              <span className="text-slate-900 block sm:inline sm:ml-1">
                Sorteos Premium
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-slate-900 leading-none uppercase italic">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-[9px] font-bold text-primary-dynamic uppercase tracking-tighter mt-1">
                {user.role} Acceso Total
              </p>
            </div>

            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black italic border-2 sm:border-4 border-white shadow-xl">
              {user.firstName[0]}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 md:p-12 lg:p-14 animate-in fade-in duration-1000 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
