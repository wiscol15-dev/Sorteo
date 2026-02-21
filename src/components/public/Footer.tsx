"use client";

import React from "react";
import Link from "next/link";
import {
  Ticket,
  ShieldCheck,
  Mail,
  Instagram,
  Twitter,
  Linkedin,
  Globe,
  Lock,
  Zap,
  MessageSquare,
  Headset,
  ChevronRight,
} from "lucide-react";

interface FooterProps {
  siteName: string;
}

export default function Footer({ siteName }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#020617] text-slate-400 pt-24 pb-12 overflow-hidden border-t border-white/5 font-sans">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-primary-dynamic/50 to-transparent opacity-30" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary-dynamic/5 rounded-full blur-[120px]" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 mb-20">
          <div className="lg:col-span-4 space-y-8">
            <Link href="/" className="inline-flex items-center gap-4 group">
              <div className="bg-slate-900 p-3 rounded-2xl border border-white/10 group-hover:border-primary-dynamic/50 transition-colors shadow-2xl">
                <Ticket className="text-primary-dynamic" size={28} />
              </div>
              <span className="text-2xl font-black text-white uppercase italic tracking-tighter">
                {siteName}
              </span>
            </Link>
            <p className="text-xs font-bold leading-relaxed uppercase tracking-widest text-slate-500 max-w-sm">
              Infraestructura líder en sorteos premium. Seguridad de grado
              militar y transparencia absoluta garantizada.
            </p>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">
              Plataforma
            </h4>
            <ul className="space-y-4 text-xs font-bold uppercase tracking-widest">
              <li>
                <Link
                  href="/sorteo"
                  className="hover:text-primary-dynamic transition-colors"
                >
                  Sorteos
                </Link>
              </li>
              <li>
                <Link
                  href="/billetera"
                  className="hover:text-primary-dynamic transition-colors"
                >
                  Billetera
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">
              Legal
            </h4>
            <ul className="space-y-4 text-xs font-bold uppercase tracking-widest">
              <li>
                <Link
                  href="/terminos"
                  className="hover:text-primary-dynamic transition-colors"
                >
                  Términos
                </Link>
              </li>
              <li>
                <Link
                  href="/kyc"
                  className="hover:text-primary-dynamic transition-colors"
                >
                  Políticas KYC
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] space-y-8 shadow-inner relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Headset size={80} className="text-white" />
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-2">
                  <Zap size={14} className="text-primary-dynamic" /> Soporte y
                  Contacto
                </h4>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                  Enlace directo con administración
                </p>
              </div>

              <div className="space-y-4">
                <a
                  href="mailto:wiscol15@gmail.com"
                  className="group flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-primary-dynamic/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <Mail
                      size={18}
                      className="text-slate-400 group-hover:text-primary-dynamic"
                    />
                    <span className="text-xs font-black text-white uppercase tracking-tighter">
                      wiscol15@gmail.com
                    </span>
                  </div>
                  <ChevronRight
                    size={14}
                    className="text-slate-600 group-hover:text-primary-dynamic"
                  />
                </a>

                <Link
                  href="https://wa.me/584242614311"
                  target="_blank"
                  className="group flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <MessageSquare
                      size={18}
                      className="text-slate-400 group-hover:text-emerald-500"
                    />
                    <span className="text-xs font-black text-white uppercase tracking-tighter">
                      Chat en Vivo 24/7
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-black text-emerald-500 uppercase">
                      Online
                    </span>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  </div>
                </Link>

                <div className="pt-2 flex items-center gap-3 text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em] px-2 opacity-80">
                  <ShieldCheck size={12} />
                  Nodos Operativos: 100% ONLINE
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-600">
            © {currentYear} {siteName} HOLDINGS. TODOS LOS DERECHOS RESERVADOS.
          </p>
          <div className="flex gap-6 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700">
            <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-slate-400">
              <Lock size={12} /> SSL 256-BIT
            </div>
            <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-slate-400">
              <Globe size={12} /> GLOBAL INFRASTRUCTURE
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
