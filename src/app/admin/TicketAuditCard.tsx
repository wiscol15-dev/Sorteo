"use client";

import { useState } from "react";
import {
  Ticket,
  ArrowUpRight,
  X,
  CheckCircle,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  ChevronDown,
  PackageOpen,
} from "lucide-react";

interface AuditedTransaction {
  id: string;
  buyerName: string;
  amount: number;
  status: string;
  date: string;
  ticketCount: number;
  adminName: string;
  raffleId: string;
  raffleTitle: string;
}

interface Props {
  totalTickets: number;
  auditedData: AuditedTransaction[];
}

export default function TicketAuditCard({ totalTickets, auditedData }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const groupedData = auditedData.reduce(
    (acc, curr) => {
      if (!acc[curr.raffleId]) {
        acc[curr.raffleId] = {
          title: curr.raffleTitle,
          approved: [],
          rejected: [],
        };
      }
      if (curr.status === "COMPLETED") acc[curr.raffleId].approved.push(curr);
      if (curr.status === "REJECTED") acc[curr.raffleId].rejected.push(curr);
      return acc;
    },
    {} as Record<
      string,
      {
        title: string;
        approved: AuditedTransaction[];
        rejected: AuditedTransaction[];
      }
    >,
  );

  const raffles = Object.values(groupedData);

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className="cursor-pointer relative overflow-hidden bg-[#0f172a] rounded-[2rem] p-8 shadow-xl group transition-all hover:-translate-y-1 ring-1 ring-transparent hover:ring-primary-dynamic/50"
      >
        <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
          <Ticket size={120} className="text-white" />
        </div>
        <div className="relative z-10 flex flex-col h-full justify-between">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Ticket size={14} className="text-primary-dynamic" /> Boletos
            Desplegados
          </p>
          <div className="mt-6">
            <h3 className="text-5xl font-mono font-black text-white tracking-tighter">
              {totalTickets}
            </h3>
            <div className="mt-4 flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                <ArrowUpRight size={12} /> Emitidos
              </div>
              <span className="text-[9px] text-primary-dynamic font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                Auditar Clic Aquí
              </span>
            </div>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative animate-in zoom-in-95">
            <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <div>
                <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">
                  Auditoría de Validación Manual
                </h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
                  Registro detallado por sorteo
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="bg-white p-3 rounded-full text-slate-400 hover:text-slate-900 hover:shadow-md transition-all border border-slate-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 bg-slate-50/50">
              {raffles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <PackageOpen size={64} className="opacity-20 mb-4" />
                  <p className="font-black uppercase tracking-widest text-sm text-center">
                    No hay registros manuales auditados aún.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {raffles.map((raffle, index) => (
                    <details
                      key={index}
                      className="group bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
                    >
                      <summary className="p-6 cursor-pointer flex items-center justify-between hover:bg-slate-50 transition-colors list-none">
                        <div className="flex items-center gap-4">
                          <div className="bg-primary-dynamic/10 p-3 rounded-xl text-primary-dynamic">
                            <Ticket size={24} />
                          </div>
                          <div>
                            <h4 className="text-lg font-black text-slate-900 uppercase italic tracking-tighter">
                              {raffle.title}
                            </h4>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                              {raffle.approved.length} Aprobados •{" "}
                              {raffle.rejected.length} Rechazados
                            </p>
                          </div>
                        </div>
                        <div className="text-slate-300 group-open:rotate-180 transition-transform duration-300">
                          <ChevronDown size={24} />
                        </div>
                      </summary>

                      <div className="p-6 border-t border-slate-100 bg-slate-50/50 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* COLUMNA APROBADOS */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-4">
                            <CheckCircle
                              size={16}
                              className="text-emerald-500"
                            />
                            <h5 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                              Validaciones Aprobadas
                            </h5>
                          </div>

                          {raffle.approved.length === 0 ? (
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center py-6 border border-dashed border-slate-200 rounded-2xl">
                              Sin aprobaciones
                            </p>
                          ) : (
                            raffle.approved.map((tx) => (
                              <div
                                key={tx.id}
                                className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <span className="font-black text-slate-800 uppercase text-xs truncate pr-4">
                                    {tx.buyerName}
                                  </span>
                                  <span className="font-mono text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-1 rounded-md">
                                    ${tx.amount.toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-[9px] uppercase tracking-widest font-bold text-slate-500 mb-3">
                                  <span>{tx.ticketCount} Boletos</span>
                                  <span>
                                    {new Date(tx.date).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="bg-slate-50 px-3 py-2 rounded-lg flex items-center gap-2 border border-slate-100">
                                  <ShieldCheck
                                    size={12}
                                    className="text-emerald-500 shrink-0"
                                  />
                                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest truncate">
                                    Oficial: {tx.adminName}
                                  </span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* COLUMNA RECHAZADOS */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-4">
                            <XCircle size={16} className="text-red-500" />
                            <h5 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                              Validaciones Rechazadas
                            </h5>
                          </div>

                          {raffle.rejected.length === 0 ? (
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center py-6 border border-dashed border-slate-200 rounded-2xl">
                              Sin rechazos
                            </p>
                          ) : (
                            raffle.rejected.map((tx) => (
                              <div
                                key={tx.id}
                                className="bg-white p-4 rounded-2xl border border-red-50 shadow-sm"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <span className="font-black text-slate-800 uppercase text-xs truncate pr-4">
                                    {tx.buyerName}
                                  </span>
                                  <span className="font-mono text-red-600 font-bold text-xs bg-red-50 px-2 py-1 rounded-md">
                                    ${tx.amount.toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-[9px] uppercase tracking-widest font-bold text-slate-500 mb-3">
                                  <span className="line-through">
                                    {tx.ticketCount} Boletos anulados
                                  </span>
                                  <span>
                                    {new Date(tx.date).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="bg-red-50/50 px-3 py-2 rounded-lg flex items-center gap-2 border border-red-100">
                                  <ShieldAlert
                                    size={12}
                                    className="text-red-500 shrink-0"
                                  />
                                  <span className="text-[8px] font-black text-red-700 uppercase tracking-widest truncate">
                                    Oficial: {tx.adminName}
                                  </span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </details>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
