"use client";

import React, { useState } from "react";
import { Trash2, UserCheck, UserX, ShieldAlert, Loader2 } from "lucide-react";
import { toggleUserVerification, deleteUserRecord } from "./actions"; // Importamos las funciones del servidor (Paso 2)

interface Props {
  userId: string;
  isVerified: boolean;
  officerRole: string;
}

export default function UserActions({
  userId,
  isVerified,
  officerRole,
}: Props) {
  const [showError, setShowError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleVerifyToggle = async () => {
    setIsLoading(true);
    await toggleUserVerification(userId);
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (officerRole !== "SUPER_ADMIN") {
      setShowError(true);
      setTimeout(() => setShowError(false), 4000);
      return;
    }

    if (
      confirm(
        "¿Confirmar purga total de este usuario y sus transacciones? Acción IRREVERSIBLE.",
      )
    ) {
      setIsLoading(true);
      const res = await deleteUserRecord(userId);
      if (!res?.success) alert(res?.error);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex items-center gap-3">
      <button
        onClick={handleVerifyToggle}
        disabled={isLoading}
        title={isVerified ? "Revocar Verificación" : "Aprobar KYC"}
        className={`p-4 rounded-[1.2rem] transition-all shadow-sm flex items-center justify-center ${
          isVerified
            ? "bg-amber-50 text-amber-600 hover:bg-amber-100 hover:shadow-md"
            : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:shadow-md"
        }`}
      >
        {isVerified ? <UserX size={20} /> : <UserCheck size={20} />}
      </button>

      <button
        onClick={handleDelete}
        disabled={isLoading}
        title="Purgar Registro de Base de Datos"
        className="p-4 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-[1.2rem] transition-all"
      >
        {isLoading ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <Trash2 size={20} />
        )}
      </button>

      {showError && (
        <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 w-64 bg-[#0f172a] text-white p-4 rounded-2xl border border-red-500/30 shadow-2xl flex items-start gap-3 z-50 animate-in fade-in slide-in-from-right-4">
          <ShieldAlert
            size={18}
            className="text-red-500 flex-shrink-0 mt-0.5"
          />
          <div>
            <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-1">
              Acceso Denegado
            </p>
            <p className="text-[11px] font-medium text-slate-300 leading-tight">
              Protocolo de seguridad: Solo un rango SUPER_ADMIN puede ejecutar
              la purga de registros.
            </p>
          </div>
          <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-[#0f172a] border-r border-t border-red-500/30 rotate-45" />
        </div>
      )}
    </div>
  );
}
