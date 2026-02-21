"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Ticket,
  Wallet,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Zap,
  MousePointer2,
  XCircle,
} from "lucide-react";
import { buyTickets } from "@/app/admin/sorteos/actions";

interface Props {
  raffleId: string;
  maxTickets: number;
  pricePerTicket: number;
  soldNumbers: number[];
  userId: string | null;
  userBalance: number;
}

export default function TicketSelector({
  raffleId,
  maxTickets,
  pricePerTicket,
  soldNumbers,
  userId,
  userBalance,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const totalCost = selectedNumbers.length * pricePerTicket;
  const hasBalance = userBalance >= totalCost;

  const availableNumbers = useMemo(() => {
    return Array.from({ length: maxTickets }, (_, i) => i + 1).filter(
      (num) => !soldNumbers.includes(num),
    );
  }, [maxTickets, soldNumbers]);

  const toggle = (num: number) => {
    if (soldNumbers.includes(num)) return;
    setError(null);
    setSelectedNumbers((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num],
    );
  };

  const handleSelectAll = () => {
    setError(null);

    if (selectedNumbers.length === availableNumbers.length) {
      setSelectedNumbers([]);
    } else {
      setSelectedNumbers(availableNumbers);
    }
  };

  const handleBuy = async () => {
    if (!userId) {
      router.push("/auth/login");
      return;
    }

    startTransition(async () => {
      const res = await buyTickets(raffleId, userId, selectedNumbers);
      if (res.success) {
        setSuccess(true);
        setSelectedNumbers([]);
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  };

  if (success)
    return (
      <div className="bg-slate-900/60 backdrop-blur-xl p-12 rounded-[3.5rem] border border-emerald-500/20 shadow-2xl text-center space-y-8 animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(16,185,129,0.2)] border border-emerald-500/30">
          <CheckCircle2 size={48} />
        </div>
        <div className="space-y-2">
          <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">
            ¡Transacción <span className="text-emerald-400">Exitosa!</span>
          </h3>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.2em]">
            Tus boletos han sido cifrados en la bóveda oficial.
          </p>
        </div>
        <button
          onClick={() => setSuccess(false)}
          className="w-full bg-white/5 border border-white/10 text-white p-6 rounded-3xl font-black uppercase text-xs hover:bg-white/10 transition-all tracking-[0.2em]"
        >
          Adquirir Más Números
        </button>
      </div>
    );

  return (
    <div className="bg-slate-900/40 backdrop-blur-3xl p-8 md:p-12 rounded-[3.5rem] border border-white/5 shadow-2xl space-y-10 relative overflow-hidden">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-primary-dynamic/20 p-3 rounded-2xl border border-primary-dynamic/30">
            <Ticket className="text-primary-dynamic" size={28} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">
              Selector de <span className="text-primary-dynamic">Tickets</span>
            </h3>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">
              Escoge tu combinación ganadora
            </p>
          </div>
        </div>

        <div className="bg-black/40 px-6 py-3 rounded-2xl border border-white/5 flex items-center gap-4 shadow-inner">
          <Wallet className="text-slate-500" size={20} />
          <div className="text-right">
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
              Saldo Disponible
            </p>
            <p className="text-lg font-black text-white tracking-tighter">
              ${userBalance.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSelectAll}
          disabled={availableNumbers.length === 0 || isPending}
          className="group flex items-center gap-2 bg-white/5 hover:bg-primary-dynamic border border-white/10 hover:border-primary-dynamic px-5 py-2.5 rounded-xl transition-all duration-300 disabled:opacity-30"
        >
          <Zap
            size={14}
            className="text-primary-dynamic group-hover:text-white transition-colors"
          />
          <span className="text-[9px] font-black text-white uppercase tracking-widest">
            {selectedNumbers.length === availableNumbers.length
              ? "Deseleccionar Todo"
              : "Seleccionar Disponibles"}
          </span>
        </button>
      </div>

      {/* CUADRÍCULA DE NÚMEROS OPTIMIZADA */}
      <div className="bg-black/20 p-6 rounded-[2.5rem] border border-white/5 shadow-inner">
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-3 max-h-[400px] overflow-y-auto pr-3 custom-scrollbar">
          {Array.from({ length: maxTickets }, (_, i) => i + 1).map((num) => {
            const isSold = soldNumbers.includes(num);
            const isSelected = selectedNumbers.includes(num);

            return (
              <button
                key={num}
                disabled={isSold || isPending}
                onClick={() => toggle(num)}
                className={`
                  aspect-square rounded-2xl text-xs md:text-sm font-black transition-all duration-300 relative group/btn
                  ${
                    isSold
                      ? "bg-white/5 text-white/10 cursor-not-allowed border border-transparent"
                      : isSelected
                        ? "bg-primary-dynamic text-white shadow-[0_0_25px_var(--primary-brand-alpha)] scale-110 border border-white/20 z-10"
                        : "bg-white/5 text-slate-400 hover:text-white border border-white/5 hover:border-primary-dynamic/50 hover:bg-primary-dynamic/5"
                  }
                `}
              >
                {num.toString().padStart(2, "0")}
                {isSold && (
                  <XCircle
                    size={10}
                    className="absolute top-1 right-1 opacity-20"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-8 pt-8 border-t border-white/5 text-center">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 animate-in fade-in">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
            Monto Total a Debitar
          </p>
          <p
            className={`text-6xl md:text-7xl font-black italic tracking-tighter transition-all duration-500 ${
              !hasBalance && selectedNumbers.length > 0
                ? "text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                : "text-white"
            }`}
          >
            ${totalCost.toFixed(2)}
          </p>
        </div>

        <button
          onClick={handleBuy}
          disabled={
            selectedNumbers.length === 0 ||
            isPending ||
            (!hasBalance && !!userId)
          }
          className="w-full relative group overflow-hidden bg-primary-dynamic text-white p-7 rounded-[2.5rem] font-black uppercase text-sm tracking-[0.4em] shadow-2xl transition-all hover:brightness-110 disabled:grayscale disabled:opacity-20 disabled:cursor-not-allowed"
        >
          <div className="relative z-10 flex items-center justify-center gap-4">
            {isPending ? (
              <Loader2 className="animate-spin" size={24} />
            ) : !hasBalance && !!userId ? (
              <>FONDOS INSUFICIENTES</>
            ) : (
              <>
                <MousePointer2 size={20} />
                CONFIRMAR ADQUISICIÓN ({selectedNumbers.length})
              </>
            )}
          </div>

          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </button>

        {!userId && (
          <p className="text-[9px] font-black text-primary-dynamic uppercase tracking-widest animate-pulse">
            * Se requiere autenticación para procesar la orden
          </p>
        )}
      </div>
    </div>
  );
}
