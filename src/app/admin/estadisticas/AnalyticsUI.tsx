"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Calendar as CalendarIcon,
  DollarSign,
  Ticket,
  Users,
  Trophy,
  AlertTriangle,
  BarChart2,
} from "lucide-react";

interface AnalyticsUIProps {
  stats: {
    revenue: number;
    tickets: number;
    users: number;
    finishedRaffles: number;
  };
  chartData: { name: string; value: number }[];
  currentRange: string;
  currentDate: string;
}

export default function AnalyticsUI({
  stats,
  chartData,
  currentRange,
  currentDate,
}: AnalyticsUIProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Función para actualizar los parámetros en la URL de forma suave
  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`/admin/estadisticas?${params.toString()}`);
  };

  const hasData =
    stats.revenue > 0 ||
    stats.tickets > 0 ||
    stats.users > 0 ||
    stats.finishedRaffles > 0;

  return (
    <div className="space-y-8">
      {/* HEADER Y CONTROLES DE FILTRADO */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">
            Panel de <span className="text-blue-500">Analíticas</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-2">
            Infraestructura de datos en tiempo real
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* TABS DE RANGO (Diario, Semanal, Mensual, Anual) */}
          <div className="flex bg-[#0f172a] p-1.5 rounded-2xl border border-slate-800 shadow-inner">
            {["diario", "semanal", "mensual", "anual"].map((r) => (
              <button
                key={r}
                onClick={() => updateFilters("range", r)}
                className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                  currentRange === r
                    ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* SELECTOR DE FECHA */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-hover:text-blue-500 transition-colors">
              <CalendarIcon size={16} />
            </div>
            <input
              type="date"
              value={currentDate}
              onChange={(e) => updateFilters("date", e.target.value)}
              className="bg-[#0f172a] border border-slate-800 text-white text-xs font-bold pl-12 pr-4 py-3.5 rounded-2xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all [color-scheme:dark] cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* RENDERIZADO CONDICIONAL: ¿Hay datos en esta fecha? */}
      {!hasData ? (
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
            seleccionados.
          </p>
        </div>
      ) : (
        <>
          {/* TARJETAS DE MÉTRICAS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-[2rem] p-8 shadow-[0_10px_30px_rgba(59,130,246,0.3)] border border-blue-400/30 relative overflow-hidden group">
              <DollarSign
                size={100}
                className="absolute -right-4 -top-4 opacity-20 text-white group-hover:scale-110 transition-transform duration-700"
              />
              <div className="relative z-10">
                <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest">
                  Ingresos Brutos
                </p>
                <h3 className="text-4xl font-mono font-black text-white tracking-tighter mt-4">
                  $
                  {stats.revenue.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </h3>
                <div className="mt-4 text-[8px] font-black uppercase tracking-widest bg-white/20 inline-block px-3 py-1 rounded-full text-white backdrop-blur-md">
                  Auditoría Real
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-[2rem] p-8 shadow-[0_10px_30px_rgba(16,185,129,0.3)] border border-emerald-300/30 relative overflow-hidden group">
              <Ticket
                size={100}
                className="absolute -right-4 -top-4 opacity-20 text-white group-hover:scale-110 transition-transform duration-700"
              />
              <div className="relative z-10">
                <p className="text-[10px] font-black text-emerald-100 uppercase tracking-widest">
                  Tickets Emitidos
                </p>
                <h3 className="text-4xl font-mono font-black text-white tracking-tighter mt-4">
                  {stats.tickets}
                </h3>
                <div className="mt-4 text-[8px] font-black uppercase tracking-widest bg-black/20 inline-block px-3 py-1 rounded-full text-white backdrop-blur-md">
                  Volumen Total
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-[2rem] p-8 shadow-[0_10px_30px_rgba(249,115,22,0.3)] border border-orange-300/30 relative overflow-hidden group">
              <Users
                size={100}
                className="absolute -right-4 -top-4 opacity-20 text-white group-hover:scale-110 transition-transform duration-700"
              />
              <div className="relative z-10">
                <p className="text-[10px] font-black text-orange-100 uppercase tracking-widest">
                  Usuarios Registrados
                </p>
                <h3 className="text-4xl font-mono font-black text-white tracking-tighter mt-4">
                  {stats.users}
                </h3>
                <div className="mt-4 text-[8px] font-black uppercase tracking-widest bg-black/20 inline-block px-3 py-1 rounded-full text-white backdrop-blur-md">
                  Base de Datos
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-[2rem] p-8 shadow-[0_10px_30px_rgba(251,191,36,0.3)] border border-amber-300/30 relative overflow-hidden group">
              <Trophy
                size={100}
                className="absolute -right-4 -top-4 opacity-20 text-white group-hover:scale-110 transition-transform duration-700"
              />
              <div className="relative z-10">
                <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest">
                  Sorteos Finalizados
                </p>
                <h3 className="text-4xl font-mono font-black text-slate-900 tracking-tighter mt-4">
                  {stats.finishedRaffles}
                </h3>
                <div className="mt-4 text-[8px] font-black uppercase tracking-widest bg-black/10 inline-block px-3 py-1 rounded-full text-slate-900 backdrop-blur-md">
                  Ejecutados
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN DE GRÁFICOS (100% REALES BASADOS EN PRISMA) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <div className="bg-[#0f172a] rounded-[2.5rem] p-8 border border-slate-800 shadow-2xl flex flex-col h-[350px]">
              <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 mb-8">
                <BarChart2 className="text-blue-500" size={18} /> Ventas por
                Sorteo (Top)
              </h3>

              {chartData.length > 0 ? (
                <div className="flex-1 flex items-end justify-around gap-4 mt-auto border-b border-slate-800 pb-2">
                  {chartData.map((data, i) => {
                    const maxVal = Math.max(...chartData.map((d) => d.value));
                    const heightPercent =
                      maxVal === 0 ? 0 : (data.value / maxVal) * 100;
                    return (
                      <div
                        key={i}
                        className="flex flex-col items-center w-full group"
                      >
                        <div className="text-[10px] font-mono text-blue-400 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {data.value}
                        </div>
                        <div
                          className="w-full max-w-[3rem] bg-slate-800 rounded-t-xl overflow-hidden relative"
                          style={{ height: "200px" }}
                        >
                          <div
                            className="absolute bottom-0 left-0 w-full bg-blue-500 transition-all duration-1000"
                            style={{ height: `${heightPercent}%` }}
                          ></div>
                        </div>
                        <span
                          className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-4 truncate w-full text-center px-1 block"
                          title={data.name}
                        >
                          {data.name.substring(0, 10)}...
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-600 text-[10px] font-bold uppercase tracking-widest">
                  No hay ventas para graficar en este periodo.
                </div>
              )}
            </div>

            {/* Panel decorativo para emular la gráfica de curvas de tu diseño */}
            <div className="bg-[#0f172a] rounded-[2.5rem] p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8 relative z-10">
                Evolución de Tráfico (Simulación)
              </h3>
              <div className="absolute inset-0 top-20 flex items-center justify-center opacity-30">
                {/* Curva SVG decorativa para igualar el diseño original */}
                <svg
                  viewBox="0 0 500 150"
                  preserveAspectRatio="none"
                  className="w-full h-full stroke-emerald-500 fill-none stroke-[3]"
                >
                  <path d="M0,100 C150,200 250,0 500,100" />
                </svg>
                <svg
                  viewBox="0 0 500 150"
                  preserveAspectRatio="none"
                  className="w-full h-full stroke-blue-500 fill-none stroke-[3] absolute top-0 left-0"
                >
                  <path d="M0,50 C200,150 300,50 500,80" />
                </svg>
              </div>
              <div className="absolute bottom-6 left-8 right-8 flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest z-10 border-t border-slate-800 pt-4">
                <span>LUN</span>
                <span>MAR</span>
                <span>MIE</span>
                <span>JUE</span>
                <span>VIE</span>
                <span>SAB</span>
                <span>DOM</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
