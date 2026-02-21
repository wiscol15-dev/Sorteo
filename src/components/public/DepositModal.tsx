"use client";

import { useState } from "react";
import { depositFunds } from "@/app/admin/sorteos/actions";
import { Plus, Loader2, DollarSign, X } from "lucide-react";

export default function DepositModal({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDeposit = async (amount: number) => {
    setLoading(true);
    try {
      const res = await depositFunds(userId, amount);
      if (res.success) {
        setIsOpen(false);

        window.location.reload();
      } else {
        alert(res.error || "Error al procesar la recarga.");
      }
    } catch (err) {
      alert("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen)
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black uppercase text-xs hover:bg-primary hover:text-white transition-all shadow-xl flex items-center gap-2 group"
      >
        <Plus
          size={16}
          className="group-hover:rotate-90 transition-transform"
        />
        Recargar Saldo
      </button>
    );

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white max-w-md w-full rounded-[3.5rem] p-10 space-y-8 shadow-2xl relative overflow-hidden">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900">
            Recarga Rápida
          </h2>
          <p className="text-slate-500 text-sm font-medium px-4 leading-tight">
            Selecciona el monto para inyectar fondos a tu billetera digital.
            [cite: 2026-02-13]
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[10, 20, 50, 100].map((monto) => (
            <button
              key={monto}
              onClick={() => handleDeposit(monto)}
              disabled={loading}
              className="group py-8 border-2 border-slate-50 bg-slate-50/50 rounded-[2rem] font-black text-2xl hover:border-primary hover:bg-white hover:text-primary transition-all flex items-center justify-center gap-1 shadow-sm hover:shadow-xl disabled:opacity-50"
            >
              <DollarSign
                size={18}
                className="text-slate-300 group-hover:text-primary transition-colors"
              />
              {monto}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex flex-col items-center gap-3 animate-pulse">
            <Loader2 className="animate-spin text-primary" size={32} />
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">
              Estableciendo conexión bancaria...
            </p>
          </div>
        )}

        <p className="text-center text-[9px] text-slate-300 font-bold uppercase tracking-widest pt-4">
          Operación protegida por SSL 256-bit [cite: 2026-02-13]
        </p>
      </div>
    </div>
  );
}
