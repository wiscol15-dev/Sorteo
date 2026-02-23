"use client";

import { useTransition } from "react";
import {
  X,
  CheckCircle,
  XCircle,
  Loader2,
  Landmark,
  User,
  Mail,
  CreditCard,
  Ticket,
} from "lucide-react";
import Image from "next/image";
import { approveManualPurchase, rejectManualPurchase } from "./actions";

interface ApproveModalProps {
  user: any;
  transaction: any;
  onClose: () => void;
}

export default function ApprovePurchaseModal({
  user,
  transaction,
  onClose,
}: ApproveModalProps) {
  const [isPending, startTransition] = useTransition();

  const handleApprove = () => {
    if (
      confirm(
        "¿Confirmas que el pago es válido? Los tickets se activarán inmediatamente.",
      )
    ) {
      startTransition(async () => {
        await approveManualPurchase(transaction.id);
        onClose();
      });
    }
  };

  const handleReject = () => {
    if (confirm("¿Rechazar esta compra? Los tickets quedarán anulados.")) {
      startTransition(async () => {
        await rejectManualPurchase(transaction.id);
        onClose();
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-5xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row max-h-[95vh] relative animate-in zoom-in-95">
        {/* COMPROBANTE - FLEXIBLE HEIGHT ON MOBILE, FIXED ON DESKTOP */}
        <div className="w-full lg:w-1/2 bg-slate-100 relative h-[40vh] lg:h-auto flex items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-200">
          {transaction.receiptUrl ? (
            <Image
              src={transaction.receiptUrl}
              alt="Comprobante de Pago"
              fill
              className="object-contain p-6"
            />
          ) : (
            <div className="text-slate-400 flex flex-col items-center gap-3">
              <XCircle size={40} />
              <p className="text-[10px] font-black uppercase tracking-widest">
                Sin Comprobante
              </p>
            </div>
          )}
          <div className="absolute top-4 left-4 bg-slate-900 text-white px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl">
            <Landmark size={12} /> Adjunto
          </div>
        </div>

        {/* INFO Y ACCIONES - SCROLLABLE */}
        <div className="w-full lg:w-1/2 p-6 lg:p-10 flex flex-col bg-white overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-start mb-8">
            <div className="space-y-1">
              <h3 className="text-2xl lg:text-3xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
                Validación de Compra
              </h3>
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                Asignación Aleatoria
              </p>
            </div>
            <button
              onClick={() => !isPending && onClose()}
              disabled={isPending}
              className="text-slate-400 hover:text-slate-900 transition-colors disabled:opacity-50 bg-slate-50 p-2 rounded-full flex-shrink-0"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4 flex-grow mb-8">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
              <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-100 text-primary-dynamic flex-shrink-0">
                <User size={18} />
              </div>
              <div className="overflow-hidden">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                  Nombre en el Reporte
                </p>
                <p className="text-sm font-black text-slate-900 uppercase tracking-tighter truncate">
                  {transaction.buyerName ||
                    `${user.firstName} ${user.lastName}`}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
              <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-100 text-indigo-500 flex-shrink-0">
                <CreditCard size={18} />
              </div>
              <div className="overflow-hidden">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                  Identificación
                </p>
                <p className="text-sm font-black text-slate-900 uppercase tracking-tighter truncate">
                  {transaction.buyerDocument || user.idNumber}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
              <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-100 text-emerald-500 flex-shrink-0">
                <Mail size={18} />
              </div>
              <div className="overflow-hidden">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                  Correo de Contacto
                </p>
                <p className="text-sm font-black text-slate-900 tracking-tighter truncate">
                  {transaction.buyerEmail || user.email}
                </p>
              </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-[2rem] text-center shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Monto Depositado
                </p>
                <p className="text-4xl md:text-5xl font-black text-white italic tracking-tighter leading-none">
                  ${Number(transaction.amount).toFixed(2)}
                </p>
                <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-4 py-1.5 rounded-full text-[10px] font-black uppercase mt-4">
                  <Ticket size={14} /> {transaction.tickets?.length || 0}{" "}
                  Tickets
                </div>
              </div>
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05]" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleReject}
              disabled={isPending}
              className="w-full sm:w-auto flex-1 bg-white border-2 border-red-100 text-red-500 p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-50 hover:border-red-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <XCircle size={16} /> Rechazar
            </button>
            <button
              onClick={handleApprove}
              disabled={isPending}
              className="w-full sm:w-auto flex-[2] bg-emerald-500 text-white p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-600 shadow-xl shadow-emerald-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <CheckCircle size={16} />
              )}
              Aprobar Compra
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
