import React from "react";
import prisma from "@/lib/prisma";
import {
  Users,
  Trophy,
  TrendingUp,
  AlertCircle,
  DollarSign,
  Ticket,
  AlertTriangle,
} from "lucide-react";
import AnalyticsCharts from "./AnalyticsCharts";
import AnalyticsFilters from "./AnalyticsFilters";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage(props: {
  searchParams: Promise<{ range?: string; date?: string }>;
}) {
  const searchParams = await props.searchParams;

  // 1. OBTENCIÓN DE PARÁMETROS DE URL (Por defecto: 'mensual' y 'hoy')
  const range = searchParams?.range || "mensual";
  const targetDateStr =
    searchParams?.date || new Date().toISOString().split("T")[0];
  const targetDate = new Date(`${targetDateStr}T12:00:00`);

  // 2. LÓGICA MATEMÁTICA DE LÍMITES DE TIEMPO
  let startDate = new Date();
  let endDate = new Date();

  if (range === "diario") {
    startDate = new Date(targetDate.setHours(0, 0, 0, 0));
    endDate = new Date(targetDate.setHours(23, 59, 59, 999));
  } else if (range === "semanal") {
    const day = targetDate.getDay() || 7;
    startDate = new Date(targetDate.setHours(0, 0, 0, 0));
    startDate.setHours(-24 * (day - 1));
    endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
  } else if (range === "anual") {
    startDate = new Date(targetDate.getFullYear(), 0, 1, 0, 0, 0);
    endDate = new Date(targetDate.getFullYear(), 11, 31, 23, 59, 59, 999);
  } else {
    // MENSUAL
    startDate = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      1,
      0,
      0,
      0,
    );
    endDate = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );
  }

  const dateFilter = {
    gte: startDate,
    lte: endDate,
  };

  // 3. EXTRACCIÓN DE DATOS FILTRADOS POR FECHA
  const [
    totalUsers,
    totalTickets,
    totalRaffles,
    finishedRaffles,
    revenueData,
    recentTransactions,
  ] = await Promise.all([
    prisma.user.count({ where: { createdAt: dateFilter } }),
    prisma.ticket.count({ where: { createdAt: dateFilter } }),
    prisma.raffle.count({ where: { createdAt: dateFilter } }),
    prisma.raffle.count({
      where: { status: "FINISHED", updatedAt: dateFilter },
    }),
    prisma.ticket.aggregate({
      _sum: { price: true } as any,
      where: { createdAt: dateFilter },
    }),
    prisma.transaction.findMany({
      where: { createdAt: dateFilter },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    }),
  ]);

  const rawRevenue = (revenueData?._sum as any)?.price;
  const totalRevenue = rawRevenue ? Number(rawRevenue) : 0;

  // Si no hay datos en el rango seleccionado, mostramos el "Estado Vacío"
  const hasData =
    totalRevenue > 0 ||
    totalTickets > 0 ||
    totalUsers > 0 ||
    finishedRaffles > 0;

  // Consultas para gráficos (se mantienen estáticas por ahora según tu código original)
  const raffles = await prisma.raffle.findMany({
    take: 6,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { tickets: true } } },
  });

  const rafflePerformance = raffles.map((r) => ({
    name: r.title.length > 10 ? r.title.substring(0, 10) + "..." : r.title,
    vendidos: r._count.tickets,
  }));

  const trafficData = [
    { name: "Lun", visitas: 4000, clicks: 2400 },
    { name: "Mar", visitas: 3000, clicks: 1398 },
    { name: "Mie", visitas: 2000, clicks: 9800 },
    { name: "Jue", visitas: 2780, clicks: 3908 },
    { name: "Vie", visitas: 1890, clicks: 4800 },
    { name: "Sab", visitas: 2390, clicks: 3800 },
    { name: "Dom", visitas: 3490, clicks: 4300 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 bg-[#0f172a] p-8 rounded-[3rem] min-h-screen border border-white/5">
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">
            Panel de <span className="text-primary-dynamic">Analíticas</span>
          </h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2 italic">
            Infraestructura de datos en tiempo real
          </p>
        </div>

        {/* COMPONENTE CLIENTE PARA LOS BOTONES DE FILTRO */}
        <AnalyticsFilters currentRange={range} currentDate={targetDateStr} />
      </header>

      {!hasData ? (
        // ESTADO VACÍO (Si la fecha no tiene datos)
        <div className="bg-[#0f172a] border border-red-500/20 rounded-[2.5rem] p-16 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#ef4444_1px,transparent_1px),linear-gradient(to_bottom,#ef4444_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <AlertTriangle
            size={64}
            className="text-red-500 mb-6 relative z-10 animate-pulse"
          />
          <h3 className="text-2xl font-black text-white uppercase tracking-widest relative z-10">
            0 Registros Encontrados
          </h3>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mt-3 relative z-10">
            No existen transacciones ni operaciones para los parámetros
            seleccionados ({range}).
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              title="Ingresos Brutos"
              value={`$${totalRevenue.toLocaleString()}`}
              trend="Auditoría Real"
              icon={<DollarSign size={24} />}
              color="from-indigo-600 to-blue-500"
            />
            <KPICard
              title="Tickets Emitidos"
              value={totalTickets.toLocaleString()}
              trend="Volumen Total"
              icon={<Ticket size={24} />}
              color="from-emerald-600 to-teal-500"
            />
            <KPICard
              title="Usuarios Activos"
              value={totalUsers.toLocaleString()}
              trend="Base de Datos"
              icon={<Users size={24} />}
              color="from-rose-600 to-orange-500"
            />
            <KPICard
              title="Sorteos Finalizados"
              value={finishedRaffles.toString()}
              trend={`${totalRaffles} Creados`}
              icon={<Trophy size={24} />}
              color="from-amber-500 to-yellow-400"
            />
          </div>

          <AnalyticsCharts
            trafficData={trafficData}
            rafflePerformance={rafflePerformance}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-white">
            <div className="lg:col-span-2 bg-slate-900/50 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-sm">
              <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                <TrendingUp size={16} className="text-primary-dynamic" />{" "}
                Transacciones Recientes
              </h3>
              <div className="space-y-4">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((tx) => (
                    <ActivityRow
                      key={tx.id}
                      user={tx.user.firstName}
                      action={`${tx.type} - $${Number(tx.amount).toFixed(2)}`}
                      date={new Date(tx.createdAt).toLocaleTimeString()}
                    />
                  ))
                ) : (
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center py-4">
                    Sin transacciones en este periodo.
                  </p>
                )}
              </div>
            </div>
            <div className="bg-red-500/5 p-8 rounded-[2.5rem] border border-red-500/10 backdrop-blur-sm">
              <h3 className="text-xs font-black text-red-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                <AlertCircle size={16} /> Auditoría SSL
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed italic">
                    Cifrado de punto a punto activo y verificado.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function KPICard({ title, value, trend, icon, color }: any) {
  return (
    <div
      className={`bg-gradient-to-br ${color} p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-500`}
    >
      <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <p className="text-[10px] font-black uppercase text-white/70 tracking-widest">
        {title}
      </p>
      <h4 className="text-3xl font-black text-white mt-2 tracking-tighter">
        {value}
      </h4>
      <p className="text-[9px] font-bold text-white/50 uppercase mt-4 bg-black/10 inline-block px-2 py-1 rounded-lg italic">
        {trend}
      </p>
    </div>
  );
}

function ActivityRow({ user, action, date }: any) {
  return (
    <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary-dynamic/20 flex items-center justify-center text-xs font-black text-primary-dynamic group-hover:scale-110 transition-transform">
          {user[0]}
        </div>
        <div>
          <p className="text-xs font-black text-white uppercase tracking-tighter">
            {user}
          </p>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            {action}
          </p>
        </div>
      </div>
      <span className="text-[10px] text-slate-600 font-black italic">
        {date}
      </span>
    </div>
  );
}
