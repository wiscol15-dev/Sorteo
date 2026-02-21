"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

interface AnalyticsChartsProps {
  trafficData: any[];
  rafflePerformance: any[];
}

export default function AnalyticsCharts({
  trafficData,
  rafflePerformance,
}: AnalyticsChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
      {/* SECCIÓN: EVOLUCIÓN DE TRÁFICO (AUDITORÍA DE FLUJO) */}
      <section className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-2xl shadow-2xl group relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/50 via-emerald-500/50 to-transparent opacity-30" />

        <div className="flex items-center justify-between mb-8 relative z-10">
          <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] group-hover:text-primary transition-all duration-500">
            Evolución de Tráfico
          </h3>
          <div className="flex gap-3">
            <div className="flex items-center gap-1.5 text-[8px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-3 py-1.5 rounded-xl border border-blue-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />{" "}
              Visitas
            </div>
            <div className="flex items-center gap-1.5 text-[8px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />{" "}
              Clicks
            </div>
          </div>
        </div>

        <div className="h-[320px] w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trafficData}>
              <defs>
                <linearGradient id="colorVisitas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="4 4"
                stroke="#ffffff05"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                stroke="#475569"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                dy={15}
              />
              <YAxis
                stroke="#475569"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                dx={-15}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "20px",
                  fontSize: "11px",
                  fontWeight: "900",
                  color: "#fff",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                  textTransform: "uppercase",
                  padding: "12px 16px",
                }}
                cursor={{
                  stroke: "#3b82f6",
                  strokeWidth: 2,
                  strokeDasharray: "6 6",
                }}
              />
              <Area
                type="natural"
                dataKey="visitas"
                stroke="#3b82f6"
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#colorVisitas)"
                animationDuration={2500}
                animationEasing="ease-in-out"
              />
              <Area
                type="natural"
                dataKey="clicks"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorClicks)"
                animationDuration={3000}
                animationEasing="ease-in-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* SECCIÓN: RENDIMIENTO DE SORTEOS (BARRAS DE IMPACTO) */}
      <section className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-2xl shadow-2xl group relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-primary/50 via-blue-500/50 to-transparent opacity-30" />

        <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] mb-8 group-hover:text-primary transition-all duration-500 relative z-10">
          Ventas por Sorteo
        </h3>

        <div className="h-[320px] w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rafflePerformance}>
              <CartesianGrid
                strokeDasharray="4 4"
                stroke="#ffffff05"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                stroke="#475569"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                dy={15}
              />
              <YAxis
                stroke="#475569"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                dx={-15}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "20px",
                  fontSize: "11px",
                  fontWeight: "900",
                  padding: "12px 16px",
                }}
              />
              <Bar
                dataKey="vendidos"
                fill="#3b82f6"
                radius={[12, 12, 4, 4]}
                barSize={48}
                animationDuration={2500}
                className="hover:fill-primary transition-all duration-300 cursor-pointer"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
