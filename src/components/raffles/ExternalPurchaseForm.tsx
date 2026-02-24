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
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { buyRandomTicketsManual } from "@/app/admin/sorteos/actions";
import Image from "next/image";

export interface BankAccount {
  titular?: string;
  doc?: string;
  account?: string;
  phone?: string;
  type?: string;
  bankName?: string;
}

interface Props {
  raffleId: string;
  raffleTitle: string;
  imageUrl?: string | null;
  maxTickets: number;
  pricePerTicket: number;
  totalSold: number;
  userId: string | null;
  bankAccounts: Record<string, BankAccount>;
  onClose: () => void;
}

export default function ExternalPurchaseForm({
  raffleId,
  raffleTitle,
  imageUrl,
  maxTickets,
  pricePerTicket,
  totalSold,
  userId,
  bankAccounts,
  onClose,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [quantity, setQuantity] = useState<number>(1);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualSuccess, setManualSuccess] = useState(false);
  const [receiptName, setReceiptName] = useState<string>("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const availableCount = maxTickets - totalSold;
  const effectiveAvailable = Math.max(0, availableCount);

  const totalCost = quantity * pricePerTicket;
  const availableBanksList = Object.keys(bankAccounts || {});

  const handleExternalSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) return router.push("/auth/login");
    if (!selectedBank)
      return setError("Selecciona la entidad bancaria utilizada.");
    if (quantity > effectiveAvailable)
      return setError("La cantidad excede el inventario disponible.");

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Inyectamos los datos calculados asegurando que no falte nada
    formData.append("raffleId", raffleId);
    formData.append("userId", userId);
    formData.append("quantity", quantity.toString());

    startTransition(async () => {
      const res = await buyRandomTicketsManual(formData);
      if (res.success) {
        setManualSuccess(true);
        router.refresh();
        // Cierre automático extendido para que el usuario lea el comunicado
        setTimeout(() => {
          onClose();
        }, 6000);
      } else {
        setError(res.error);
      }
    });
  };

  const handleQuantityChange = (newQuantity: number) => {
    setError(null);
    if (newQuantity < 1) setQuantity(1);
    else if (newQuantity > effectiveAvailable) setQuantity(effectiveAvailable);
    else setQuantity(newQuantity);
  };

  const copyToClipboard = (text: string, fieldType: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldType);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // ============================================================================
  // UI DE ÉXITO CORPORATIVO Y ELEGANTE
  // ============================================================================
  if (manualSuccess)
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 space-y-6 text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="relative">
          <div className="w-24 h-24 rounded-full flex items-center justify-center bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
            <ShieldCheck size={44} />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-slate-900 rounded-full p-1.5">
            <Clock size={20} className="text-indigo-400 animate-pulse" />
          </div>
        </div>

        <div className="space-y-3 max-w-md mx-auto">
          <h3 className="text-2xl font-black text-white uppercase tracking-widest leading-tight">
            Reserva <span className="text-emerald-400">Registrada</span>
          </h3>
          <div className="h-px w-16 bg-emerald-500/30 mx-auto rounded-full"></div>
          <p className="text-slate-300 text-xs font-medium leading-relaxed tracking-wide pt-2">
            Su solicitud de adquisición ha sido procesada con éxito y se
            encuentra bajo{" "}
            <span className="text-indigo-400 font-bold">
              Revisión de Auditoría
            </span>
            .
          </p>
          <p className="text-slate-400 text-[10px] font-medium leading-relaxed">
            Hemos reservado sus tickets de nuestro inventario. Una vez nuestro
            equipo financiero valide el comprobante adjunto, los boletos le
            serán adjudicados oficialmente a su nombre.
          </p>
        </div>

        <div className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-4 mt-4">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-center gap-2">
            <Loader2 size={12} className="animate-spin" /> Finalizando entorno
            seguro...
          </p>
        </div>
      </div>
    );

  if (effectiveAvailable === 0)
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-6 text-center">
        <AlertCircle size={48} className="text-red-500/80" />
        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">
          Boletería Agotada
        </h3>
        <p className="text-slate-400 text-sm font-medium">
          El inventario para este evento ha sido asignado en su totalidad.
        </p>
      </div>
    );

  // ============================================================================
  // FORMULARIO DE COMPRA EXTERNA OPTIMIZADO
  // ============================================================================
  return (
    <form
      onSubmit={handleExternalSubmit}
      className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
        {imageUrl && (
          <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-700 shadow-md">
            <Image
              src={imageUrl}
              alt={raffleTitle}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div>
          <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em]">
            Formulario de Adquisición
          </p>
          <h2 className="text-xl font-black text-white uppercase italic tracking-tighter line-clamp-2 mt-1">
            {raffleTitle}
          </h2>
        </div>
      </div>

      <div className="text-center space-y-4 border-b border-slate-800 pb-8">
        <div className="flex justify-between items-center px-2 sm:px-4">
          <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">
            Inventario Disponible
          </p>
          <p className="text-lg font-black text-white italic">
            {effectiveAvailable}{" "}
            <span className="text-slate-600 text-sm">/ {maxTickets}</span>
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 bg-slate-900/50 p-3 rounded-2xl border border-slate-800 mx-auto max-w-[280px]">
          <button
            type="button"
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1 || isPending}
            className="w-12 h-12 rounded-xl bg-slate-800 text-white flex items-center justify-center disabled:opacity-30 transition-colors hover:bg-slate-700"
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
            className="w-20 bg-transparent text-center text-4xl font-black text-white italic outline-none appearance-none"
            min="1"
            max={effectiveAvailable}
          />
          <button
            type="button"
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={quantity >= effectiveAvailable || isPending}
            className="w-12 h-12 rounded-xl bg-slate-800 text-white flex items-center justify-center disabled:opacity-30 transition-colors hover:bg-slate-700"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="flex justify-between items-end px-2 sm:px-4 pt-2">
          <p className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-widest mb-1.5">
            Monto Total a Transferir
          </p>
          <p className="text-4xl font-black italic tracking-tighter text-white">
            ${totalCost.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Building2 size={14} className="text-indigo-400" /> 1. Entidad
          Bancaria
        </p>
        <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
          {availableBanksList.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setSelectedBank(b)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider border transition-all ${selectedBank === b ? "bg-indigo-600 border-indigo-500 text-white shadow-lg" : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"}`}
            >
              {b}
            </button>
          ))}
        </div>

        {selectedBank && bankAccounts[selectedBank] && (
          <div className="bg-slate-900/80 border border-indigo-500/30 p-5 rounded-2xl text-[10px] sm:text-xs font-mono text-slate-300 space-y-3 animate-in fade-in slide-in-from-top-2">
            {bankAccounts[selectedBank].account && (
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span>N° de Cuenta:</span>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(bankAccounts[selectedBank!].account!, "acc")
                  }
                  className="text-white font-bold flex items-center gap-2 hover:text-indigo-400 transition-colors"
                >
                  {bankAccounts[selectedBank].account}{" "}
                  {copiedField === "acc" ? (
                    <CheckCircle2 size={14} className="text-emerald-500" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
            )}
            {bankAccounts[selectedBank].titular && (
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span>Titular:</span>
                <span className="text-white font-bold line-clamp-1 text-right">
                  {bankAccounts[selectedBank].titular}
                </span>
              </div>
            )}
            {bankAccounts[selectedBank].doc && (
              <div className="flex justify-between items-center">
                <span>Documento / RIF:</span>
                <span className="text-white font-bold">
                  {bankAccounts[selectedBank].doc}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-800">
        <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3">
          <User size={14} className="text-indigo-400" /> 2. Verificación de
          Identidad
        </p>

        {/* FIX: Se removió disabled={isPending} de los inputs para evitar que el navegador envíe el form vacío */}
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            name="buyerName"
            required
            placeholder="Nombre legal"
            className="bg-slate-900 border border-slate-800 text-white p-3 sm:p-4 rounded-xl text-xs font-bold outline-none focus:border-indigo-500 focus:bg-slate-900/50 transition-colors"
          />
          <input
            type="text"
            name="buyerLastName"
            required
            placeholder="Apellido legal"
            className="bg-slate-900 border border-slate-800 text-white p-3 sm:p-4 rounded-xl text-xs font-bold outline-none focus:border-indigo-500 focus:bg-slate-900/50 transition-colors"
          />
        </div>
        <input
          type="text"
          name="buyerDocument"
          required
          placeholder="Cédula / Pasaporte"
          className="bg-slate-900 border border-slate-800 text-white p-3 sm:p-4 rounded-xl text-xs font-bold w-full outline-none focus:border-indigo-500 focus:bg-slate-900/50 transition-colors"
        />
        <input
          type="email"
          name="buyerEmail"
          required
          placeholder="Correo Electrónico de contacto"
          className="bg-slate-900 border border-slate-800 text-white p-3 sm:p-4 rounded-xl text-xs font-bold w-full outline-none focus:border-indigo-500 focus:bg-slate-900/50 transition-colors"
        />

        <div className="relative mt-4">
          <input
            type="file"
            name="receiptFile"
            id="receiptFileModal"
            required
            accept="image/*"
            onChange={(e) => setReceiptName(e.target.files?.[0]?.name || "")}
            className="hidden"
          />
          <label
            htmlFor="receiptFileModal"
            className={`w-full flex items-center justify-center gap-3 p-5 rounded-xl border-2 border-dashed cursor-pointer transition-all ${receiptName ? "border-indigo-500 bg-indigo-900/20 text-indigo-300" : "border-slate-800 hover:border-slate-700 text-slate-500 bg-slate-900/50 hover:bg-slate-900"}`}
          >
            <UploadCloud
              size={20}
              className={isPending ? "animate-pulse" : ""}
            />
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest truncate">
              {receiptName || "Adjuntar Captura de Pago (JPG/PNG)"}
            </span>
          </label>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-900/50 text-red-400 p-4 rounded-xl text-[10px] sm:text-xs font-black uppercase flex items-start gap-3">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Solo se deshabilita el botón de Submit para proteger la información del Formulario */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={quantity === 0 || isPending || !userId || !selectedBank}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white p-5 sm:p-6 rounded-2xl font-black uppercase text-xs sm:text-sm tracking-[0.3em] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-indigo-900/20 group"
        >
          <span className="relative z-10 flex items-center justify-center gap-3">
            {isPending ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <Landmark
                  size={18}
                  className="group-hover:scale-110 transition-transform"
                />{" "}
                ENVIAR REPORTE OFICIAL
              </>
            )}
          </span>
        </button>
        {!userId && (
          <p className="text-[9px] text-center text-slate-500 uppercase tracking-widest mt-4">
            Autorización requerida: Por favor inicie sesión
          </p>
        )}
      </div>
    </form>
  );
}
