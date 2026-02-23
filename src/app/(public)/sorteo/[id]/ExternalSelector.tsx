"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  AlertCircle,
  Minus,
  Plus,
  Landmark,
  UploadCloud,
  Clock,
  Building2,
  User,
  Copy,
  Check,
} from "lucide-react";
import { buyRandomTicketsManual } from "@/app/admin/sorteos/actions";
import { SelectorProps } from "./TicketSelector";

export default function ExternalSelector({
  raffleId,
  maxTickets,
  pricePerTicket,
  totalSold,
  userId,
  bankAccounts,
}: SelectorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [quantity, setQuantity] = useState<number>(1);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualSuccess, setManualSuccess] = useState(false);
  const [receiptName, setReceiptName] = useState<string>("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const availableCount = maxTickets - totalSold;
  const totalCost = quantity * pricePerTicket;
  const availableBanksList = Object.keys(bankAccounts || {});

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

  const handleExternalSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
    formData.append("quantity", quantity.toString());

    startTransition(async () => {
      const res = await buyRandomTicketsManual(formData);
      if (res.success) {
        setManualSuccess(true);
        setQuantity(1);
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
    <form
      onSubmit={handleExternalSubmit}
      className="bg-black/20 p-8 rounded-[2.5rem] border border-white/5 shadow-inner space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      <div className="text-center space-y-2 border-b border-white/5 pb-8 mb-8">
        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
          Boletos Disponibles
        </p>
        <p className="text-3xl font-black text-white italic tracking-tighter">
          {availableCount}{" "}
          <span className="text-primary-dynamic text-xl">/ {maxTickets}</span>
        </p>

        <div className="flex items-center justify-center gap-6 bg-slate-900/50 p-4 rounded-[2rem] border border-white/10 shadow-2xl max-w-xs mx-auto mt-6">
          <button
            type="button"
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1 || isPending}
            className="w-14 h-14 rounded-2xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
          >
            <Minus size={24} />
          </button>

          <input
            type="number"
            value={quantity}
            onChange={(e) =>
              handleQuantityChange(parseInt(e.target.value) || 1)
            }
            disabled={isPending}
            className="w-24 bg-transparent text-center text-5xl font-black text-white italic tracking-tighter outline-none appearance-none"
            min="1"
            max={availableCount}
          />

          <button
            type="button"
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={quantity >= availableCount || isPending}
            className="w-14 h-14 rounded-2xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
          >
            <Plus size={24} />
          </button>
        </div>

        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-8">
          Monto Total a Transferir
        </p>
        <p className="text-6xl md:text-7xl font-black italic tracking-tighter text-white">
          ${totalCost.toFixed(2)}
        </p>
      </div>

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
            onChange={(e) => setReceiptName(e.target.files?.[0]?.name || "")}
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

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 animate-in fade-in">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={quantity === 0 || isPending || !userId || !selectedBank}
        className="w-full relative group overflow-hidden bg-indigo-600 text-white p-7 rounded-[2.5rem] font-black uppercase text-sm tracking-[0.4em] shadow-2xl transition-all hover:bg-indigo-500 disabled:grayscale disabled:opacity-20 disabled:cursor-not-allowed"
      >
        <div className="relative z-10 flex items-center justify-center gap-4">
          {isPending ? (
            <Loader2 className="animate-spin" size={24} />
          ) : (
            <>
              <Landmark size={20} />
              ENVIAR REPORTE ({quantity})
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
  );
}
