"use client";

import { useState } from "react";
import { Trophy, X, Loader2, AlertCircle } from "lucide-react";
import { resolveExternalRaffle } from "./actions";

export default function ResolveExternalButton({
  raffleId,
  isThresholdMet,
  maxTickets,
}: {
  raffleId: string;
  isThresholdMet: boolean;
  maxTickets: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [winningNumber, setWinningNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResolve = async () => {
    if (!isThresholdMet) {
      setError("No se ha cumplido la meta de ventas. Prolonga la fecha.");
      return;
    }

    const num = Number(winningNumber);
    if (!num || num <= 0 || num > maxTickets) {
      setError(`El número debe estar entre 1 y ${maxTickets}.`);
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await resolveExternalRaffle(raffleId, num);

    if (result && !result.success) {
      setError(result.error || "Error al procesar.");
      setIsLoading(false);
    } else {
      setIsOpen(false);
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-indigo-50 hover:bg-indigo-500 text-indigo-500 hover:text-white p-3 rounded-xl transition-colors shadow-sm"
        title="Declarar Ganador Externo"
      >
        <Trophy size={16} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl w-full max-w-md relative animate-in zoom-in-95">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="mb-6">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                <Trophy size={24} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900">
                Resolución Externa
              </h3>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                Ingresa el número ganador oficial
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-xs font-black uppercase tracking-widest mb-6">
                <AlertCircle size={16} className="shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {!isThresholdMet && !error && (
              <div className="bg-amber-50 text-amber-600 p-4 rounded-2xl flex items-center gap-3 text-xs font-black uppercase tracking-widest mb-6">
                <AlertCircle size={16} className="shrink-0" />
                <p>
                  Meta no cumplida. Debes prolongar la fecha editando el sorteo.
                </p>
              </div>
            )}

            <div className="space-y-4 mb-8">
              <div className="relative">
                <input
                  type="number"
                  value={winningNumber}
                  onChange={(e) => setWinningNumber(e.target.value)}
                  placeholder={`Ej: 123 (Max: ${maxTickets})`}
                  disabled={isLoading || !isThresholdMet}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-200 focus:bg-white p-5 rounded-2xl outline-none transition-all font-black text-slate-900 text-center text-2xl disabled:opacity-50"
                />
              </div>
            </div>

            <button
              onClick={handleResolve}
              disabled={isLoading || !isThresholdMet || !winningNumber}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Trophy size={18} />
              )}
              {isLoading ? "Procesando..." : "Confirmar Ganador"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
