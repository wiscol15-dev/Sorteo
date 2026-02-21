"use client";

import React, { useState } from "react";
import { Trash2, ShieldAlert, Loader2 } from "lucide-react";
import { deleteRaffle } from "./actions";

export default function DeleteRaffleButton({
  raffleId,
  userRole,
}: {
  raffleId: string;
  userRole: string;
}) {
  const [showError, setShowError] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    // 1. Bloqueo Visual Inmediato para ADMINS
    if (userRole !== "SUPER_ADMIN") {
      setShowError(true);
      setTimeout(() => setShowError(false), 4000); // El error desaparece en 4 seg
      return;
    }

    // 2. Ejecución para SUPER_ADMIN
    if (
      confirm(
        "¿Confirmar purga de este sorteo y todos sus boletos? Esta acción es irreversible.",
      )
    ) {
      setIsDeleting(true);
      const res = await deleteRaffle(raffleId);
      if (!res?.success) {
        alert(res?.error || "Error al eliminar");
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="relative flex justify-end">
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        title="Purgar Registro"
        className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50"
      >
        {isDeleting ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <Trash2 size={18} />
        )}
      </button>

      {/* MENSAJE DE ADVERTENCIA MILITARIZADO */}
      {showError && (
        <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 w-56 bg-[#0f172a] text-white p-3 rounded-xl border border-red-500/30 shadow-2xl flex items-start gap-3 z-50 animate-in fade-in slide-in-from-right-4">
          <ShieldAlert
            size={16}
            className="text-red-500 flex-shrink-0 mt-0.5"
          />
          <div>
            <p className="text-[9px] font-black text-red-500 uppercase tracking-widest">
              Acceso Denegado
            </p>
            <p className="text-[10px] font-medium text-slate-300 leading-tight mt-1">
              Solo un oficial con rango SUPER_ADMIN puede ejecutar purgas de
              inventario.
            </p>
          </div>
          {/* Triángulo del Tooltip */}
          <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-[#0f172a] border-r border-t border-red-500/30 rotate-45" />
        </div>
      )}
    </div>
  );
}
