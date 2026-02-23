import React from "react";
import prisma from "@/lib/prisma";
import {
  ShieldAlert,
  Palette,
  UserPlus,
  Fingerprint,
  History,
  Globe,
  Trash2,
  UserX,
  Type,
  LayoutTemplate,
  Monitor,
  CreditCard,
} from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  updateSystemConfig,
  toggleUserStatus,
  deleteUserAccount,
} from "./actions";

import OfficerForm from "./OfficerForm";
import HeaderIconSelector from "./HeaderIconSelector";
import BankConfigClient from "./BankConfigClient";

export const dynamic = "force-dynamic";

function ColorInput({
  label,
  name,
  defaultValue,
  disabled,
}: {
  label: string;
  name: string;
  defaultValue: string;
  disabled: boolean;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">
        {label}
      </p>
      <div className="flex items-center gap-3 bg-black/40 p-3 rounded-xl border border-white/5 group hover:border-primary-dynamic/30 transition-all shadow-inner">
        <input
          type="color"
          name={name}
          defaultValue={defaultValue}
          disabled={disabled}
          className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none outline-none disabled:opacity-30"
        />
        <input
          type="text"
          defaultValue={defaultValue}
          disabled={disabled}
          className="bg-transparent text-xs font-mono text-white w-full outline-none uppercase disabled:opacity-30"
        />
      </div>
    </div>
  );
}

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("session_token")?.value;

  if (!userId) {
    redirect("/auth/login");
  }

  const [user, config, logs, admins] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, firstName: true },
    }),
    prisma.siteConfig.findFirst(),
    prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { firstName: true } } },
    }),
    prisma.user.findMany({
      where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    redirect("/");
  }

  const isSuper = user.role === "SUPER_ADMIN";

  const siteConfig = config || {
    siteName: "Sorteos Premium",
    heroText: "SORTEOS PREMIUM",
    colorPrincipal: "#2563eb",
    colorSecundario: "#0f172a",
    cardBgColor: "#1e293b",
    cardTextColor: "#ffffff",
    headerIconType: "ICON",
    headerIconName: "ShieldCheck",
    headerImageUrl: null,
    bankAccounts: "{}",
  };

  let parsedBanks: Record<string, any> = {};
  try {
    parsedBanks = JSON.parse((siteConfig as any).bankAccounts || "{}");
  } catch (e) {
    parsedBanks = {};
  }

  const handleUpdateConfig = async (formData: FormData) => {
    "use server";
    if (userId) await updateSystemConfig(formData, userId);
  };

  const handleToggleStatus = async (formData: FormData) => {
    "use server";
    const targetId = formData.get("targetId") as string;
    const newStatus = formData.get("newStatus") as "ACTIVE" | "SUSPENDED";
    await toggleUserStatus(targetId, newStatus);
  };

  const handleDeleteAdmin = async (formData: FormData) => {
    "use server";
    const targetId = formData.get("targetId") as string;
    await deleteUserAccount(targetId);
  };

  return (
    <div className="min-h-screen bg-[#020617] p-8 space-y-10 animate-in fade-in duration-1000 pb-24">
      <header className="border-b border-white/5 pb-8 flex justify-between items-end">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-primary font-black uppercase tracking-[0.5em] text-[10px]">
            <ShieldAlert
              size={18}
              className={`animate-pulse ${isSuper ? "text-red-500" : "text-blue-500"}`}
            />
            Nivel de Acceso: {user.role}
          </div>
          <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none">
            Core <span className="text-primary-dynamic">Operations</span>
          </h2>
        </div>
      </header>

      <div
        className={`grid grid-cols-1 ${isSuper ? "lg:grid-cols-12" : "lg:grid-cols-8 lg:justify-center mx-auto max-w-5xl"} gap-10`}
      >
        <div
          className={`${isSuper ? "lg:col-span-5" : "lg:col-span-8"} space-y-8`}
        >
          <section className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-white/5 backdrop-blur-3xl">
            <h3 className="text-xl font-black text-white uppercase italic tracking-widest mb-8 flex items-center gap-3">
              <Palette className="text-primary-dynamic" /> Identidad Visual
            </h3>

            <form action={handleUpdateConfig} className="space-y-6">
              <HeaderIconSelector
                defaultType={siteConfig.headerIconType}
                defaultName={siteConfig.headerIconName}
                defaultImageUrl={siteConfig.headerImageUrl}
                isSuper={isSuper}
              />

              <div className="bg-black/30 p-6 rounded-2xl border border-white/5 space-y-5">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-3">
                  <LayoutTemplate size={14} className="text-primary-dynamic" />{" "}
                  1. Barra de Navegación
                </h4>
                <div className="space-y-3">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">
                    Título / Logo Textual
                  </label>
                  <input
                    name="siteName"
                    defaultValue={siteConfig.siteName}
                    disabled={!isSuper}
                    placeholder="Ej: Sorteos Premium"
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-primary-dynamic disabled:opacity-30 transition-all"
                  />
                </div>
                <ColorInput
                  label="Color del Logo y Botones (Acento)"
                  name="primaryColor"
                  defaultValue={siteConfig.colorPrincipal}
                  disabled={!isSuper}
                />
              </div>

              <div className="bg-black/30 p-6 rounded-2xl border border-white/5 space-y-5">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-3">
                  <Type size={14} className="text-primary-dynamic" /> 2. Mensaje
                  de Bienvenida
                </h4>
                <div className="space-y-3">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">
                    Párrafo Principal (Bajo el Navbar)
                  </label>
                  <textarea
                    name="heroText"
                    defaultValue={siteConfig.heroText}
                    disabled={!isSuper}
                    placeholder="Escribe el título grande de tu página..."
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-primary-dynamic h-24 resize-none disabled:opacity-30 transition-all"
                  />
                </div>
              </div>

              <div className="bg-black/30 p-6 rounded-2xl border border-white/5 space-y-5">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-3">
                  <Monitor size={14} className="text-primary-dynamic" /> 3.
                  Entorno Global
                </h4>
                <ColorInput
                  label="Color de Fondo Web"
                  name="bgColor"
                  defaultValue={siteConfig.colorSecundario}
                  disabled={!isSuper}
                />
              </div>

              <div className="bg-black/30 p-6 rounded-2xl border border-white/5 space-y-5">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-3">
                  <CreditCard size={14} className="text-primary-dynamic" /> 4.
                  Tarjetas de Sorteos
                </h4>
                <ColorInput
                  label="Fondo de la Tarjeta"
                  name="cardBgColor"
                  defaultValue={siteConfig.cardBgColor}
                  disabled={!isSuper}
                />
                <ColorInput
                  label="Color del Texto"
                  name="cardTextColor"
                  defaultValue={siteConfig.cardTextColor}
                  disabled={!isSuper}
                />
              </div>

              {/* INTEGRACIÓN DEL COMPONENTE CLIENTE */}
              <BankConfigClient initialData={parsedBanks} isSuper={isSuper} />

              {isSuper && (
                <button
                  type="submit"
                  className="w-full bg-primary-dynamic hover:brightness-125 text-white p-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] shadow-xl shadow-primary-dynamic/20 transition-all mt-4"
                >
                  Guardar Toda la Configuración
                </button>
              )}
            </form>
          </section>

          <section className="bg-slate-900/40 p-6 rounded-[2rem] border border-white/5 max-h-[250px] overflow-hidden flex flex-col">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <History size={14} /> Historial de Cambios Recientes
            </h3>
            <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar flex-grow">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-black/20 rounded-xl border border-white/5 flex justify-between items-center text-[9px]"
                >
                  <span className="text-slate-300 font-bold uppercase">
                    {log.user.firstName}: {log.action}
                  </span>
                  <span className="text-slate-600 font-mono italic">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {isSuper && (
          <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
            <section className="bg-slate-900/40 p-10 rounded-[3rem] border border-white/5 backdrop-blur-3xl">
              <h3 className="text-xl font-black text-white uppercase italic tracking-widest mb-10 flex items-center gap-3">
                <UserPlus className="text-primary-dynamic" /> Inteligencia y
                Personal
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <OfficerForm
                  isSuper={false}
                  canEdit={isSuper}
                  adminId={userId}
                />
                <OfficerForm
                  isSuper={true}
                  canEdit={isSuper}
                  adminId={userId}
                />
              </div>

              <div className="border-t border-white/5 pt-10">
                <h4 className="text-sm font-black text-white uppercase tracking-widest mb-6 px-2 flex items-center gap-2">
                  <Globe size={18} className="text-primary-dynamic" /> Oficiales
                  Registrados
                </h4>

                <div className="space-y-4">
                  {admins.map((admin) => (
                    <div
                      key={admin.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-black/40 rounded-[2rem] border border-white/5 group hover:border-white/10 transition-all gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-xl ${admin.role === "SUPER_ADMIN" ? "bg-primary-dynamic text-white" : "bg-blue-600/20 text-blue-400"}`}
                        >
                          {admin.firstName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-black text-white uppercase tracking-tighter flex items-center gap-2">
                            {admin.firstName} {admin.lastName}
                            {admin.role === "SUPER_ADMIN" && (
                              <Fingerprint
                                size={12}
                                className="text-primary-dynamic"
                              />
                            )}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold mt-1">
                            {admin.email}{" "}
                            <span className="mx-2 opacity-30">|</span> Estado:{" "}
                            <span
                              className={
                                admin.status === "ACTIVE"
                                  ? "text-emerald-500"
                                  : "text-amber-500"
                              }
                            >
                              {admin.status}
                            </span>
                          </p>
                        </div>
                      </div>

                      {admin.id !== userId && (
                        <div className="flex items-center gap-2 bg-white/5 p-2 rounded-2xl">
                          <form action={handleToggleStatus}>
                            <input
                              type="hidden"
                              name="targetId"
                              value={admin.id}
                            />
                            <input
                              type="hidden"
                              name="newStatus"
                              value={
                                admin.status === "ACTIVE"
                                  ? "SUSPENDED"
                                  : "ACTIVE"
                              }
                            />
                            <button
                              type="submit"
                              title={
                                admin.status === "ACTIVE"
                                  ? "Suspender Acceso"
                                  : "Restaurar Acceso"
                              }
                              className="p-3 bg-black/50 hover:bg-amber-500 hover:text-white text-slate-400 rounded-xl transition-all shadow-sm"
                            >
                              <UserX size={16} />
                            </button>
                          </form>

                          <form action={handleDeleteAdmin}>
                            <input
                              type="hidden"
                              name="targetId"
                              value={admin.id}
                            />
                            <button
                              type="submit"
                              title="Eliminar Oficial (Irreversible)"
                              className="p-3 bg-black/50 hover:bg-red-500 hover:text-white text-slate-400 rounded-xl transition-all shadow-sm"
                            >
                              <Trash2 size={16} />
                            </button>
                          </form>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
