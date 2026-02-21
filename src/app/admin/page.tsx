import React from "react";
import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  ShieldCheck,
  Users,
  Ticket,
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

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // 1. CÁLCULO DE FECHAS (Últimos 7 Días exactos)
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0); // Desde las 00:00 de hace 6 días (7 días en total contando hoy)

  // 2. EXTRACCIÓN DE MÉTRICAS PARALELIZADAS
  const [
    totalUsers,
    totalTickets,
    activeRafflesCount,
    revenueResult,
    recentTickets,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.ticket.count(),
    prisma.raffle.count({ where: { status: "ACTIVE" } }),
    prisma.ticket.aggregate({
      _sum: { price: true } as any,
    }),
    // Extraemos solo los tickets de los últimos 7 días para el gráfico
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
  ]);

  // 3. SANITIZACIÓN DE INGRESOS TOTALES
  const rawRevenue = (revenueResult?._sum as any)?.price;
  const totalRevenue = rawRevenue ? Number(rawRevenue) : 0;

  // 4. MOTOR LÓGICO PARA EL GRÁFICO DE LOS ÚLTIMOS 7 DÍAS
  const daysMap = ["DOM", "LUN", "MAR", "MIE", "JUE", "VIE", "SAB"];

  // Creamos la estructura base con los últimos 7 días en $0
  const last7DaysData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (6 - i));
    return {
      dateStr: d.toISOString().split("T")[0],
      dayLabel: daysMap[d.getDay()],
      revenue: 0,
    };
  });

  // Rellenamos la estructura con los ingresos reales
  recentTickets.forEach((ticket) => {
    const tDate = ticket.createdAt.toISOString().split("T")[0];
    const dayRecord = last7DaysData.find((d) => d.dateStr === tDate);
    if (dayRecord) {
      dayRecord.revenue += Number(ticket.price || 0);
    }
  });

  // Calculamos el máximo para establecer las alturas dinámicas (porcentajes)
  const maxRevenue7Days = Math.max(...last7DaysData.map((d) => d.revenue));

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      {/* ========================================= */}
      {/* ENCABEZADO TÁCTICO                        */}
      {/* ========================================= */}
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

      {/* ========================================= */}
      {/* KPIs: PANELES DE ALTO CONTRASTE           */}
      {/* ========================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* TARJETA 1: USUARIOS */}
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

        {/* TARJETA 2: BOLETOS */}
        <div className="relative overflow-hidden bg-[#0f172a] rounded-[2rem] p-8 shadow-xl group transition-transform hover:-translate-y-1">
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
              <div className="mt-4 inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                <ArrowUpRight size={12} /> Emitidos
              </div>
            </div>
          </div>
        </div>

        {/* TARJETA 3: SORTEOS */}
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

        {/* TARJETA 4: INGRESOS */}
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

      {/* ========================================= */}
      {/* SECCIÓN SECUNDARIA: RENDIMIENTO Y SALUD   */}
      {/* ========================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 pt-4">
        {/* GRÁFICO TÁCTICO DINÁMICO */}
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

          {/* Gráfico de Barras REAL */}
          <div className="relative z-10 flex-1 flex items-end justify-between gap-3 h-48 mt-auto border-b border-slate-800 pb-2">
            {last7DaysData.map((data, i) => {
              // Calculamos la altura de la barra. Si no hay datos, la altura es 0.
              const heightPercent =
                maxRevenue7Days > 0
                  ? (data.revenue / maxRevenue7Days) * 100
                  : 0;

              return (
                <div
                  key={i}
                  className="w-full relative group/bar flex justify-center h-full items-end"
                >
                  {/* Tooltip con el valor real en Hover (Solo si hay ingresos) */}
                  {heightPercent > 0 && (
                    <div className="absolute -top-8 text-[10px] font-mono text-emerald-400 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-slate-800 px-2 py-1 rounded-md">
                      ${data.revenue.toFixed(2)}
                    </div>
                  )}

                  {/* La barra se pinta SOLAMENTE si heightPercent es mayor a 0 */}
                  {heightPercent > 0 && (
                    <div
                      className="w-full max-w-[3rem] bg-white/5 rounded-t-xl transition-all duration-500 group-hover/bar:bg-white/10 relative overflow-hidden"
                      style={{ height: `${Math.max(heightPercent, 15)}%` }} // 15% mínimo visual si hay ventas
                    >
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-primary-dynamic w-full transition-all duration-1000 delay-100"
                        style={{ height: "85%" }} // Relleno interno
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Etiquetas de Días Dinámicas (LUN, MAR, etc. generadas por el servidor) */}
          <div className="relative z-10 flex justify-between mt-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">
            {last7DaysData.map((data, i) => (
              <span key={i} className="flex-1 text-center">
                {data.dayLabel}
              </span>
            ))}
          </div>
        </div>

        {/* STATUS DEL NÚCLEO (SYSTEM HEALTH) */}
        <div className="bg-[#0f172a] rounded-[2.5rem] p-8 shadow-xl flex flex-col justify-between relative overflow-hidden">
          {/* Patrón de fondo estilo radar/grid suave */}
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
