"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/(public)/auth/actions";
import {
  LayoutDashboard,
  Ticket,
  Users,
  BarChart3,
  Settings,
  Globe,
  LogOut,
  ShieldCheck,
} from "lucide-react";

interface SidebarProps {
  role: string;
  pendingUsers: number;
}

export default function SidebarAdmin({ role, pendingUsers }: SidebarProps) {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Sorteos", href: "/admin/sorteos", icon: Ticket },
    {
      name: "Usuarios",
      href: "/admin/users",
      icon: Users,
      badge: pendingUsers > 0 ? pendingUsers : null,
    },
    { name: "Estadísticas", href: "/admin/estadisticas", icon: BarChart3 },
    { name: "Configuración", href: "/admin/configuracion", icon: Settings },
  ];

  return (
    <aside className="w-72 bg-slate-900 h-full flex flex-col border-r border-slate-800">
      <div className="p-8 flex items-center gap-4 border-b border-white/5 shrink-0">
        <div className="bg-primary-dynamic/20 p-3 rounded-2xl shadow-inner shadow-primary-dynamic/10">
          <ShieldCheck className="text-primary-dynamic" size={28} />
        </div>
        <div>
          <h1 className="text-white font-black tracking-tighter text-xl leading-none">
            CONTROL
          </h1>
          <p className="text-primary-dynamic text-[9px] font-black uppercase tracking-widest mt-1">
            {role === "SUPER_ADMIN" ? "Super Admin" : "Administrador"}
          </p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
        {links.map((link) => {
          const isActive =
            pathname === link.href ||
            (link.href !== "/admin" && pathname.startsWith(link.href));

          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center justify-between px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.15em] transition-all group ${
                isActive
                  ? "bg-primary-dynamic text-white shadow-xl shadow-primary-dynamic/20"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-4">
                <link.icon
                  size={18}
                  className={
                    isActive
                      ? "text-white"
                      : "group-hover:text-primary-dynamic transition-colors"
                  }
                />
                {link.name}
              </div>

              {link.badge && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[9px] font-black text-white animate-pulse shadow-lg shadow-red-500/40">
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 space-y-2 border-t border-white/5 bg-slate-900 shrink-0">
        <Link
          href="/"
          className="flex items-center gap-4 px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-400 hover:bg-white/5 hover:text-white transition-all"
        >
          <Globe size={18} />
          Ver Sitio Público
        </Link>
        <button
          onClick={async () => {
            await logout();
          }}
          className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
        >
          <LogOut size={18} />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
