"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar } from "lucide-react";

export default function AnalyticsFilters({
  currentRange,
  currentDate,
}: {
  currentRange: string;
  currentDate: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`/admin/estadisticas?${params.toString()}`);
  };

  // 1. FUNCIÓN INTERCEPTORA: Adapta el input a un formato seguro para la Base de Datos
  const handleDateChange = (val: string) => {
    let formattedDate = val;

    // Si viene de un input tipo "month" (Ej: "2026-02"), le agregamos el día 1
    if (currentRange === "mensual" && val.length === 7) {
      formattedDate = `${val}-01`;
    }
    // Si viene del select de "año" (Ej: "2026"), le agregamos el mes 1 y día 1
    else if (currentRange === "anual" && val.length === 4) {
      formattedDate = `${val}-01-01`;
    }

    updateFilters("date", formattedDate);
  };

  // Generamos un rango de años automáticos para el selector Anual (Ej: desde 2024 hasta 2028)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      {/* ========================================= */}
      {/* TABS DE SELECCIÓN DE RANGO                */}
      {/* ========================================= */}
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

      {/* ========================================= */}
      {/* SELECTOR DE FECHA DINÁMICO (MUTABLE)      */}
      {/* ========================================= */}
      <div className="relative group">
        <label className="flex items-center gap-3 bg-slate-800/50 hover:bg-slate-800 p-3.5 rounded-2xl border border-white/5 cursor-pointer transition-all">
          <Calendar className="text-primary-dynamic" size={16} />

          {/* MODO DIARIO / SEMANAL: Calendario Completo */}
          {(currentRange === "diario" || currentRange === "semanal") && (
            <input
              type="date"
              value={currentDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="bg-transparent text-xs font-black text-white uppercase tracking-widest outline-none border-none [color-scheme:dark] cursor-pointer"
            />
          )}

          {/* MODO MENSUAL: Selector de Mes y Año */}
          {currentRange === "mensual" && (
            <input
              type="month"
              value={currentDate.substring(0, 7)} // Extrae solo "YYYY-MM"
              onChange={(e) => handleDateChange(e.target.value)}
              className="bg-transparent text-xs font-black text-white uppercase tracking-widest outline-none border-none [color-scheme:dark] cursor-pointer"
            />
          )}

          {/* MODO ANUAL: Dropdown de Años */}
          {currentRange === "anual" && (
            <select
              value={currentDate.substring(0, 4)} // Extrae solo "YYYY"
              onChange={(e) => handleDateChange(e.target.value)}
              className="bg-transparent text-xs font-black text-white uppercase tracking-widest outline-none border-none cursor-pointer appearance-none"
            >
              {years.map((y) => (
                <option key={y} value={y} className="bg-slate-900 text-white">
                  {y}
                </option>
              ))}
            </select>
          )}
        </label>
      </div>
    </div>
  );
}
