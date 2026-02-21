"use client";

import React, { useState, useRef } from "react";
import {
  Fingerprint,
  ShieldCheck,
  Upload,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { registerNewOfficer } from "./actions";

export default function OfficerForm({
  isSuper,
  canEdit,
  adminId,
}: {
  isSuper: boolean;
  canEdit: boolean;
  adminId: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  if (!canEdit) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Evita que la página se recargue y borre los campos
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      // Llamamos a la acción segura del servidor
      const res = await registerNewOfficer(formData, isSuper, adminId);

      if (!res?.success) {
        // Formateamos errores de base de datos para que sean legibles para el usuario
        let errorMsg =
          res?.error || "Error desconocido al procesar la solicitud.";
        if (errorMsg.includes("Unique constraint")) {
          errorMsg = "ERROR: El correo electrónico ya se encuentra registrado.";
        }
        setError(errorMsg);
      } else {
        // Solo borramos el formulario si fue un ÉXITO
        setSuccess(true);
        formRef.current?.reset();
      }
    } catch (err) {
      setError("Fallo de conexión crítica con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className={`p-6 rounded-[2rem] border relative overflow-hidden transition-all ${
        isSuper
          ? "bg-primary-dynamic/5 border-primary-dynamic/30 shadow-xl shadow-primary-dynamic/10"
          : "bg-black/40 border-white/5"
      } space-y-4`}
    >
      {/* Decoración de fondo */}
      <div
        className={`absolute -top-10 -right-10 opacity-5 ${isSuper ? "text-primary-dynamic" : "text-white"}`}
      >
        {isSuper ? <Fingerprint size={120} /> : <ShieldCheck size={120} />}
      </div>

      <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2 mb-4 relative z-10">
        {isSuper ? (
          <Fingerprint size={18} className="text-primary-dynamic" />
        ) : (
          <ShieldCheck size={18} className="text-blue-500" />
        )}
        Alta de {isSuper ? "SuperAdmin" : "Admin"}
      </h4>

      {/* ALERTAS DINÁMICAS (Se muestran si hay errores o éxito) */}
      {error && (
        <div className="relative z-10 bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-xl flex items-start gap-2 text-[10px] font-bold uppercase tracking-widest animate-in fade-in zoom-in duration-300">
          <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      {success && (
        <div className="relative z-10 bg-emerald-500/10 border border-emerald-500/50 text-emerald-500 p-3 rounded-xl flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest animate-in fade-in zoom-in duration-300">
          <CheckCircle2 size={14} />
          <span>Oficial Comisionado Exitosamente</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 relative z-10">
        <input
          name="firstName"
          placeholder="Nombre"
          required
          className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-[10px] text-white outline-none focus:border-primary-dynamic transition-all"
        />
        <input
          name="lastName"
          placeholder="Apellido"
          required
          className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-[10px] text-white outline-none focus:border-primary-dynamic transition-all"
        />
      </div>
      <input
        name="email"
        type="email"
        placeholder="Email Institucional"
        required
        className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-[10px] text-white outline-none focus:border-primary-dynamic transition-all relative z-10"
      />

      <div className="grid grid-cols-2 gap-3 relative z-10">
        <input
          name="password"
          type="password"
          placeholder="Pass (Ej: Admin123)"
          required
          className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-[10px] text-white outline-none focus:border-primary-dynamic transition-all"
        />
        <input
          name="confirmPassword"
          type="password"
          placeholder="Confirmar Pass"
          required
          className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-[10px] text-white outline-none focus:border-primary-dynamic transition-all"
        />
      </div>
      <div className="grid grid-cols-2 gap-3 relative z-10">
        <input
          name="idNumber"
          placeholder="DNI / Documento"
          required
          className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-[10px] text-white outline-none focus:border-primary-dynamic transition-all"
        />
        <input
          name="phone"
          placeholder="Teléfono"
          required
          className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-[10px] text-white outline-none focus:border-primary-dynamic transition-all"
        />
      </div>

      {isSuper && (
        <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-primary-dynamic/30 border-dashed rounded-2xl cursor-pointer hover:bg-primary-dynamic/10 transition-all group relative z-10">
          <Upload
            size={18}
            className="text-primary-dynamic mb-1 group-hover:-translate-y-1 transition-transform"
          />
          <span className="text-[8px] font-black text-primary-dynamic uppercase text-center px-2 tracking-widest">
            ID Biométrico Obligatorio
          </span>
          <input type="file" name="docFile" required className="hidden" />
        </label>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full p-5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex justify-center items-center gap-2 transition-all relative z-10 disabled:opacity-50 ${
          isSuper
            ? "bg-primary-dynamic text-white shadow-lg shadow-primary-dynamic/20 hover:brightness-110"
            : "bg-white/10 text-white hover:bg-white/20"
        }`}
      >
        {isLoading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          "Comisionar Oficial"
        )}
      </button>
    </form>
  );
}
