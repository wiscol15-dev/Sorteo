"use client";

import { useState, useTransition, useMemo, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import {
  Ticket,
  Wallet,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Zap,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { buyTickets } from "@/app/admin/sorteos/actions";

// Mantenemos la interfaz intacta para no romper las props que envía page.tsx
interface BankAccount {
  titular?: string;
  doc?: string;
  account?: string;
  phone?: string;
  type?: string;
}

interface Props {
  raffleId: string;
  raffleTitle: string;
  raffleDescription: string;
  type?: "INTERNAL" | "EXTERNAL"; // Se mantiene por compatibilidad de TS
  maxTickets: number;
  pricePerTicket: number;
  soldNumbers: number[];
  totalSold: number;
  userId: string | null;
  userBalance: number;
  bankAccounts?: Record<string, BankAccount>; // Ya no se usa aquí, pero evita errores de TS
}

const ITEMS_PER_PAGE = 100;

// ============================================================================
// OPTIMIZACIÓN SENIOR: Componente de Botón Memoizado.
// Esto ELIMINA EL LAG al seleccionar números. Solo re-renderiza el botón tocado.
// ============================================================================
const TicketButton = memo(
  ({ num, isSold, isSelected, isPending, onToggle }: any) => {
    return (
      <button
        disabled={isSold || isPending}
        onClick={() => onToggle(num)}
        className={`aspect-square rounded-xl lg:rounded-2xl text-[10px] lg:text-xs font-black transition-all relative ${
          isSold
            ? "bg-slate-900 text-slate-800 cursor-not-allowed"
            : isSelected
              ? "bg-primary-dynamic text-white scale-105 shadow-md shadow-primary-dynamic/30"
              : "bg-slate-800 text-slate-400 border border-slate-700 hover:border-primary-dynamic/50 hover:bg-slate-800/80 active:scale-95"
        }`}
      >
        {num.toString().padStart(2, "0")}
        {isSold && (
          <XCircle size={8} className="absolute top-1 right-1 opacity-20" />
        )}
      </button>
    );
  },
);
TicketButton.displayName = "TicketButton";

// ============================================================================
// COMPONENTE PRINCIPAL (Solo Sorteos Internos)
// ============================================================================
export default function TicketSelector({
  raffleId,
  raffleTitle,
  maxTickets,
  pricePerTicket,
  soldNumbers,
  totalSold,
  userId,
  userBalance,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const availableCount = maxTickets - totalSold;
  const isSoldOut = availableCount <= 0;
  const totalPages = Math.ceil(maxTickets / ITEMS_PER_PAGE);

  // OPTIMIZACIÓN DE MEMORIA O(1): Tablas Hash para búsquedas instantáneas
  const soldSet = useMemo(() => new Set(soldNumbers), [soldNumbers]);
  const selectedSet = useMemo(
    () => new Set(selectedNumbers),
    [selectedNumbers],
  );

  const currentViewNumbers = useMemo(() => {
    const startNum = (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const endNum = Math.min(currentPage * ITEMS_PER_PAGE, maxTickets);
    return Array.from(
      { length: endNum - startNum + 1 },
      (_, i) => startNum + i,
    );
  }, [maxTickets, currentPage]);

  const totalCost = selectedNumbers.length * pricePerTicket;
  const hasBalance = userBalance >= totalCost;

  // useCallback previene la re-creación de funciones y protege el React.memo
  const toggle = useCallback((num: number) => {
    setError(null);
    setSelectedNumbers((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num],
    );
  }, []);

  const handleSelectPageAvailable = () => {
    setError(null);
    const availableInPage = currentViewNumbers.filter(
      (num) => !soldSet.has(num),
    );
    const allPageSelected = availableInPage.every((num) =>
      selectedSet.has(num),
    );

    if (allPageSelected) {
      setSelectedNumbers((prev) =>
        prev.filter((num) => !availableInPage.includes(num)),
      );
    } else {
      const newSelections = new Set([...selectedNumbers, ...availableInPage]);
      setSelectedNumbers(Array.from(newSelections));
    }
  };

  const handleInternalBuy = async () => {
    if (!userId) return router.push("/auth/login");
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

  // ================= PANTALLA DE ÉXITO =================
  if (success) {
    return (
      <div className="bg-slate-900 p-8 lg:p-12 rounded-[2rem] lg:rounded-[3.5rem] border border-slate-800 shadow-xl text-center space-y-6 lg:space-y-8 animate-in zoom-in duration-300">
        <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center mx-auto border bg-emerald-900 text-emerald-400 border-emerald-800">
          <CheckCircle2 size={40} />
        </div>
        <div className="space-y-2">
          <h3 className="text-3xl lg:text-4xl font-black text-white uppercase italic tracking-tighter">
            ¡Transacción <span className="text-emerald-400">Exitosa!</span>
          </h3>
          <p className="text-slate-400 text-xs lg:text-sm font-bold uppercase tracking-[0.2em]">
            Boletos cifrados en la bóveda oficial.
          </p>
        </div>
        <button
          onClick={() => setSuccess(false)}
          className="w-full bg-slate-800 border border-slate-700 text-white p-5 lg:p-6 rounded-2xl lg:rounded-3xl font-black uppercase text-[10px] lg:text-xs tracking-[0.2em] transition-colors hover:bg-slate-700"
        >
          Adquirir Más Números
        </button>
      </div>
    );
  }

  // ================= UI PRINCIPAL (GRILLA) =================
  return (
    <div className="bg-slate-900 p-6 lg:p-12 rounded-[2rem] lg:rounded-[3.5rem] border border-slate-800 shadow-xl space-y-8 lg:space-y-10">
      {/* CABECERA */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-6">
        <div className="flex items-center gap-4 w-full overflow-hidden">
          <div className="bg-primary-dynamic/20 p-3 rounded-2xl border border-primary-dynamic/30 shrink-0">
            <Ticket className="text-primary-dynamic" size={24} />
          </div>
          <div className="min-w-0">
            <h3 className="text-xl lg:text-2xl font-black text-white uppercase italic tracking-tighter truncate">
              Selector de <span className="text-primary-dynamic">Tickets</span>
            </h3>
          </div>
        </div>

        <div className="bg-slate-950 px-5 py-3 rounded-2xl border border-slate-800 flex items-center gap-3 shrink-0 w-full lg:w-auto justify-between lg:justify-start">
          <Wallet className="text-slate-500" size={18} />
          <div className="text-right">
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
              Saldo Billetera
            </p>
            <p className="text-base lg:text-lg font-black text-white tracking-tighter">
              ${userBalance.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {isSoldOut ? (
        <div className="bg-slate-950 border border-red-900 rounded-[2rem] p-8 text-center space-y-4">
          <ShieldAlert size={32} className="text-red-500 mx-auto" />
          <h4 className="text-2xl font-black text-white uppercase tracking-tighter italic">
            Boletería Agotada
          </h4>
        </div>
      ) : (
        <div className="space-y-6 lg:space-y-8">
          {/* ACCIONES RÁPIDAS DE LA GRILLA */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {selectedNumbers.length > 0 ? (
                <span className="text-primary-dynamic">
                  {selectedNumbers.length} Boletos Seleccionados
                </span>
              ) : (
                "Selecciona tus números"
              )}
            </p>
            <button
              onClick={handleSelectPageAvailable}
              disabled={currentViewNumbers.length === 0 || isPending}
              className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl flex items-center justify-center gap-2 text-[8px] lg:text-[9px] font-black text-white uppercase tracking-widest transition-colors disabled:opacity-50"
            >
              <Zap size={12} className="text-primary-dynamic" /> Toda la página
            </button>
          </div>

          {/* GRILLA DE BOTONES MEMOIZADA */}
          <div className="bg-slate-950 p-4 lg:p-6 rounded-[2rem] border border-slate-800">
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 lg:gap-3">
              {currentViewNumbers.map((num) => (
                <TicketButton
                  key={num}
                  num={num}
                  isSold={soldSet.has(num)}
                  isSelected={selectedSet.has(num)}
                  isPending={isPending}
                  onToggle={toggle}
                />
              ))}
            </div>

            {/* PAGINACIÓN */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 bg-slate-900 p-2 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || isPending}
                  className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg disabled:opacity-30 text-white transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="text-center">
                  <span className="block text-[10px] font-black text-white uppercase tracking-widest">
                    Pág {currentPage}/{totalPages}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages || isPending}
                  className="p-3 bg-slate-800 hover:bg-slate-700 rounded-lg disabled:opacity-30 text-white transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>

          {/* RESUMEN DE COMPRA */}
          <div className="text-center">
            <p className="text-[9px] lg:text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
              Total a Debitar
            </p>
            <p
              className={`text-5xl lg:text-7xl font-black italic tracking-tighter transition-colors ${
                !hasBalance && selectedNumbers.length > 0
                  ? "text-red-500"
                  : "text-white"
              }`}
            >
              ${totalCost.toFixed(2)}
            </p>
          </div>

          {error && (
            <div className="bg-red-900/50 text-red-400 p-3 rounded-xl text-[9px] font-black uppercase text-center border border-red-800">
              {error}
            </div>
          )}

          {/* BOTÓN DE PAGO FINAL */}
          <button
            onClick={handleInternalBuy}
            disabled={
              selectedNumbers.length === 0 ||
              isPending ||
              (!hasBalance && !!userId)
            }
            className="w-full bg-primary-dynamic hover:bg-primary-dynamic/90 text-white p-5 lg:p-6 rounded-2xl lg:rounded-[2rem] font-black uppercase text-[10px] lg:text-xs tracking-[0.3em] disabled:opacity-30 transition-all shadow-lg"
          >
            {isPending ? (
              <Loader2 className="animate-spin mx-auto" size={20} />
            ) : !hasBalance && !!userId ? (
              "FONDOS INSUFICIENTES"
            ) : (
              `CONFIRMAR COMPRA (${selectedNumbers.length})`
            )}
          </button>

          {!userId && (
            <p className="text-[9px] text-center font-black text-primary-dynamic uppercase tracking-widest animate-pulse mt-4">
              * Se requiere iniciar sesión para procesar la orden
            </p>
          )}
        </div>
      )}
    </div>
  );
}
