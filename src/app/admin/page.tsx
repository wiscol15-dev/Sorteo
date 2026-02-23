import React from "react";
import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  ShieldCheck,
  Users,
  DollarSign,
  Activity,
  Server,
  Lock,
  Cpu,
  Globe,
  CheckCircle2,
  ChevronRight,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import TicketAuditCard from "./TicketAuditCard";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    totalTickets,
    activeRafflesCount,
    revenueResult,
    recentTickets,
    rawManualTransactions,
    auditLogs,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.ticket.count(),
    prisma.raffle.count({ where: { status: "ACTIVE" } }),
    prisma.ticket.aggregate({
      _sum: { price: true } as any,
    }),
    prisma.ticket.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
          lte: new Date(today.setHours(23, 59, 59, 999)),
        },
      },
      select: {
        createdAt: true,
        price: true,
      },
    }),
    // OBTENEMOS LAS TRANSACCIONES Y ASEGURAMOS QUE EL SORTEO AÚN EXISTA
    prisma.transaction.findMany({
      where: {
        receiptUrl: { not: null },
        status: { in: ["COMPLETED", "REJECTED"] },
        tickets: { some: {} }, // Filtra transacciones sin tickets (sorteos eliminados)
      },
      include: {
        user: { select: { firstName: true, lastName: true } },
        tickets: {
          take: 1, // Solo necesitamos 1 ticket para saber de qué sorteo es
          select: {
            raffle: { select: { id: true, title: true, status: true } },
          },
        },
        _count: { select: { tickets: true } }, // Cuenta real de boletos
      },
      orderBy: { createdAt: "desc" },
      take: 150,
    }),
    // TRAEMOS MÁS LOGS PARA ASEGURAR ENCONTRAR AL ADMIN
    prisma.auditLog.findMany({
      include: { user: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: "desc" },
      take: 1000,
    }),
  ]);

  const rawRevenue = (revenueResult?._sum as any)?.price;
  const totalRevenue = rawRevenue ? Number(rawRevenue) : 0;

  const daysMap = ["DOM", "LUN", "MAR", "MIE", "JUE", "VIE", "SAB"];

  const last7DaysData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (6 - i));
    return {
      dateStr: d.toISOString().split("T")[0],
      dayLabel: daysMap[d.getDay()],
      revenue: 0,
    };
  });

  recentTickets.forEach((ticket) => {
    const tDate = ticket.createdAt.toISOString().split("T")[0];
    const dayRecord = last7DaysData.find((d) => d.dateStr === tDate);
    if (dayRecord) {
      dayRecord.revenue += Number(ticket.price || 0);
    }
  });

  const maxRevenue7Days = Math.max(...last7DaysData.map((d) => d.revenue));

  // FILTRAMOS Y MAPEAMOS LA DATA AUDITADA
  const auditedData = rawManualTransactions
    .filter((tx) => tx.tickets.length > 0 && tx.tickets[0].raffle) // Protección extra contra sorteos borrados
    .map((tx) => {
      let adminName = "Sistema Auto-Verificado";

      // Búsqueda del admin responsable en los logs
      for (const log of auditLogs) {
        if (log.metadata) {
          const metaString =
            typeof log.metadata === "string"
              ? log.metadata
              : JSON.stringify(log.metadata);
          if (metaString.includes(tx.id)) {
            adminName = `${log.user.firstName} ${log.user.lastName}`;
            break;
          }
        }
      }

      const raffle = tx.tickets[0].raffle!;

      return {
        id: tx.id,
        buyerName: tx.buyerName || `${tx.user.firstName} ${tx.user.lastName}`,
        amount: Number(tx.amount),
        status: tx.status,
        date: tx.createdAt.toISOString(),
        ticketCount: tx._count.tickets,
        adminName,
        raffleId: raffle.id,
        raffleTitle: raffle.title,
        raffleStatus: raffle.status, // Para ordenar en el cliente
        receiptUrl: tx.receiptUrl,
      };
    });

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">
            Centro de <span className="text-primary-dynamic">Comando</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-2">
            Métricas Operativas Sincronizadas en Tiempo Real
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="relative overflow-hidden bg-[#0f172a] rounded-[2rem] p-8 shadow-xl group transition-transform hover:-translate-y-1">
          <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
            <Users size={120} className="text-white" />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Users size={14} className="text-primary-dynamic" /> Efectivos
              Registrados
            </p>
            <div className="mt-6">
              <h3 className="text-5xl font-mono font-black text-white tracking-tighter">
                {totalUsers}
              </h3>
              <div className="mt-4 inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                <ShieldCheck size={12} /> Verificados
              </div>
            </div>
          </div>
        </div>

        {/* TARJETA INTERACTIVA DE AUDITORÍA */}
        <TicketAuditCard
          totalTickets={totalTickets}
          auditedData={auditedData}
        />

        <div className="relative overflow-hidden bg-[#0f172a] rounded-[2rem] p-8 shadow-xl group transition-transform hover:-translate-y-1">
          <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
            <Globe size={120} className="text-white" />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Activity size={14} className="text-primary-dynamic" />{" "}
              Operaciones Activas
            </p>
            <div className="mt-6">
              <h3 className="text-5xl font-mono font-black text-white tracking-tighter">
                {activeRafflesCount}
              </h3>
              <div className="mt-4 inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                <Activity size={12} className="animate-pulse" /> En curso
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden bg-primary-dynamic rounded-[2rem] p-8 shadow-[0_10px_40px_rgba(37,99,235,0.3)] group transition-transform hover:-translate-y-1">
          <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <DollarSign size={120} className="text-white" />
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <p className="text-[10px] font-black text-white/80 uppercase tracking-widest flex items-center gap-2">
              <DollarSign size={14} className="text-white" /> Flujo de Capital
            </p>
            <div className="mt-6">
              <h3 className="text-4xl lg:text-4xl font-mono font-black text-white tracking-tighter line-clamp-1">
                $
                {totalRevenue.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </h3>
              <div className="mt-4 inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-white bg-white/20 px-3 py-1.5 rounded-xl backdrop-blur-md">
                <Lock size={12} /> Fondos Asegurados
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 pt-4">
        <div className="xl:col-span-2 bg-[#0f172a] rounded-[2.5rem] p-8 lg:p-10 shadow-xl flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-dynamic/5 rounded-full blur-[100px] -mr-32 -mt-32 transition-colors duration-1000"></div>

          <div className="relative z-10 flex justify-between items-start mb-8">
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-widest italic flex items-center gap-2">
                <TrendingUp className="text-primary-dynamic" size={20} />{" "}
                Rendimiento Financiero
              </h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">
                Análisis de telemetría de los últimos 7 días
              </p>
            </div>
            <Link
              href="/admin/estadisticas"
              className="text-[10px] font-black text-slate-400 hover:text-primary-dynamic uppercase tracking-widest transition-colors flex items-center gap-1"
            >
              Auditoría Completa <ChevronRight size={14} />
            </Link>
          </div>

          <div className="relative z-10 flex-1 flex items-end justify-between gap-3 h-48 mt-auto border-b border-slate-800 pb-2">
            {last7DaysData.map((data, i) => {
              const heightPercent =
                maxRevenue7Days > 0
                  ? (data.revenue / maxRevenue7Days) * 100
                  : 0;

              return (
                <div
                  key={i}
                  className="w-full relative group/bar flex justify-center h-full items-end"
                >
                  {heightPercent > 0 && (
                    <div className="absolute -top-8 text-[10px] font-mono text-emerald-400 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-slate-800 px-2 py-1 rounded-md">
                      ${data.revenue.toFixed(2)}
                    </div>
                  )}

                  {heightPercent > 0 && (
                    <div
                      className="w-full max-w-[3rem] bg-white/5 rounded-t-xl transition-all duration-500 group-hover/bar:bg-white/10 relative overflow-hidden"
                      style={{ height: `${Math.max(heightPercent, 15)}%` }}
                    >
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-primary-dynamic w-full transition-all duration-1000 delay-100"
                        style={{ height: "85%" }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="relative z-10 flex justify-between mt-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">
            {last7DaysData.map((data, i) => (
              <span key={i} className="flex-1 text-center">
                {data.dayLabel}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-[#0f172a] rounded-[2.5rem] p-8 shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:14px_24px]"></div>

          <div className="relative z-10">
            <h3 className="text-lg font-black text-white uppercase tracking-widest italic flex items-center gap-2 mb-8">
              <Cpu className="text-emerald-400" size={20} /> Status del Sistema
            </h3>

            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                    <Server size={14} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Base de Datos
                    </p>
                    <p className="text-[11px] font-mono font-bold text-white mt-1">
                      Esquemas Sincronizados
                    </p>
                  </div>
                </div>
                <CheckCircle2 size={16} className="text-emerald-500" />
              </div>

              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                    <Lock size={14} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Motor de Ingresos
                    </p>
                    <p className="text-[11px] font-mono font-bold text-white mt-1">
                      Operando al 100%
                    </p>
                  </div>
                </div>
                <CheckCircle2 size={16} className="text-emerald-500" />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                    <Globe size={14} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Tráfico de Red
                    </p>
                    <p className="text-[11px] font-mono font-bold text-white mt-1">
                      Estable / Seguro
                    </p>
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-8 pt-6 border-t border-slate-800">
            <Link
              href="/admin/estadisticas"
              className="w-full py-4 bg-white/5 text-slate-400 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-white/10 hover:text-white transition-all border border-transparent"
            >
              Auditar Tráfico de Red
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
