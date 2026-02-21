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

// DICCIONARIO DE ESTILOS INTEGRADO (Inmune a fallos de Turbopack)
const styles = {
  navFixedBase:
    "fixed left-0 right-0 z-[100] transition-all duration-500 w-full flex justify-center",
  navFixedScrolled: "top-0 py-2",
  navFixedTop: "top-0 py-6",
  outerWrapper: "w-full max-w-7xl px-4 md:px-6",
  innerWrapperBase:
    "w-full transition-all duration-500 flex items-center justify-between",
  innerWrapperScrolled:
    "bg-white/95 backdrop-blur-3xl border border-slate-200/50 rounded-full px-6 md:px-8 py-3 shadow-lg",
  innerWrapperTop:
    "bg-white/80 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] px-6 md:px-8 py-4 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.1)]",
  logoLink: "flex items-center gap-2 md:gap-3 group",
  logoIconBox:
    "bg-primary-dynamic rounded-2xl transition-all duration-500 shadow-lg shadow-primary-dynamic/20 flex items-center justify-center overflow-hidden",
  logoIconBoxScrolled: "w-8 h-8",
  logoIconBoxTop: "w-8 h-8 md:w-10 md:h-10",
  logoImage: "w-full h-full object-contain p-1.5",
  brandText:
    "font-black italic tracking-tighter text-slate-900 uppercase transition-all duration-500",
  brandTextScrolled: "text-lg md:text-xl",
  brandTextTop: "text-xl md:text-2xl",
  centerNav: "hidden lg:flex items-center gap-10",
  navLink:
    "text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 group",
  navLinkActive: "text-primary-dynamic",
  navLinkInactive: "text-slate-400 hover:text-slate-900",
  navLinkIcon: "w-4 h-4 transition-transform",
  rightNav: "hidden lg:flex items-center gap-6 border-l border-slate-100 pl-10",
  userContainer: "flex items-center gap-8",
  balanceStack: "flex flex-col items-end",
  balanceLabel:
    "text-[9px] font-black uppercase text-slate-400 tracking-widest",
  balanceValue: "text-lg font-black text-slate-900 tracking-tighter",
  adminBtn:
    "p-3.5 bg-slate-900 text-white rounded-2xl hover:bg-primary-dynamic transition-all shadow-xl shadow-slate-200",
  adminIcon: "w-5 h-5",
  logoutBtn:
    "flex items-center gap-2 bg-red-50 text-red-500 px-6 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm group",
  logoutIcon: "w-3 h-3 transition-transform",
  authContainer: "flex items-center gap-4",
  loginBtn:
    "text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 px-4",
  registerBtn:
    "bg-primary-dynamic text-white px-8 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:brightness-125 transition-all shadow-xl shadow-primary-dynamic/20",
  mobileMenuBtn: "lg:hidden p-3 bg-slate-50 rounded-2xl text-slate-900",
  mobileDropdown:
    "lg:hidden absolute top-24 left-4 right-4 bg-white rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300 z-[101]",
  mobileLinkStack: "flex flex-col gap-6",
  mobileLink:
    "flex items-center gap-4 text-lg font-black uppercase tracking-tighter text-slate-900 italic",
  mobileLinkIcon: "text-primary-dynamic",
  mobileDivider: "border-slate-100 my-4",

  // SOLUCIÓN: Botones táctiles de grado producción
  mobileAdminBtn:
    "w-full bg-slate-900 text-white py-5 rounded-3xl flex items-center justify-center gap-3 font-black uppercase text-xs tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition-transform",
  mobileLogoutBtn:
    "w-full bg-red-500 text-white py-5 rounded-3xl font-black uppercase text-xs tracking-widest active:scale-95 transition-transform",
  mobileAuthStack: "flex flex-col gap-4",
  mobileLoginBtn:
    "w-full bg-slate-100 text-slate-900 py-5 rounded-3xl text-center font-black uppercase text-xs tracking-widest",
  mobileRegisterBtn:
    "w-full bg-primary-dynamic text-white py-5 rounded-3xl text-center font-black uppercase text-xs tracking-widest",
};

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
    <nav
      className={`${styles.navFixedBase} ${isScrolled ? styles.navFixedScrolled : styles.navFixedTop}`}
    >
      <div className={styles.outerWrapper}>
        <div
          className={`${styles.innerWrapperBase} ${isScrolled ? styles.innerWrapperScrolled : styles.innerWrapperTop}`}
        >
          <Link href="/" className={styles.logoLink}>
            <div
              className={`${styles.logoIconBox} ${isScrolled ? styles.logoIconBoxScrolled : styles.logoIconBoxTop} group-hover:rotate-12`}
            >
              {headerIconType === "IMAGE" && headerImageUrl ? (
                <img
                  src={headerImageUrl}
                  alt="Logo"
                  className={styles.logoImage}
                />
              ) : (
                <BrandIconComponent
                  className="text-white"
                  size={isScrolled ? 16 : 22}
                />
              )}
            </div>
            <span
              className={`${styles.brandText} ${isScrolled ? styles.brandTextScrolled : styles.brandTextTop}`}
            >
              {siteName.split("Premium")[0]}
              <span className="text-primary-dynamic">
                {siteName.includes("Premium") ? "Premium" : ""}
              </span>
            </span>
          </Link>

          <div className={styles.centerNav}>
            {visibleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.navLink} ${pathname === link.href ? styles.navLinkActive : styles.navLinkInactive}`}
              >
                <link.icon
                  className={`${styles.navLinkIcon} group-hover:scale-110`}
                />
                {link.name}
              </Link>
            ))}
          </div>

          <div className={styles.rightNav}>
            {user ? (
              <div className={styles.userContainer}>
                <div className={styles.balanceStack}>
                  <span className={styles.balanceLabel}>Saldo Disponible</span>
                  <span className={styles.balanceValue}>
                    ${user.walletBalance.toFixed(2)}
                  </span>
                </div>
                {isAdminUser && (
                  <Link
                    href="/admin"
                    className={styles.adminBtn}
                    title="Panel de Control"
                  >
                    <LayoutDashboard className={styles.adminIcon} />
                  </Link>
                )}
                <button onClick={() => logout()} className={styles.logoutBtn}>
                  <LogOut
                    className={`${styles.logoutIcon} group-hover:-translate-x-1`}
                  />
                  Salir
                </button>
              </div>
            ) : (
              <div className={styles.authContainer}>
                <Link href="/auth/login" className={styles.loginBtn}>
                  Ingresar
                </Link>
                <Link href="/auth/registro" className={styles.registerBtn}>
                  Empezar ahora
                </Link>
              </div>
            )}
          </div>

          <button
            className={styles.mobileMenuBtn}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className={styles.mobileDropdown}>
          <div className={styles.mobileLinkStack}>
            {visibleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={styles.mobileLink}
              >
                <link.icon size={22} className={styles.mobileLinkIcon} />
                {link.name}
              </Link>
            ))}

            <hr className={styles.mobileDivider} />

            {user ? (
              <div className="space-y-4 flex flex-col">
                {isAdminUser && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={styles.mobileAdminBtn}
                  >
                    <LayoutDashboard size={18} />
                    Panel de Control
                  </Link>
                )}

                <div className="bg-slate-50 p-4 rounded-3xl flex justify-between items-center border border-slate-100">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    Saldo Actual
                  </span>
                  <span className="text-lg font-black text-slate-900 tracking-tighter">
                    ${user.walletBalance.toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={() => logout()}
                  className={styles.mobileLogoutBtn}
                >
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <div className={styles.mobileAuthStack}>
                <Link
                  href="/auth/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={styles.mobileLoginBtn}
                >
                  Ingresar
                </Link>
                <Link
                  href="/auth/registro"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={styles.mobileRegisterBtn}
                >
                  Unirse ahora
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
