import React from "react";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { deleteRaffle } from "./actions";
import SorteoActionCell from "./SorteoActionCell";
import {
  Edit,
  Trash2,
  Plus,
  Ticket,
  Trophy,
  CreditCard,
  Phone,
  Mail,
  Hash,
  AlertCircle,
  UserX,
} from "lucide-react";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function SorteosAdminPage() {
  const raffles = await prisma.raffle.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      tickets: {
        include: { user: true },
      },
    },
  });

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">
            Gestión de <span className="text-primary">Sorteos</span>
          </h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2 italic">
            Auditoría de resultados y control de inventario
          </p>
        </div>
        <Link
          href="/admin/sorteos/nuevo"
          className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all flex items-center gap-3 shadow-xl shadow-primary/20 hover:-translate-y-1"
        >
          <Plus size={18} />
          Nuevo Sorteo
        </Link>
      </header>

      <div className="bg-white rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Sorteo
                </th>
                <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Ventas
                </th>
                <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Cierre
                </th>
                <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
                  Estado
                </th>
                <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {raffles.map((raffle) => {
                const soldPercentage = Math.min(
                  100,
                  (raffle.tickets.length / raffle.maxTickets) * 100,
                );
                const isCompleted = raffle.status === "FINISHED";
                const winningNumbersArray =
                  (raffle as any).winningNumbers || [];

                return (
                  <React.Fragment key={raffle.id}>
                    <tr className="hover:bg-slate-50/50 transition-colors group relative">
                      <td className="py-6 px-8">
                        <div className="flex items-center gap-4">
                          <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 border-2 border-white shadow-sm">
                            {raffle.imageUrl ? (
                              <Image
                                src={raffle.imageUrl}
                                alt={raffle.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                                <Ticket className="text-primary/50" size={24} />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 uppercase tracking-tighter line-clamp-1">
                              {raffle.title}
                            </p>
                            <div className="flex gap-2 mt-1">
                              <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">
                                ID: {raffle.id.slice(-6)}
                              </span>
                              <span className="text-[9px] font-black text-primary tracking-widest uppercase bg-primary/10 px-2 rounded-full">
                                {raffle.winnersCount} Ganador(es)
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-6 px-8">
                        <div className="space-y-2 w-32">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                            <span>{soldPercentage.toFixed(1)}%</span>
                            <span>
                              {raffle.tickets.length}/{raffle.maxTickets}
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-primary h-full rounded-full transition-all"
                              style={{ width: `${soldPercentage}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-6 px-8">
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                          {new Date(raffle.drawDate).toLocaleDateString(
                            "es-ES",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </p>
                      </td>

                      <td className="py-6 px-8 text-center">
                        <SorteoActionCell
                          raffleId={raffle.id}
                          drawDateStr={raffle.drawDate.toISOString()}
                          initialStatus={raffle.status}
                        />
                      </td>

                      <td className="py-6 px-8 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          {!isCompleted && (
                            <Link
                              href={`/admin/sorteos/${raffle.id}/editar`}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-3 rounded-xl transition-colors shadow-sm"
                            >
                              <Edit size={16} />
                            </Link>
                          )}
                          <form
                            action={async () => {
                              "use server";
                              await deleteRaffle(raffle.id);
                            }}
                          >
                            <button
                              type="submit"
                              className="bg-red-50 hover:bg-red-500 text-red-500 hover:text-white p-3 rounded-xl transition-colors shadow-sm"
                            >
                              <Trash2 size={16} />
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>

                    {isCompleted && (
                      <tr>
                        <td
                          colSpan={5}
                          className="p-0 border-b border-slate-100 bg-slate-50/40"
                        >
                          <div className="px-8 py-6">
                            <div className="bg-white p-8 rounded-3xl shadow-sm border-l-[6px] border-slate-900">
                              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 mb-6 flex items-center gap-3">
                                <div className="bg-slate-900 p-2 rounded-xl text-white">
                                  <Trophy size={16} />
                                </div>
                                Auditoría de Resultados: Tómbola Digital
                              </h4>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {winningNumbersArray.map(
                                  (winNum: number, index: number) => {
                                    const winningTicket = raffle.tickets.find(
                                      (t) => t.number === winNum && t.isWinner,
                                    );

                                    return (
                                      <div
                                        key={index}
                                        className={`flex items-start gap-4 p-5 rounded-2xl border transition-all ${winningTicket ? "bg-emerald-50 border-emerald-100 hover:shadow-md" : "bg-amber-50/50 border-amber-200 border-dashed"}`}
                                      >
                                        <div
                                          className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black flex-shrink-0 shadow-md ${winningTicket ? "bg-slate-900 text-white" : "bg-amber-500 text-white animate-pulse"}`}
                                        >
                                          <span className="text-[8px] uppercase tracking-widest opacity-70">
                                            Número
                                          </span>
                                          <span className="text-sm">
                                            #{winNum}
                                          </span>
                                        </div>

                                        <div className="space-y-2 w-full overflow-hidden">
                                          {winningTicket ? (
                                            <>
                                              <p className="text-sm font-black text-slate-900 uppercase tracking-tighter line-clamp-1">
                                                {winningTicket.user.firstName}{" "}
                                                {winningTicket.user.lastName}
                                              </p>
                                              <div className="flex flex-col gap-1">
                                                <span className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-2">
                                                  <CreditCard
                                                    size={12}
                                                    className="text-primary"
                                                  />{" "}
                                                  {winningTicket.user.idNumber}
                                                </span>
                                                <span className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-2">
                                                  <Phone
                                                    size={12}
                                                    className="text-emerald-500"
                                                  />{" "}
                                                  {winningTicket.user.phone}
                                                </span>
                                                <span className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-2 line-clamp-1">
                                                  <Mail
                                                    size={12}
                                                    className="text-indigo-500"
                                                  />{" "}
                                                  {winningTicket.user.email}
                                                </span>
                                              </div>
                                            </>
                                          ) : (
                                            <div className="h-full flex flex-col justify-center">
                                              <p className="text-xs font-black text-amber-900 uppercase italic tracking-tighter flex items-center gap-2">
                                                <UserX size={14} /> Puesto
                                                Desierto
                                              </p>
                                              <p className="text-[9px] font-bold text-amber-600 uppercase tracking-[0.1em] mt-1">
                                                Número no adquirido
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  },
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>

          {raffles.length === 0 && (
            <div className="p-24 text-center">
              <div className="inline-flex bg-slate-50 p-8 rounded-full mb-6">
                <Ticket className="text-slate-300" size={60} />
              </div>
              <p className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">
                Cero registros en la base de datos
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
