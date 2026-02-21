"use client";

import React, { useState } from "react";
import Image from "next/image";
import { processInstantDeposit, processWithdrawalRequest } from "./actions";
import {
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  CreditCard,
  Ticket,
  Zap,
  Star,
  Smartphone,
  Globe,
  Bitcoin,
} from "lucide-react";

interface Transaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  referenceId: string | null;
  paymentMethod: string | null;
  createdAt: string;
}

interface WalletClientProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    walletBalance: number;
  };
  transactions: Transaction[];
}

export default function WalletClient({
  user,
  transactions,
}: WalletClientProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [metodo, setMetodo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [view, setView] = useState<"DEPOSIT" | "WITHDRAW">("DEPOSIT");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    const formData = new FormData(e.currentTarget);
    formData.append("metodoPago", metodo);

    try {
      const response =
        view === "DEPOSIT"
          ? await processInstantDeposit(user.id, formData)
          : await processWithdrawalRequest(user.id, formData);

      if (response.success) {
        setSuccessMsg(
          view === "DEPOSIT"
            ? "Protocolo de recarga exitoso."
            : "Retiro enviado a auditoría.",
        );
        (e.target as HTMLFormElement).reset();
        setMetodo("");
      } else {
        setError(response.error || "Fallo en la verificación.");
      }
    } catch (err) {
      setError("Fallo crítico de enlace con la pasarela.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      {/* SECCIÓN BALANCE PREMIUM (Glow Superior de Cristal) */}
      <div className="relative bg-[#0f172a]/60 rounded-[3.5rem] p-10 md:p-14 border border-white/10 shadow-2xl overflow-hidden group">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-40 blur-[1px]" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="bg-amber-500/20 p-3 rounded-2xl border border-amber-500/20">
                <Wallet className="text-amber-500" size={24} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
                Balance Disponible
              </p>
            </div>
            <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-white drop-shadow-2xl">
              $
              {user.walletBalance.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </h1>
          </div>

          <div className="bg-white/[0.03] backdrop-blur-md border border-white/5 p-8 rounded-[2.5rem] text-right">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">
              Titular Certificado
            </p>
            <p className="text-2xl font-black uppercase italic text-white mt-1">
              {user.firstName} {user.lastName}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
        <div className="lg:col-span-5 flex">
          <div className="bg-[#0f172a]/40 p-10 rounded-[3.5rem] border border-white/5 shadow-2xl w-full flex flex-col">
            <div className="flex gap-4 mb-10 bg-black/20 p-2 rounded-3xl border border-white/5">
              <button
                type="button"
                onClick={() => {
                  setView("DEPOSIT");
                  setMetodo("");
                }}
                className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${view === "DEPOSIT" ? "bg-amber-500 text-slate-950 shadow-lg" : "text-slate-500"}`}
              >
                Añadir Fondos
              </button>
              <button
                type="button"
                onClick={() => {
                  setView("WITHDRAW");
                  setMetodo("");
                }}
                className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${view === "WITHDRAW" ? "bg-white text-slate-950 shadow-lg" : "text-slate-500"}`}
              >
                Retirar Capital
              </button>
            </div>

            {error && (
              <div className="bg-red-500/10 text-red-500 p-5 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase border border-red-500/20 mb-6 animate-pulse">
                <AlertCircle size={18} />
                {error}
              </div>
            )}
            {successMsg && (
              <div className="bg-emerald-500/10 text-emerald-500 p-5 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase border border-emerald-500/20 mb-6">
                <CheckCircle2 size={18} />
                {successMsg}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="flex-1 flex flex-col justify-between space-y-8"
            >
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">
                    Monto (USD)
                  </label>
                  <div className="relative">
                    <span
                      className={`absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black ${view === "DEPOSIT" ? "text-amber-500" : "text-white"}`}
                    >
                      $
                    </span>
                    <input
                      name="amount"
                      type="number"
                      step="0.01"
                      required
                      disabled={isLoading}
                      className="w-full bg-slate-900/50 border-2 border-white/5 focus:border-white/20 p-6 pl-14 rounded-3xl outline-none font-black text-white text-3xl transition-all placeholder:text-slate-800"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {view === "DEPOSIT" && (
                  <div className="space-y-6 animate-in slide-in-from-left-4">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">
                        Método Express
                      </label>
                      <div className="grid grid-cols-1 gap-3">
                        <button
                          type="button"
                          onClick={() => setMetodo("APPLE_PAY")}
                          className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${metodo === "APPLE_PAY" ? "border-white bg-white text-black" : "border-white/5 bg-black text-white hover:border-white/20"}`}
                        >
                          <div className="flex items-center gap-3">
                            <Smartphone size={20} />
                            <span className="text-xs font-black uppercase">
                              Apple Pay
                            </span>
                          </div>
                          <span className="text-[8px] font-black bg-amber-500 text-black px-2 py-1 rounded-full flex items-center gap-1">
                            <Star size={10} fill="currentColor" /> RECOMENDADO
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setMetodo("GOOGLE_PAY")}
                          className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${metodo === "GOOGLE_PAY" ? "border-blue-500 bg-white text-slate-900" : "border-white/5 bg-slate-800 text-white hover:border-white/20"}`}
                        >
                          <div className="flex items-center gap-3">
                            <Image
                              src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg"
                              alt="GPay"
                              width={40}
                              height={20}
                            />
                            <span className="text-xs font-black uppercase">
                              Google Pay
                            </span>
                          </div>
                          <span className="text-[8px] font-black bg-amber-500 text-black px-2 py-1 rounded-full flex items-center gap-1">
                            <Star size={10} fill="currentColor" /> RECOMENDADO
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-white/5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">
                        Pasarelas Adicionales
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: "STRIPE", icon: CreditCard, label: "Card" },
                          { id: "PAYPAL", icon: Globe, label: "PayPal" },
                          { id: "BINANCE", icon: Bitcoin, label: "Binance" },
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setMetodo(item.id)}
                            className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 ${metodo === item.id ? "border-amber-500 bg-amber-500/10 text-white" : "border-white/5 bg-white/5 text-slate-400 hover:text-white"}`}
                          >
                            <item.icon size={20} />
                            <span className="text-[8px] font-black uppercase tracking-tighter">
                              {item.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {view === "WITHDRAW" && (
                  <div className="space-y-4 animate-in slide-in-from-right-4">
                    <select
                      name="withdrawalMethod"
                      required
                      className="w-full bg-slate-900/50 border-2 border-white/5 p-6 rounded-2xl outline-none font-bold text-white appearance-none cursor-pointer"
                    >
                      <option value="BANK">Transferencia Bancaria</option>
                      <option value="BINANCE">Binance (USDT)</option>
                      <option value="PAYPAL">PayPal Business</option>
                    </select>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || !metodo}
                className={`w-full p-6 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-2xl mt-auto ${view === "DEPOSIT" ? "bg-amber-500 text-slate-950 shadow-amber-500/20" : "bg-white text-slate-950 shadow-white/20"}`}
              >
                {isLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    {view === "DEPOSIT"
                      ? "Confirmar Recarga"
                      : "Solicitar Retiro"}{" "}
                    <Zap size={18} fill="currentColor" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-7 flex">
          <div className="bg-[#0f172a]/40 p-10 rounded-[3.5rem] border border-white/5 shadow-2xl w-full flex flex-col">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-8 border-b border-white/5 pb-6">
              Libro de <span className="text-amber-500">Movimientos</span>
            </h3>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar flex-1">
              {transactions.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                  <Clock size={48} className="mb-4 text-slate-500" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
                    Sin registros operativos
                  </p>
                </div>
              ) : (
                transactions.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all group"
                  >
                    <div className="flex items-center gap-5">
                      <div className="bg-slate-900 p-3 rounded-2xl border border-white/5 group-hover:border-amber-500/30 transition-colors text-slate-400 group-hover:text-amber-500">
                        {t.type === "DEPOSIT" ? (
                          <ArrowDownCircle size={20} />
                        ) : (
                          <ArrowUpCircle size={20} />
                        )}
                      </div>
                      <div>
                        <p className="font-black text-white uppercase italic text-sm tracking-tight">
                          {t.type === "DEPOSIT"
                            ? "Recarga de Bóveda"
                            : "Retiro Solicitado"}
                        </p>
                        <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">
                          Metodo: {t.paymentMethod} •{" "}
                          {new Date(t.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-xl font-mono font-black ${t.amount >= 0 ? "text-emerald-500" : "text-white"}`}
                      >
                        {t.amount >= 0 ? "+" : "-"}$
                        {Math.abs(t.amount).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                      <div className="flex items-center justify-end gap-1.5 mt-1 text-[8px] font-black uppercase text-slate-500">
                        <CheckCircle2
                          size={10}
                          className={
                            t.status === "COMPLETED"
                              ? "text-emerald-500"
                              : "text-amber-500"
                          }
                        />{" "}
                        {t.status}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
