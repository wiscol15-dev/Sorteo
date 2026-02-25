"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Wallet,
  Ticket,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import { useState, useEffect } from "react";
import { logout } from "@/app/(public)/auth/actions";
import { iconMap } from "@/app/admin/configuracion/HeaderIconSelector";

interface NavbarProps {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    walletBalance: number;
  } | null;
  siteName: string;
  headerIconType?: string;
  headerIconName?: string;
  headerImageUrl?: string | null;
}

export default function Navbar({
  user,
  siteName,
  headerIconType = "ICON",
  headerIconName = "ShieldCheck",
  headerImageUrl,
}: NavbarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const isAdminPath = pathname?.startsWith("/admin");
  const isAdminUser =
    user && (user.role === "ADMIN" || user.role === "SUPER_ADMIN");

  useEffect(() => {
    if (isAdminPath) return;
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isAdminPath]);

  // Si estamos en el panel de admin, no renderizamos este navbar público
  if (isAdminPath) return null;

  const navLinks = [
    { name: "Sorteos", href: "/", icon: Ticket },
    {
      name: "Mis Boletos",
      href: "/mis-tickets",
      icon: Ticket,
      protected: true,
    },
    { name: "Billetera", href: "/billetera", icon: Wallet, protected: true },
  ];

  const visibleLinks = navLinks.filter(
    (link) => !link.protected || (link.protected && user),
  );

  const BrandIconComponent = iconMap[headerIconName] || ShieldCheck;

  return (
    <header
      className={`fixed left-0 right-0 z-[100] flex justify-center transition-all duration-500 w-full ${
        isScrolled ? "top-0 pt-2 md:pt-4" : "top-0 pt-4 md:pt-8"
      }`}
    >
      <div className="w-full max-w-7xl px-4 md:px-6">
        {/* CONTENEDOR PRINCIPAL TIPO "PÍLDORA" */}
        <nav
          className={`w-full flex items-center justify-between bg-white/95 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200/50 transition-all duration-500 ${
            isScrolled
              ? "rounded-[2rem] px-4 md:px-6 py-2.5"
              : "rounded-[2.5rem] md:rounded-full px-5 md:px-8 py-3.5 md:py-4"
          }`}
        >
          {/* LOGO Y MARCA */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            {headerIconType === "IMAGE" && headerImageUrl ? (
              // Renderizado si es Imagen (Sin fondo, limpia)
              <div
                className={`relative flex items-center justify-center transition-all duration-500 group-hover:scale-105 ${isScrolled ? "w-8 h-8 md:w-10 md:h-10" : "w-10 h-10 md:w-12 md:h-12"}`}
              >
                <img
                  src={headerImageUrl}
                  alt={siteName}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              // Renderizado si es Icono (Con fondo circular del color primario)
              <div
                className={`bg-primary-dynamic flex items-center justify-center shrink-0 rounded-full transition-all duration-500 shadow-lg shadow-primary-dynamic/30 group-hover:rotate-12 ${
                  isScrolled
                    ? "w-8 h-8 md:w-10 md:h-10"
                    : "w-10 h-10 md:w-12 md:h-12"
                }`}
              >
                <BrandIconComponent
                  className="text-white"
                  size={isScrolled ? 18 : 22}
                />
              </div>
            )}

            <span
              className={`font-black italic tracking-tighter text-slate-900 uppercase transition-all duration-500 ${
                isScrolled ? "text-lg md:text-xl" : "text-xl md:text-2xl"
              }`}
            >
              {siteName.split("Premium")[0]}
              <span className="text-primary-dynamic">
                {siteName.includes("Premium") ? "Premium" : ""}
              </span>
            </span>
          </Link>

          {/* ENLACES DE NAVEGACIÓN (DESKTOP) */}
          <div className="hidden lg:flex items-center gap-8 xl:gap-10">
            {visibleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 group ${
                  pathname === link.href
                    ? "text-primary-dynamic"
                    : "text-slate-400 hover:text-slate-900"
                }`}
              >
                <link.icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                {link.name}
              </Link>
            ))}
          </div>

          {/* ÁREA DE USUARIO / AUTENTICACIÓN (DESKTOP) */}
          <div className="hidden lg:flex items-center gap-6 border-l border-slate-200 pl-8 shrink-0">
            {user ? (
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-end">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                    Saldo Disponible
                  </span>
                  <span className="text-lg font-black text-slate-900 tracking-tighter">
                    ${user.walletBalance.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {isAdminUser && (
                    <Link
                      href="/admin"
                      className="p-3 bg-slate-900 text-white rounded-[1.2rem] hover:bg-primary-dynamic transition-all shadow-xl hover:shadow-primary-dynamic/20 group"
                      title="Panel de Control"
                    >
                      <LayoutDashboard className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </Link>
                  )}
                  <button
                    onClick={() => logout()}
                    className="flex items-center gap-2 bg-red-50 text-red-500 px-5 py-3 rounded-[1.2rem] font-black uppercase text-[10px] tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm group"
                  >
                    Salir
                    <LogOut className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  href="/auth/login"
                  className="text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 px-4 transition-colors"
                >
                  Ingresar
                </Link>
                <Link
                  href="/auth/registro"
                  className="bg-slate-900 text-white px-8 py-3.5 rounded-[1.2rem] font-black uppercase text-[10px] tracking-widest hover:bg-primary-dynamic transition-all shadow-xl hover:shadow-primary-dynamic/20"
                >
                  Empezar Ahora
                </Link>
              </div>
            )}
          </div>

          {/* BOTÓN MENÚ MÓVIL */}
          <button
            className="lg:hidden p-2.5 bg-slate-100 hover:bg-slate-200 rounded-[1.2rem] text-slate-900 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>
      </div>

      {/* =====================================================================
          MENÚ MÓVIL (DROPDOWN)
          ===================================================================== */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-[110%] left-4 right-4 bg-white rounded-[2.5rem] p-6 shadow-2xl shadow-black/20 border border-slate-100 animate-in slide-in-from-top-4 fade-in duration-300 z-[101]">
          <div className="flex flex-col gap-6">
            {visibleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-4 text-lg font-black uppercase tracking-tighter italic ${
                  pathname === link.href
                    ? "text-primary-dynamic"
                    : "text-slate-900"
                }`}
              >
                <link.icon
                  size={22}
                  className={
                    pathname === link.href
                      ? "text-primary-dynamic"
                      : "text-slate-400"
                  }
                />
                {link.name}
              </Link>
            ))}

            <hr className="border-slate-100 my-2" />

            {user ? (
              <div className="space-y-4 flex flex-col">
                <div className="bg-slate-50 p-5 rounded-3xl flex justify-between items-center border border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    Saldo Actual
                  </span>
                  <span className="text-xl font-black text-slate-900 tracking-tighter">
                    ${user.walletBalance.toFixed(2)}
                  </span>
                </div>

                {isAdminUser && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full bg-slate-900 text-white py-4 rounded-3xl flex items-center justify-center gap-3 font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-transform"
                  >
                    <LayoutDashboard size={18} />
                    Panel de Control
                  </Link>
                )}

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full bg-red-50 text-red-500 py-4 rounded-3xl font-black uppercase text-xs tracking-widest active:scale-95 transition-all hover:bg-red-500 hover:text-white flex items-center justify-center gap-2"
                >
                  <LogOut size={16} /> Cerrar Sesión
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link
                  href="/auth/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full bg-slate-100 text-slate-900 py-5 rounded-3xl text-center font-black uppercase text-[11px] tracking-[0.2em] active:scale-95 transition-transform"
                >
                  Ingresar a mi cuenta
                </Link>
                <Link
                  href="/auth/registro"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full bg-slate-900 text-white py-5 rounded-3xl text-center font-black uppercase text-[11px] tracking-[0.2em] shadow-xl active:scale-95 transition-transform"
                >
                  Unirse Ahora
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
