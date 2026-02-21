import React from "react";
import prisma from "@/lib/prisma";
import { Users } from "lucide-react";
import { cookies } from "next/headers";
import UserListClient from "./UserListClient";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;

  const [officer, usersData] = await Promise.all([
    prisma.user.findUnique({
      where: { id: sessionToken || "" },
      select: { role: true },
    }),
    prisma.user.findMany({
      where: { role: "USER" }, // Restricción de seguridad: Solo clientes
      orderBy: { createdAt: "desc" },
      include: {
        verifiedBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    }),
  ]);

  const serializedUsers = usersData.map((user) => ({
    ...user,
    walletBalance: Number(user.walletBalance),
    createdAt: user.createdAt.toISOString(),
    verifiedAt: user.verifiedAt?.toISOString() || null,
  }));

  const officerRole = officer?.role || "ADMIN";

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-8">
        <div>
          <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter text-shadow-sm">
            Gestión de <span className="text-primary-dynamic">Usuarios</span>
          </h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2 italic">
            Control de Identidad KYC y Acceso al Sistema
          </p>
        </div>

        <div className="bg-slate-900 text-white px-8 py-4 rounded-[2rem] flex items-center gap-4 shadow-2xl border border-white/10 group hover:border-primary-dynamic/50 transition-colors">
          <div className="text-right">
            <p className="text-[9px] font-bold uppercase opacity-50 tracking-widest text-slate-400">
              Base de Datos
            </p>
            <p className="text-xl font-black italic">
              {serializedUsers.length} Miembros
            </p>
          </div>
          <Users
            className="text-primary-dynamic group-hover:scale-110 transition-transform"
            size={24}
          />
        </div>
      </header>

      <UserListClient users={serializedUsers} officerRole={officerRole} />
    </div>
  );
}
