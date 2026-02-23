"use client";

import React, { useState } from "react";
import { Landmark, Plus, Trash2 } from "lucide-react";

export default function BankConfigClient({
  initialData,
  isSuper,
}: {
  initialData: Record<string, any>;
  isSuper: boolean;
}) {
  const defaultBanks = [
    "Provincial",
    "Mercantil",
    "Venezuela",
    "Banesco",
    "Binance",
  ];

  const startingBanks =
    Object.keys(initialData).length > 0
      ? Object.keys(initialData)
      : defaultBanks;

  const [banks, setBanks] = useState<string[]>(startingBanks);
  const [newBank, setNewBank] = useState("");

  const handleAddBank = () => {
    const trimmed = newBank.trim();
    if (trimmed && !banks.includes(trimmed)) {
      setBanks([...banks, trimmed]);
      setNewBank("");
    }
  };

  const handleRemoveBank = (bankToRemove: string) => {
    if (confirm(`¿Seguro que deseas eliminar el banco ${bankToRemove}?`)) {
      setBanks(banks.filter((b) => b !== bankToRemove));
    }
  };

  return (
    <div className="bg-black/30 p-6 rounded-2xl border border-white/5 space-y-5">
      <div className="flex justify-between items-center border-b border-white/5 pb-3">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Landmark size={14} className="text-primary-dynamic" /> 5. Cuentas
          Bancarias
        </h4>
        <span className="text-[8px] bg-primary-dynamic/20 text-primary-dynamic px-2 py-1 rounded-full font-black uppercase tracking-widest">
          Pago Externo
        </span>
      </div>

      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">
        Configura los datos para las transferencias manuales. Todos los campos
        son opcionales según lo que requiera cada banco.
      </p>

      {isSuper && (
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newBank}
            onChange={(e) => setNewBank(e.target.value)}
            placeholder="Ej: Zelle, PayPal, Banorte..."
            className="flex-grow bg-slate-900 border border-white/10 p-3 rounded-xl text-white text-xs font-bold outline-none focus:border-primary-dynamic transition-colors"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddBank();
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddBank}
            disabled={!newBank.trim()}
            className="bg-primary-dynamic text-white px-4 rounded-xl flex items-center gap-2 text-xs font-black uppercase tracking-widest disabled:opacity-50 transition-colors hover:brightness-110"
          >
            <Plus size={16} /> Agregar
          </button>
        </div>
      )}

      <input type="hidden" name="total_banks_count" value={banks.length} />

      <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
        {banks.map((bank, index) => {
          const bankData = initialData[bank] || {
            titular: "",
            doc: "",
            account: "",
            phone: "",
            type: "",
          };
          const hasData =
            bankData.titular || bankData.account || bankData.phone;

          return (
            <details
              key={bank}
              className="group bg-white/5 border border-white/10 rounded-xl overflow-hidden"
            >
              <summary className="text-xs font-black text-white uppercase p-4 cursor-pointer flex justify-between items-center hover:bg-white/10 transition-colors">
                <span className="flex items-center gap-2">
                  {bank}
                  {hasData && (
                    <span
                      className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                      title="Configurado"
                    ></span>
                  )}
                </span>
                <span className="text-[9px] text-slate-500 group-open:hidden uppercase tracking-widest bg-black/40 px-3 py-1 rounded-lg">
                  Configurar
                </span>
              </summary>

              <div className="p-5 border-t border-white/10 space-y-4 bg-black/40 relative">
                {isSuper && (
                  <button
                    type="button"
                    onClick={() => handleRemoveBank(bank)}
                    className="absolute top-4 right-4 text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 p-2 rounded-lg transition-colors"
                    title="Eliminar Banco"
                  >
                    <Trash2 size={14} />
                  </button>
                )}

                <input type="hidden" name={`bank_${index}_name`} value={bank} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                      Titular de la Cuenta
                    </label>
                    <input
                      name={`bank_${index}_titular`}
                      defaultValue={bankData.titular}
                      disabled={!isSuper}
                      className="w-full bg-slate-900 border border-white/10 p-3.5 rounded-xl text-white text-xs font-bold outline-none focus:border-primary-dynamic disabled:opacity-30 transition-colors pr-10"
                      placeholder="Ej: Juan Pérez"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                      Documento / RIF
                    </label>
                    <input
                      name={`bank_${index}_doc`}
                      defaultValue={bankData.doc}
                      disabled={!isSuper}
                      className="w-full bg-slate-900 border border-white/10 p-3.5 rounded-xl text-white text-xs font-bold outline-none focus:border-primary-dynamic disabled:opacity-30 transition-colors pr-10"
                      placeholder="Ej: V-12345678"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                      Número de Cuenta
                    </label>
                    <input
                      name={`bank_${index}_account`}
                      defaultValue={bankData.account}
                      disabled={!isSuper}
                      className="w-full bg-slate-900 border border-white/10 p-3.5 rounded-xl text-white text-xs font-mono outline-none focus:border-primary-dynamic disabled:opacity-30 transition-colors tracking-wider"
                      placeholder="0102..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                      Número de Teléfono
                    </label>
                    <input
                      name={`bank_${index}_phone`}
                      defaultValue={bankData.phone}
                      disabled={!isSuper}
                      className="w-full bg-slate-900 border border-white/10 p-3.5 rounded-xl text-white text-xs font-mono outline-none focus:border-primary-dynamic disabled:opacity-30 transition-colors tracking-wider"
                      placeholder="Ej: 04141234567"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                      Tipo de Cuenta
                    </label>
                    <input
                      name={`bank_${index}_type`}
                      defaultValue={bankData.type}
                      disabled={!isSuper}
                      className="w-full bg-slate-900 border border-white/10 p-3.5 rounded-xl text-white text-xs font-bold outline-none focus:border-primary-dynamic disabled:opacity-30 transition-colors"
                      placeholder="Corriente / Ahorro / Pago Móvil"
                    />
                  </div>
                </div>
              </div>
            </details>
          );
        })}

        {banks.length === 0 && (
          <div className="text-center p-6 border border-dashed border-white/10 rounded-xl text-slate-500 text-xs font-bold uppercase tracking-widest">
            No hay bancos configurados
          </div>
        )}
      </div>
    </div>
  );
}
