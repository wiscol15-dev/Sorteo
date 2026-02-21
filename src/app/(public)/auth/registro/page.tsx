"use client";

import React, { useState } from "react";

import Link from "next/link";

import Image from "next/image";

import {
  Ticket,
  User,
  Mail,
  Lock,
  Phone,
  CreditCard,
  ArrowRight,
  Loader2,
  AlertCircle,
  Camera,
  ShieldCheck,
  Clock,
  CheckCircle2,
} from "lucide-react";

import { registerUser } from "../actions";

export default function RegistroPage() {
  const [isLoading, setIsLoading] = useState(false);

  const [isSuccess, setIsSuccess] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsLoading(true);

    setError(null);

    const formData = new FormData(e.currentTarget);

    const idFile = formData.get("idFile") as File;

    if (!idFile || idFile.size === 0) {
      setError(
        "La fotografía del documento de identidad es obligatoria por seguridad.",
      );

      setIsLoading(false);

      return;
    }

    try {
      const response = await registerUser(formData);

      if (response && response.success) {
        setIsSuccess(true);

        setIsLoading(false);
      } else {
        setError(
          response?.error ||
            "Ocurrió un error durante el protocolo de registro.",
        );

        setIsLoading(false);
      }
    } catch (err) {
      setError("Fallo crítico de conexión. Por favor, intenta de nuevo.");

      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-20 px-6 flex items-center justify-center">
      <div className="max-w-5xl w-full mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-700">
        {!isSuccess ? (
          <>
            <div className="text-center space-y-6">
              <div className="inline-flex bg-slate-900 p-4 rounded-[2rem] shadow-2xl shadow-slate-300">
                <Ticket className="text-primary-dynamic" size={40} />
              </div>

              <div className="space-y-2">
                <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic">
                  Únete a <span className="text-primary-dynamic">Nosotros</span>
                </h1>

                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
                  Proceso de Verificación Segura (KYC)
                </p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest border border-red-100 animate-in fade-in slide-in-from-top-2 max-w-xl mx-auto">
                <AlertCircle size={16} className="shrink-0" />

                <p>{error}</p>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="bg-white p-10 rounded-[4rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] border border-slate-100 grid grid-cols-1 lg:grid-cols-2 gap-12"
            >
              <div className="space-y-8">
                <h3 className="text-xl font-black uppercase italic tracking-widest text-slate-900 border-b border-slate-50 pb-4 flex items-center gap-3">
                  <User className="text-primary-dynamic" size={20} /> Datos
                  Personales
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">
                      Nombre
                    </label>

                    <div className="relative">
                      <User
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                        size={16}
                      />

                      <input
                        name="firstName"
                        type="text"
                        required
                        disabled={isLoading}
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-primary-dynamic/20 focus:bg-white p-4 pl-12 rounded-2xl outline-none transition-all font-bold text-slate-900 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">
                      Apellido
                    </label>

                    <div className="relative">
                      <User
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                        size={16}
                      />

                      <input
                        name="lastName"
                        type="text"
                        required
                        disabled={isLoading}
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-primary-dynamic/20 focus:bg-white p-4 pl-12 rounded-2xl outline-none transition-all font-bold text-slate-900 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">
                    Cédula / Identificación
                  </label>

                  <div className="relative">
                    <CreditCard
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                      size={16}
                    />

                    <input
                      name="idNumber"
                      type="text"
                      required
                      disabled={isLoading}
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-primary-dynamic/20 focus:bg-white p-4 pl-12 rounded-2xl outline-none transition-all font-bold text-slate-900 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">
                    Teléfono
                  </label>

                  <div className="relative">
                    <Phone
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                      size={16}
                    />

                    <input
                      name="phone"
                      type="tel"
                      required
                      disabled={isLoading}
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-primary-dynamic/20 focus:bg-white p-4 pl-12 rounded-2xl outline-none transition-all font-bold text-slate-900 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">
                    Correo Electrónico
                  </label>

                  <div className="relative">
                    <Mail
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                      size={16}
                    />

                    <input
                      name="email"
                      type="email"
                      required
                      disabled={isLoading}
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-primary-dynamic/20 focus:bg-white p-4 pl-12 rounded-2xl outline-none transition-all font-bold text-slate-900 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">
                    Contraseña
                  </label>

                  <div className="relative">
                    <Lock
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                      size={16}
                    />

                    <input
                      name="password"
                      type="password"
                      required
                      disabled={isLoading}
                      minLength={6}
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-primary-dynamic/20 focus:bg-white p-4 pl-12 rounded-2xl outline-none transition-all font-bold text-slate-900 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-8 flex flex-col justify-between">
                <div className="space-y-6">
                  <h3 className="text-xl font-black uppercase italic tracking-widest text-slate-900 border-b border-slate-50 pb-4 flex items-center gap-3">
                    <Camera className="text-primary-dynamic" size={20} />{" "}
                    Verificación Identidad
                  </h3>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">
                      Fotografía de Cédula o Pasaporte
                    </label>

                    <div className="relative group mt-2">
                      <input
                        type="file"
                        name="idFile"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileChange}
                        disabled={isLoading}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                      />

                      <div
                        className={`w-full h-72 border-2 border-dashed rounded-[2.5rem] p-8 flex flex-col items-center justify-center transition-all ${imagePreview ? "border-primary-dynamic/50 bg-primary-dynamic/5" : "border-slate-200 bg-slate-50 hover:border-primary-dynamic/50 hover:bg-white"}`}
                      >
                        {imagePreview ? (
                          <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-inner">
                            <Image
                              src={imagePreview}
                              alt="Preview ID"
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <>
                            <div className="bg-slate-900 text-white p-5 rounded-[1.5rem] shadow-lg mb-4 group-hover:scale-110 group-hover:bg-primary-dynamic transition-all">
                              <Camera size={32} />
                            </div>

                            <p className="text-xs font-black text-slate-900 uppercase tracking-tighter text-center">
                              Tomar Foto o Subir Archivo
                            </p>

                            <p className="text-[9px] font-bold text-slate-400 mt-2 text-center leading-relaxed px-4 uppercase tracking-widest">
                              Bordes visibles y legibilidad requerida
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 pt-6">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary-dynamic hover:brightness-110 text-white p-6 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary-dynamic/20 group disabled:opacity-70"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />{" "}
                        Procesando Protocolos...
                      </>
                    ) : (
                      <>
                        Completar Registro KYC{" "}
                        <ArrowRight
                          size={18}
                          className="group-hover:translate-x-1 transition-transform"
                        />
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                      ¿Ya tienes cuenta verificada?{" "}
                      <Link
                        href="/auth/login"
                        className="text-primary-dynamic hover:underline"
                      >
                        Inicia Sesión
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </form>

            <div className="text-center pt-4">
              <Link
                href="/"
                className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
              >
                ← Volver al Centro de Comando
              </Link>
            </div>
          </>
        ) : (
          <div className="max-w-2xl mx-auto bg-white rounded-[4rem] p-12 lg:p-16 text-center shadow-[0_40px_100px_rgba(0,0,0,0.1)] border border-slate-100 animate-in zoom-in-95 duration-700 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

            <div className="relative z-10">
              <div className="flex justify-center mb-10">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>

                  <div className="w-28 h-28 bg-emerald-500 rounded-[2.8rem] flex items-center justify-center text-white shadow-2xl shadow-emerald-200 relative">
                    <ShieldCheck size={56} />
                  </div>

                  <div className="absolute -bottom-2 -right-2 bg-slate-900 text-white p-2.5 rounded-2xl border-4 border-white shadow-lg">
                    <Clock size={20} className="animate-pulse" />
                  </div>
                </div>
              </div>

              <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter leading-none mb-4">
                Protocolo <span className="text-primary-dynamic">Recibido</span>
              </h2>

              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-12 max-w-sm mx-auto leading-relaxed">
                Tus credenciales han sido cifradas y enviadas al Centro de
                Operaciones para su validación manual.
              </p>

              <div className="space-y-4 mb-12 max-w-sm mx-auto">
                <div className="flex items-center gap-4 bg-slate-50 p-5 rounded-3xl border border-slate-100">
                  <CheckCircle2
                    size={24}
                    className="text-emerald-500 shrink-0"
                  />

                  <div className="text-left">
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">
                      Datos Guardados
                    </p>

                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">
                      Cifrado AES-256 Activo
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-slate-50 p-5 rounded-3xl border border-slate-100">
                  <div className="w-6 h-6 rounded-full border-2 border-primary-dynamic border-t-transparent animate-spin shrink-0"></div>

                  <div className="text-left">
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">
                      Auditoría Pendiente
                    </p>

                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">
                      Tiempo est: 24 Horas
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-5 bg-blue-50/50 rounded-3xl border border-blue-100 border-dashed">
                  <p className="text-[11px] font-bold text-blue-600 leading-relaxed italic">
                    "Un oficial de seguridad revisará su identidad. Recibirá una
                    confirmación oficial en su correo al finalizar."
                  </p>
                </div>

                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-primary-dynamic uppercase tracking-[0.4em] transition-all group mt-4"
                >
                  Ir al sitio principal{" "}
                  <ArrowRight
                    size={14}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
