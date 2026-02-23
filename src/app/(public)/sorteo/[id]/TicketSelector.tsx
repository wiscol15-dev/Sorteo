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
  const [isPending, startTransition] = useTransition();

  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [manualSuccess, setManualSuccess] = useState(false);
  const [receiptName, setReceiptName] = useState<string>("");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const isExternal = type === "EXTERNAL";
  const availableCount = maxTickets - totalSold;
  const isSoldOut = availableCount <= 0;
  const totalPages = Math.ceil(maxTickets / ITEMS_PER_PAGE);

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

  const handleInternalBuy = async () => {
    if (!userId) return router.push("/auth/login");
    startTransition(async () => {
      const res = await buyTickets(raffleId, userId, selectedNumbers);
      if (res.success) {
        setSuccess(true);
        setSelectedNumbers([]);
        router.refresh();
      } else setError(res.error);
    });
  };

  const handleExternalSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) return router.push("/auth/login");
    if (!selectedBank)
      return setError("Selecciona un banco para la transferencia.");

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.append("raffleId", raffleId);
    formData.append("userId", userId);
    formData.append("quantity", quantity.toString());

    startTransition(async () => {
      const res = await buyRandomTicketsManual(formData);
      if (res.success) {
        setManualSuccess(true);
        setQuantity(1);
        setReceiptName("");
        setSelectedBank(null);
        router.refresh();
      } else setError(res.error);
    });
  };

  const handleQuantityChange = (newQuantity: number) => {
    setError(null);
    if (newQuantity < 1) setQuantity(1);
    else if (newQuantity > availableCount) setQuantity(availableCount);
    else setQuantity(newQuantity);
  };

  const copyToClipboard = (text: string, fieldType: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldType);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (success || manualSuccess)
    return (
      <div className="bg-slate-900 p-8 lg:p-12 rounded-[2rem] lg:rounded-[3.5rem] border border-slate-800 shadow-xl text-center space-y-6 lg:space-y-8">
        <div
          className={`w-20 h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center mx-auto border ${success ? "bg-emerald-900 text-emerald-400 border-emerald-800" : "bg-indigo-900 text-indigo-400 border-indigo-800"}`}
        >
          {success ? <CheckCircle2 size={40} /> : <Clock size={40} />}
        </div>
        <div className="space-y-2">
          <h3 className="text-3xl lg:text-4xl font-black text-white uppercase italic tracking-tighter">
            {success ? (
              <>
                ¡Transacción <span className="text-emerald-400">Exitosa!</span>
              </>
            ) : (
              <>
                ¡Reporte <span className="text-indigo-400">Enviado!</span>
              </>
            )}
          </h3>
          <p className="text-slate-400 text-xs lg:text-sm font-bold uppercase tracking-[0.2em]">
            {success
              ? "Boletos cifrados en la bóveda oficial."
              : "Boletos reservados. Esperando validación."}
          </p>
        </div>
        <button
          onClick={() =>
            success ? setSuccess(false) : setManualSuccess(false)
          }
          className="w-full bg-slate-800 border border-slate-700 text-white p-5 lg:p-6 rounded-2xl lg:rounded-3xl font-black uppercase text-[10px] lg:text-xs tracking-[0.2em]"
        >
          {success ? "Adquirir Más" : "Volver"}
        </button>
      </div>
    );

  return (
    <div className="bg-slate-900 p-6 lg:p-12 rounded-[2rem] lg:rounded-[3.5rem] border border-slate-800 shadow-xl space-y-8 lg:space-y-10">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-6">
        <div className="flex items-center gap-4 w-full overflow-hidden">
          <div className="bg-primary-dynamic/20 p-3 rounded-2xl border border-primary-dynamic/30 shrink-0">
            {isExternal ? (
              <Shuffle className="text-primary-dynamic" size={24} />
            ) : (
              <Ticket className="text-primary-dynamic" size={24} />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-xl lg:text-2xl font-black text-white uppercase italic tracking-tighter truncate">
              {isExternal ? (
                <span className="text-primary-dynamic">{raffleTitle}</span>
              ) : (
                <>
                  Selector de{" "}
                  <span className="text-primary-dynamic">Tickets</span>
                </>
              )}
            </h3>
          </div>
        </div>
        {!isExternal && (
          <div className="bg-slate-950 px-5 py-3 rounded-2xl border border-slate-800 flex items-center gap-3 shrink-0 w-full lg:w-auto justify-between lg:justify-start">
            <Wallet className="text-slate-500" size={18} />
            <div className="text-right">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
                Saldo
              </p>
              <p className="text-base lg:text-lg font-black text-white tracking-tighter">
                ${userBalance.toFixed(2)}
              </p>
            </div>
          </div>
        )}
      </div>

      {isSoldOut ? (
        <div className="bg-slate-950 border border-red-900 rounded-[2rem] p-8 text-center space-y-4">
          <ShieldAlert size={32} className="text-red-500 mx-auto" />
          <h4 className="text-2xl font-black text-white uppercase tracking-tighter italic">
            Agotado
          </h4>
        </div>
      ) : isExternal ? (
        <form
          onSubmit={handleExternalSubmit}
          className="bg-slate-950 p-6 lg:p-8 rounded-[2rem] border border-slate-800 space-y-8"
        >
          <div className="text-center space-y-2 border-b border-slate-800 pb-8 mb-8">
            <p className="text-[10px] lg:text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
              Disponibles
            </p>
            <p className="text-2xl lg:text-3xl font-black text-white italic tracking-tighter">
              {availableCount}{" "}
              <span className="text-primary-dynamic text-lg">
                / {maxTickets}
              </span>
            </p>

            <div className="flex items-center justify-center gap-4 lg:gap-6 bg-slate-900 p-3 lg:p-4 rounded-[1.5rem] lg:rounded-[2rem] border border-slate-800 max-w-[250px] lg:max-w-xs mx-auto mt-6">
              <button
                type="button"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1 || isPending}
                className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-slate-800 text-white flex items-center justify-center shrink-0 disabled:opacity-50"
              >
                <Minus size={20} />
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) =>
                  handleQuantityChange(parseInt(e.target.value) || 1)
                }
                disabled={isPending}
                className="w-16 lg:w-24 bg-transparent text-center text-4xl lg:text-5xl font-black text-white italic outline-none appearance-none"
                min="1"
                max={availableCount}
              />
              <button
                type="button"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= availableCount || isPending}
                className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-slate-800 text-white flex items-center justify-center shrink-0 disabled:opacity-50"
              >
                <Plus size={20} />
              </button>
            </div>

            <p className="text-[9px] lg:text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-8">
              Total a Transferir
            </p>
            <p className="text-5xl lg:text-7xl font-black italic tracking-tighter text-white">
              ${totalCost.toFixed(2)}
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-800 pb-2">
              <Building2 size={12} className="text-indigo-400" /> 1. Selecciona
              banco
            </p>
            <div className="flex gap-2 lg:gap-3 overflow-x-auto custom-scrollbar pb-3">
              {availableBanksList.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setSelectedBank(b)}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-wider border ${selectedBank === b ? "bg-indigo-600 border-indigo-500 text-white" : "bg-slate-900 border-slate-800 text-slate-400"}`}
                >
                  {b}
                </button>
              ))}
            </div>
            {selectedBank && bankAccounts[selectedBank] && (
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative">
                <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-3 block">
                  Datos de Depósito
                </span>
                <div className="space-y-2 text-[10px] lg:text-xs font-mono text-slate-300">
                  {bankAccounts[selectedBank].account && (
                    <div className="flex justify-between border-b border-slate-800 pb-1">
                      <span>Cuenta:</span>
                      <span className="text-white flex items-center gap-2">
                        {bankAccounts[selectedBank].account}{" "}
                        <Copy
                          size={12}
                          onClick={() =>
                            copyToClipboard(
                              bankAccounts[selectedBank!].account!,
                              "acc",
                            )
                          }
                          className="cursor-pointer text-slate-500"
                        />
                      </span>
                    </div>
                  )}
                  {bankAccounts[selectedBank].phone && (
                    <div className="flex justify-between border-b border-slate-800 pb-1">
                      <span>Tel:</span>
                      <span className="text-white flex items-center gap-2">
                        {bankAccounts[selectedBank].phone}{" "}
                        <Copy
                          size={12}
                          onClick={() =>
                            copyToClipboard(
                              bankAccounts[selectedBank!].phone!,
                              "phn",
                            )
                          }
                          className="cursor-pointer text-slate-500"
                        />
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-800">
            <p className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3">
              <User size={12} className="text-indigo-400" /> 2. Datos de compra
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
              <input
                type="text"
                name="buyerName"
                required
                disabled={isPending}
                placeholder="Nombre"
                className="bg-slate-900 border border-slate-800 text-white p-4 rounded-xl text-xs font-bold w-full outline-none focus:border-indigo-500"
              />
              <input
                type="text"
                name="buyerLastName"
                required
                disabled={isPending}
                placeholder="Apellido"
                className="bg-slate-900 border border-slate-800 text-white p-4 rounded-xl text-xs font-bold w-full outline-none focus:border-indigo-500"
              />
              <input
                type="text"
                name="buyerDocument"
                required
                disabled={isPending}
                placeholder="Documento"
                className="bg-slate-900 border border-slate-800 text-white p-4 rounded-xl text-xs font-bold w-full outline-none focus:border-indigo-500"
              />
              <input
                type="email"
                name="buyerEmail"
                required
                disabled={isPending}
                placeholder="Email"
                className="bg-slate-900 border border-slate-800 text-white p-4 rounded-xl text-xs font-bold w-full outline-none focus:border-indigo-500"
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
                className={`w-full flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 border-dashed cursor-pointer ${receiptName ? "border-indigo-500 bg-indigo-900 text-indigo-400" : "border-slate-800 text-slate-500"}`}
              >
                <UploadCloud size={24} />
                <p className="text-[10px] lg:text-xs font-black uppercase tracking-widest">
                  {receiptName || "Subir Comprobante"}
                </p>
              </label>
            </div>
          </div>

          {error && (
            <div className="bg-red-900 text-red-400 p-3 rounded-xl text-[9px] lg:text-[10px] font-black uppercase flex items-center justify-center gap-2">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={quantity === 0 || isPending || !userId || !selectedBank}
            className="w-full bg-indigo-600 text-white p-5 lg:p-6 rounded-2xl lg:rounded-[2rem] font-black uppercase text-[10px] lg:text-xs tracking-[0.3em] disabled:opacity-30"
          >
            {isPending ? (
              <Loader2 className="animate-spin mx-auto" size={20} />
            ) : (
              `ENVIAR REPORTE (${quantity})`
            )}
          </button>
        </form>
      ) : (
        <div className="space-y-6 lg:space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {selectedNumbers.length > 0 ? (
                <span className="text-primary-dynamic">
                  {selectedNumbers.length} Boletos
                </span>
              ) : (
                "Selecciona números"
              )}
            </p>
            <button
              onClick={handleSelectPageAvailable}
              disabled={currentViewNumbers.length === 0}
              className="w-full sm:w-auto bg-slate-800 px-4 py-2 rounded-xl flex items-center justify-center gap-2 text-[8px] lg:text-[9px] font-black text-white uppercase tracking-widest"
            >
              <Zap size={12} className="text-primary-dynamic" /> Toda la página
            </button>
          </div>
          <div className="bg-slate-950 p-4 lg:p-6 rounded-[2rem] border border-slate-800">
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 lg:gap-3">
              {currentViewNumbers.map((num) => {
                const isSold = soldNumbers.includes(num);
                const isSelected = selectedNumbers.includes(num);
                return (
                  <button
                    key={num}
                    disabled={isSold || isPending}
                    onClick={() => toggle(num)}
                    className={`aspect-square rounded-xl lg:rounded-2xl text-[10px] lg:text-xs font-black ${isSold ? "bg-slate-900 text-slate-800" : isSelected ? "bg-primary-dynamic text-white" : "bg-slate-800 text-slate-400 border border-slate-700"}`}
                  >
                    {num.toString().padStart(2, "0")}
                    {isSold && (
                      <XCircle
                        size={8}
                        className="absolute top-1 right-1 opacity-20"
                      />
                    )}
                  </button>
                );
              })}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 bg-slate-900 p-2 rounded-xl">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-3 bg-slate-800 rounded-lg disabled:opacity-30 text-white"
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
                  disabled={currentPage === totalPages}
                  className="p-3 bg-slate-800 rounded-lg disabled:opacity-30 text-white"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
          <div className="text-center">
            <p className="text-[9px] lg:text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
              Total a Debitar
            </p>
            <p
              className={`text-5xl lg:text-7xl font-black italic tracking-tighter ${!hasBalance && selectedNumbers.length > 0 ? "text-red-500" : "text-white"}`}
            >
              ${totalCost.toFixed(2)}
            </p>
          </div>
          {error && (
            <div className="bg-red-900 text-red-400 p-3 rounded-xl text-[9px] font-black uppercase text-center">
              {error}
            </div>
          )}
          <button
            onClick={handleInternalBuy}
            disabled={
              selectedNumbers.length === 0 ||
              isPending ||
              (!hasBalance && !!userId)
            }
            className="w-full bg-primary-dynamic text-white p-5 lg:p-6 rounded-2xl lg:rounded-[2rem] font-black uppercase text-[10px] lg:text-xs tracking-[0.3em] disabled:opacity-30"
          >
            {isPending ? (
              <Loader2 className="animate-spin mx-auto" size={20} />
            ) : (
              `CONFIRMAR COMPRA (${selectedNumbers.length})`
            )}
          </button>
        </div>
      )}
    </div>
  );
}
