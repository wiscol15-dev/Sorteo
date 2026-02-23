"use client";

import { useState, useTransition, useMemo, useRef } from "react";
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
  Minus,
  Plus,
  Shuffle,
  Landmark,
  UploadCloud,
  Clock,
  Building2,
  User,
  ShieldAlert,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  buyTickets,
  buyRandomTickets,
  buyRandomTicketsManual,
} from "@/app/admin/sorteos/actions";

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
  type?: "INTERNAL" | "EXTERNAL";
  maxTickets: number;
  pricePerTicket: number;
  soldNumbers: number[];
  totalSold: number;
  userId: string | null;
  userBalance: number;
  bankAccounts: Record<string, BankAccount>;
}

const ITEMS_PER_PAGE = 100;

export default function TicketSelector({
  raffleId,
  raffleTitle,
  raffleDescription,
  type = "INTERNAL",
  maxTickets,
  pricePerTicket,
  soldNumbers,
  totalSold,
  userId,
  userBalance,
  bankAccounts,
}: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<"WALLET" | "MANUAL">(
    "WALLET",
  );
  const [selectedBank, setSelectedBank] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [manualSuccess, setManualSuccess] = useState(false);

  const [receiptName, setReceiptName] = useState<string>("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(maxTickets / ITEMS_PER_PAGE);

  const isExternal = type === "EXTERNAL";
  const availableCount = maxTickets - totalSold;
  const isSoldOut = availableCount <= 0;

  const currentViewNumbers = useMemo(() => {
    if (isExternal) return [];
    const startNum = (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const endNum = Math.min(currentPage * ITEMS_PER_PAGE, maxTickets);
    return Array.from(
      { length: endNum - startNum + 1 },
      (_, i) => startNum + i,
    );
  }, [maxTickets, currentPage, isExternal]);

  const currentSelectionCount = isExternal ? quantity : selectedNumbers.length;
  const totalCost = isSoldOut ? 0 : currentSelectionCount * pricePerTicket;
  const hasBalance = userBalance >= totalCost;

  const availableBanksList = Object.keys(bankAccounts || {});

  const toggle = (num: number) => {
    if (soldNumbers.includes(num)) return;
    setError(null);
    setSelectedNumbers((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num],
    );
  };

  const handleSelectPageAvailable = () => {
    setError(null);
    const availableInPage = currentViewNumbers.filter(
      (num) => !soldNumbers.includes(num),
    );
    const allPageSelected = availableInPage.every((num) =>
      selectedNumbers.includes(num),
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

  const handleQuantityChange = (newQuantity: number) => {
    setError(null);
    if (newQuantity < 1) {
      setQuantity(1);
    } else if (newQuantity > availableCount) {
      setQuantity(availableCount);
    } else {
      setQuantity(newQuantity);
    }
  };

  const handleBuy = async () => {
    if (!userId) {
      router.push("/auth/login");
      return;
    }

    startTransition(async () => {
      let res;
      if (isExternal) {
        res = await buyRandomTickets(raffleId, userId, quantity);
      } else {
        res = await buyTickets(raffleId, userId, selectedNumbers);
      }

      if (res.success) {
        setSuccess(true);
        setSelectedNumbers([]);
        setQuantity(1);
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  };

  const handleManualSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) {
      router.push("/auth/login");
      return;
    }

    if (!selectedBank) {
      setError(
        "Debes seleccionar el banco al que realizaste la transferencia.",
      );
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.append("raffleId", raffleId);
    formData.append("userId", userId);

    const qtyToSend = isExternal ? quantity : selectedNumbers.length;
    formData.append("quantity", qtyToSend.toString());

    startTransition(async () => {
      const res = await buyRandomTicketsManual(formData);
      if (res.success) {
        setManualSuccess(true);
        setQuantity(1);
        setSelectedNumbers([]);
        setReceiptName("");
        setSelectedBank(null);
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  };

  const copyToClipboard = (text: string, fieldType: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldType);
    setTimeout(() => setCopiedField(null), 2000);
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

  if (manualSuccess)
    return (
      <div className="bg-slate-900/60 backdrop-blur-xl p-12 rounded-[3.5rem] border border-indigo-500/20 shadow-2xl text-center space-y-8 animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(99,102,241,0.2)] border border-indigo-500/30">
          <Clock size={48} />
        </div>
        <div className="space-y-2">
          <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">
            ¡Reporte <span className="text-indigo-400">Enviado!</span>
          </h3>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.2em]">
            Tus boletos han sido reservados. Esperando validación del
            administrador.
          </p>
        </div>
        <button
          onClick={() => setManualSuccess(false)}
          className="w-full bg-white/5 border border-white/10 text-white p-6 rounded-3xl font-black uppercase text-xs hover:bg-white/10 transition-all tracking-[0.2em]"
        >
          Volver al Sorteo
        </button>
      </div>
    );

  return (
    <div className="bg-slate-900/40 backdrop-blur-3xl p-8 md:p-12 rounded-[3.5rem] border border-white/5 shadow-2xl space-y-10 relative overflow-hidden">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 w-full md:w-auto overflow-hidden">
          <div className="bg-primary-dynamic/20 p-3 rounded-2xl border border-primary-dynamic/30 shrink-0">
            {isExternal ? (
              <Shuffle className="text-primary-dynamic" size={28} />
            ) : (
              <Ticket className="text-primary-dynamic" size={28} />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none truncate">
              {isExternal ? (
                <span className="text-primary-dynamic">{raffleTitle}</span>
              ) : (
                <>
                  Selector de{" "}
                  <span className="text-primary-dynamic">Tickets</span>
                </>
              )}
            </h3>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1 line-clamp-2">
              {isExternal
                ? raffleDescription
                : "Escoge tu combinación ganadora"}
            </p>
          </div>
        </div>

        <div className="bg-black/40 px-6 py-3 rounded-2xl border border-white/5 flex items-center gap-4 shadow-inner shrink-0">
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

      {isSoldOut ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-[2.5rem] p-10 md:p-14 text-center space-y-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-10" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6 border border-red-500/30">
              <ShieldAlert size={40} className="text-red-500" />
            </div>
            <h4 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter italic leading-none mb-3">
              Boletería Totalmente <span className="text-red-500">Agotada</span>
            </h4>
            <p className="text-xs md:text-sm font-black text-slate-400 uppercase tracking-widest leading-relaxed max-w-lg mx-auto">
              El inventario de tickets para este evento ha sido asignado en su
              totalidad. Te invitamos a mantenerte atento a nuestras próximas
              ediciones.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5 shadow-inner">
            <button
              onClick={() => {
                setPaymentMethod("WALLET");
                setError(null);
              }}
              className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
                paymentMethod === "WALLET"
                  ? "bg-primary-dynamic text-white shadow-lg shadow-primary-dynamic/20"
                  : "text-slate-500 hover:text-white hover:bg-white/5"
              }`}
            >
              <Wallet size={16} /> Saldo Wallet
            </button>
            <button
              onClick={() => {
                setPaymentMethod("MANUAL");
                setError(null);
              }}
              className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
                paymentMethod === "MANUAL"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : "text-slate-500 hover:text-white hover:bg-white/5"
              }`}
            >
              <Landmark size={16} /> Pago Externo
            </button>
          </div>

          {!isExternal ? (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {selectedNumbers.length > 0 ? (
                    <span className="text-primary-dynamic">
                      {selectedNumbers.length} Boletos Seleccionados
                    </span>
                  ) : (
                    <span>Selecciona tus números</span>
                  )}
                </p>

                <button
                  onClick={handleSelectPageAvailable}
                  disabled={currentViewNumbers.length === 0 || isPending}
                  className="w-full sm:w-auto group flex items-center justify-center gap-2 bg-white/5 hover:bg-primary-dynamic border border-white/10 hover:border-primary-dynamic px-5 py-2.5 rounded-xl transition-all duration-300 disabled:opacity-30"
                >
                  <Zap
                    size={14}
                    className="text-primary-dynamic group-hover:text-white transition-colors"
                  />
                  <span className="text-[9px] font-black text-white uppercase tracking-widest">
                    Seleccionar Página Actual
                  </span>
                </button>
              </div>

              <div className="bg-black/20 p-6 rounded-[2.5rem] border border-white/5 shadow-inner">
                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-3">
                  {currentViewNumbers.map((num) => {
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

                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-8 bg-black/40 p-2 rounded-2xl border border-white/5">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-4 bg-white/5 hover:bg-white/10 rounded-xl disabled:opacity-30 transition-all text-white flex items-center justify-center"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <div className="text-center">
                      <span className="block text-xs font-black text-white uppercase tracking-widest">
                        Página {currentPage} / {totalPages}
                      </span>
                      <span className="block text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                        Del {(currentPage - 1) * ITEMS_PER_PAGE + 1} al{" "}
                        {Math.min(currentPage * ITEMS_PER_PAGE, maxTickets)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="p-4 bg-white/5 hover:bg-white/10 rounded-xl disabled:opacity-30 transition-all text-white flex items-center justify-center"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-black/20 p-8 md:p-12 rounded-[2.5rem] border border-white/5 shadow-inner flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in-95">
              <div className="text-center space-y-2">
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                  Boletos Disponibles
                </p>
                <p className="text-3xl font-black text-white italic tracking-tighter">
                  {availableCount}{" "}
                  <span className="text-primary-dynamic text-xl">
                    / {maxTickets}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-6 bg-slate-900/50 p-4 rounded-[2rem] border border-white/10 shadow-2xl">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1 || isPending}
                  className="w-14 h-14 rounded-2xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Minus size={24} />
                </button>

                <div className="w-24 text-center">
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      handleQuantityChange(parseInt(e.target.value) || 1)
                    }
                    disabled={isPending}
                    className="w-full bg-transparent text-center text-5xl font-black text-white italic tracking-tighter outline-none appearance-none"
                    min="1"
                    max={availableCount}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= availableCount || isPending}
                  className="w-14 h-14 rounded-2xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Plus size={24} />
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 animate-in fade-in">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div className="text-center space-y-1">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
              Monto Total
            </p>
            <p
              className={`text-6xl md:text-7xl font-black italic tracking-tighter transition-all duration-500 ${
                paymentMethod === "WALLET" &&
                !hasBalance &&
                currentSelectionCount > 0
                  ? "text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                  : "text-white"
              }`}
            >
              ${totalCost.toFixed(2)}
            </p>
          </div>

          {paymentMethod === "WALLET" ? (
            <div className="space-y-4">
              <button
                onClick={handleBuy}
                disabled={
                  currentSelectionCount === 0 ||
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
                      {isExternal ? (
                        <Shuffle size={20} />
                      ) : (
                        <MousePointer2 size={20} />
                      )}
                      CONFIRMAR ADQUISICIÓN ({currentSelectionCount})
                    </>
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </button>
              {!userId && (
                <p className="text-[9px] text-center font-black text-primary-dynamic uppercase tracking-widest animate-pulse">
                  * Se requiere autenticación para procesar la orden
                </p>
              )}
            </div>
          ) : (
            <form
              onSubmit={handleManualSubmit}
              className="bg-black/20 p-8 rounded-[2.5rem] border border-white/5 shadow-inner space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-3">
                  <Building2 size={14} className="text-indigo-400" />
                  1. Selecciona el banco a transferir
                </p>

                {availableBanksList.length === 0 ? (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs font-black uppercase tracking-widest text-center">
                    NO HAY CUENTAS BANCARIAS CONFIGURADAS POR EL ADMINISTRADOR.
                  </div>
                ) : (
                  <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-4 -mx-2 px-2">
                    {availableBanksList.map((bank) => (
                      <button
                        key={bank}
                        type="button"
                        onClick={() => setSelectedBank(bank)}
                        className={`flex-shrink-0 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                          selectedBank === bank
                            ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20 scale-105"
                            : "bg-slate-900/50 border-white/5 text-slate-400 hover:bg-slate-800 hover:text-white"
                        }`}
                      >
                        {bank}
                      </button>
                    ))}
                  </div>
                )}

                {selectedBank && bankAccounts[selectedBank] && (
                  <div className="bg-slate-900 border border-indigo-500/30 p-6 rounded-2xl animate-in fade-in slide-in-from-top-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                      <Landmark size={80} />
                    </div>
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5 relative z-10">
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                        Datos para Depósito / Transferencia
                      </span>
                      <span className="text-xs font-black text-white bg-white/5 px-3 py-1 rounded-full">
                        {selectedBank}
                      </span>
                    </div>
                    <div className="space-y-2.5 text-xs font-medium text-slate-300 tracking-wide font-mono relative z-10">
                      {bankAccounts[selectedBank].titular && (
                        <p className="flex justify-between items-center border-b border-white/5 pb-1">
                          <span className="text-slate-500">Titular:</span>
                          <span className="text-white font-bold">
                            {bankAccounts[selectedBank].titular}
                          </span>
                        </p>
                      )}
                      {bankAccounts[selectedBank].doc && (
                        <p className="flex justify-between items-center border-b border-white/5 pb-1">
                          <span className="text-slate-500">Documento/RIF:</span>
                          <span className="text-white font-bold">
                            {bankAccounts[selectedBank].doc}
                          </span>
                        </p>
                      )}
                      {bankAccounts[selectedBank].account && (
                        <div className="flex justify-between items-center border-b border-white/5 pb-1 group">
                          <span className="text-slate-500">N° de Cuenta:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-bold">
                              {bankAccounts[selectedBank].account}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                copyToClipboard(
                                  bankAccounts[selectedBank].account || "",
                                  "account",
                                )
                              }
                              className="text-slate-500 hover:text-indigo-400 transition-colors p-1"
                              title="Copiar Número de Cuenta"
                            >
                              {copiedField === "account" ? (
                                <Check size={14} className="text-emerald-500" />
                              ) : (
                                <Copy size={14} />
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                      {bankAccounts[selectedBank].phone && (
                        <div className="flex justify-between items-center border-b border-white/5 pb-1 group">
                          <span className="text-slate-500">Teléfono:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-bold">
                              {bankAccounts[selectedBank].phone}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                copyToClipboard(
                                  bankAccounts[selectedBank].phone || "",
                                  "phone",
                                )
                              }
                              className="text-slate-500 hover:text-indigo-400 transition-colors p-1"
                              title="Copiar Número de Teléfono"
                            >
                              {copiedField === "phone" ? (
                                <Check size={14} className="text-emerald-500" />
                              ) : (
                                <Copy size={14} />
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                      {bankAccounts[selectedBank].type && (
                        <p className="flex justify-between items-center border-b border-white/5 pb-1">
                          <span className="text-slate-500">Tipo:</span>
                          <span className="text-white font-bold">
                            {bankAccounts[selectedBank].type}
                          </span>
                        </p>
                      )}
                      <p className="flex justify-between pt-1">
                        <span className="text-slate-500">Detalles:</span>
                        <span className="text-white text-right">
                          Por favor adjunta captura legible
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                  <User size={14} className="text-indigo-400" />
                  2. Completa tus datos de compra
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="buyerName"
                    required
                    disabled={isPending}
                    placeholder="Nombre"
                    className="bg-slate-900 border border-white/10 text-white p-5 rounded-2xl outline-none focus:border-indigo-500 focus:bg-slate-900/80 transition-all text-sm font-bold disabled:opacity-50"
                  />
                  <input
                    type="text"
                    name="buyerLastName"
                    required
                    disabled={isPending}
                    placeholder="Apellido"
                    className="bg-slate-900 border border-white/10 text-white p-5 rounded-2xl outline-none focus:border-indigo-500 focus:bg-slate-900/80 transition-all text-sm font-bold disabled:opacity-50"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="buyerDocument"
                    required
                    disabled={isPending}
                    placeholder="Cédula / Documento"
                    className="bg-slate-900 border border-white/10 text-white p-5 rounded-2xl outline-none focus:border-indigo-500 focus:bg-slate-900/80 transition-all text-sm font-bold disabled:opacity-50"
                  />
                  <input
                    type="email"
                    name="buyerEmail"
                    required
                    disabled={isPending}
                    placeholder="Correo Electrónico"
                    className="bg-slate-900 border border-white/10 text-white p-5 rounded-2xl outline-none focus:border-indigo-500 focus:bg-slate-900/80 transition-all text-sm font-bold disabled:opacity-50"
                  />
                </div>

                <div className="relative pt-2">
                  <input
                    type="file"
                    name="receiptFile"
                    id="receiptFile"
                    required
                    accept="image/*"
                    disabled={isPending}
                    onChange={(e) =>
                      setReceiptName(e.target.files?.[0]?.name || "")
                    }
                    className="hidden"
                  />
                  <label
                    htmlFor="receiptFile"
                    className={`w-full flex flex-col items-center justify-center gap-3 p-8 rounded-3xl border-2 border-dashed transition-all cursor-pointer ${
                      receiptName
                        ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
                        : "border-white/10 hover:border-white/20 text-slate-500 hover:bg-white/5"
                    }`}
                  >
                    <UploadCloud
                      size={32}
                      className={isPending ? "animate-pulse" : ""}
                    />
                    <div className="text-center">
                      <p className="text-xs font-black uppercase tracking-widest">
                        {receiptName || "3. Cargar Comprobante de Pago"}
                      </p>
                      {!receiptName && (
                        <p className="text-[10px] font-bold opacity-50 mt-1 uppercase tracking-widest">
                          Formatos: JPG, PNG (Max 5MB)
                        </p>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  currentSelectionCount === 0 ||
                  isPending ||
                  !userId ||
                  !selectedBank
                }
                className="w-full relative group overflow-hidden bg-indigo-600 text-white p-7 rounded-[2.5rem] font-black uppercase text-sm tracking-[0.4em] shadow-2xl transition-all hover:bg-indigo-500 disabled:grayscale disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <div className="relative z-10 flex items-center justify-center gap-4">
                  {isPending ? (
                    <Loader2 className="animate-spin" size={24} />
                  ) : (
                    <>
                      <Landmark size={20} />
                      ENVIAR REPORTE ({currentSelectionCount})
                    </>
                  )}
                </div>
              </button>

              {!userId && (
                <p className="text-[9px] text-center font-black text-indigo-400 uppercase tracking-widest animate-pulse">
                  * Se requiere autenticación para procesar el reporte
                </p>
              )}
            </form>
          )}
        </>
      )}
    </div>
  );
}
