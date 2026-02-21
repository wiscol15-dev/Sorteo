"use client";

import React, { useEffect } from "react";
import { X, ShieldCheck, Download } from "lucide-react";
import Image from "next/image";

export default function DocumentModal({
  isOpen,
  onClose,
  imageUrl,
  userName,
}: {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  userName: string;
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // PROTOCOLO DE LIMPIEZA (Mantenimiento de integridad del DOM)
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-300">
      {/* Fondo con desenfoque y cierre al hacer clic fuera */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
        onClick={onClose}
      />

      <div className="relative w-full max-w-5xl bg-white rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
        {/* Cabecera Táctica */}
        <header className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/50 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-dynamic rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-dynamic/20">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tighter leading-none">
                Inspección KYC
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                {userName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-slate-50 text-slate-400 hover:text-primary-dynamic hover:bg-white rounded-2xl transition-all border border-transparent hover:border-slate-100 shadow-sm"
              title="Abrir original"
            >
              <Download size={20} />
            </a>
            <button
              onClick={onClose}
              className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-red-500 transition-all shadow-xl flex items-center justify-center"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        {/* Visualizador de Alta Resolución */}
        <div className="relative h-[65vh] md:h-[75vh] w-full bg-slate-50 flex items-center justify-center p-4 md:p-10">
          <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-inner border border-slate-200 bg-white">
            <Image
              src={imageUrl}
              alt={`Documento de ${userName}`}
              fill
              className="object-contain"
              priority
              sizes="100vw"
            />
          </div>
        </div>

        <footer className="p-4 bg-white border-t border-slate-50 text-center">
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">
            Certificación de Identidad Digital v1.0
          </p>
        </footer>
      </div>
    </div>
  );
}
