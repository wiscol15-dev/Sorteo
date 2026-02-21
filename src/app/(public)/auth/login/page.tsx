"use client";

import React, { useState, useEffect, Suspense } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import Link from "next/link";

import {
  Ticket,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  ChevronLeft,
} from "lucide-react";

import { login } from "../actions";

function LoginForm() {
  const router = useRouter();

  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setSuccessMsg(
        "Protocolo KYC Recibido. Tu cuenta está en fase de auditoría administrativa.",
      );
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsLoading(true);

    setError(null);

    setSuccessMsg(null);

    const formData = new FormData(e.currentTarget);

    try {
      const response = await login(formData);

      if (response && response.success && response.redirectTo) {
        router.push(response.redirectTo);

        router.refresh();
      } else {
        setError(response?.error || "Error en el protocolo de autenticación.");

        setIsLoading(false);
      }
    } catch (err) {
      setError("Fallo crítico de conexión con el servidor de seguridad.");

      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-700 relative z-10">
      {/* BRANDING TÁCTICO */}

      <div className="text-center space-y-6">
        <div className="inline-flex bg-slate-900 p-5 rounded-[2.5rem] shadow-2xl shadow-slate-300 hover:scale-105 transition-transform duration-500">
          <Ticket className="text-primary-dynamic" size={40} />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">
            Acceso <span className="text-primary-dynamic">Seguro</span>
          </h1>

          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
            Autenticación de Grado Operativo
          </p>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[4rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] border border-slate-100 space-y-8 relative overflow-hidden">
        {/* INDICADORES DE ESTADO */}

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-start gap-3 text-[10px] font-black uppercase tracking-widest border border-red-100 animate-in shake duration-500">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />

            <p className="leading-relaxed">{error}</p>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl flex items-start gap-3 text-[10px] font-black uppercase tracking-widest border border-emerald-100 animate-in slide-in-from-top-4 duration-700">
            <CheckCircle2 size={18} className="shrink-0 mt-0.5" />

            <p className="leading-relaxed">{successMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
              Identificador de Usuario
            </label>

            <div className="relative group">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-dynamic transition-colors"
                size={18}
              />

              <input
                type="email"
                name="email"
                required
                placeholder="usuario@dominio.com"
                disabled={isLoading}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-primary-dynamic/20 focus:bg-white p-5 pl-12 rounded-2xl outline-none transition-all font-bold text-slate-900 text-sm placeholder:text-slate-300 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
              Clave de Seguridad
            </label>

            <div className="relative group">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary-dynamic transition-colors"
                size={18}
              />

              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                disabled={isLoading}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-primary-dynamic/20 focus:bg-white p-5 pl-12 rounded-2xl outline-none transition-all font-bold text-slate-900 text-sm placeholder:text-slate-300 disabled:opacity-50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-900 hover:bg-primary-dynamic text-white p-6 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-2xl shadow-slate-900/20 group disabled:opacity-70 disabled:grayscale"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Validando...
              </>
            ) : (
              <>
                Entrar al Sistema
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 text-center border-t border-slate-50">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
            ¿No tienes cuenta activa?{" "}
            <Link
              href="/auth/registro"
              className="text-primary-dynamic hover:underline ml-1"
            >
              Registro KYC
            </Link>
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
          <ShieldCheck size={14} className="text-emerald-500" />

          <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">
            TLS 1.3 Encryption Active
          </span>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft size={14} /> Volver al Inicio
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="absolute -top-48 -right-48 w-full max-w-lg h-[30rem] bg-primary-dynamic/10 rounded-full blur-[120px]"></div>

      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-4">
            <Loader2 size={40} className="animate-spin text-primary-dynamic" />

            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Iniciando Enlace...
            </p>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
