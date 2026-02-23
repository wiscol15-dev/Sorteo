import React from "react";
import prisma from "@/lib/prisma";
import {
  Users,
  Bell,
  AlertCircle,
  ChevronDown,
  Ticket,
  UserCog,
} from "lucide-react";
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
      where: { role: "USER" },
      orderBy: { createdAt: "desc" },
      include: {
        verifiedBy: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        transactions: {
          where: {
            status: "PENDING",
            type: "PURCHASE",
          },
          include: {
            tickets: true,
          },
        },
      },
    }),
  ]);

  // SERIALIZACIÓN PROFUNDA: Reconstruimos el objeto para eliminar cualquier rastro de Prisma (Decimals/Dates)
  const serializedUsers = usersData.map((user) => {
    const sanitizedTransactions = user.transactions.map((tx) => ({
      id: tx.id,
      userId: tx.userId,
      amount: Number(tx.amount), // Convertimos Decimal a Number
      type: tx.type,
      status: tx.status,
      referenceId: tx.referenceId,
      paymentMethod: tx.paymentMethod,
      receiptUrl: tx.receiptUrl,
      buyerName: tx.buyerName,
      buyerDocument: tx.buyerDocument,
      buyerEmail: tx.buyerEmail,
      createdAt: tx.createdAt.toISOString(), // Convertimos Date a String
      tickets: tx.tickets.map((t) => ({
        id: t.id,
        number: t.number,
        price: Number(t.price), // Convertimos Decimal a Number
        isWinner: t.isWinner,
        status: t.status,
        userId: t.userId,
        raffleId: t.raffleId,
        transactionId: t.transactionId,
        createdAt: t.createdAt.toISOString(), // Convertimos Date a String
      })),
    }));

    const pendingTransactionData =
      sanitizedTransactions.length > 0 ? sanitizedTransactions[0] : null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      idNumber: user.idNumber,
      idCardUrl: user.idCardUrl,
      isVerified: user.isVerified,
      status: user.status,
      walletBalance: Number(user.walletBalance), // Convertimos Decimal a Number
      createdAt: user.createdAt.toISOString(), // Convertimos Date a String
      verifiedAt: user.verifiedAt?.toISOString() || null, // Convertimos Date a String
      verifiedBy: user.verifiedBy,
      hasPendingPurchase: !!pendingTransactionData,
      pendingTransactionData,
    };
  });

  const pendingKYC = usersData.filter(
    (u) => u.status === "PENDING_VERIFICATION",
  ).length;
  const pendingPurchases = usersData.filter(
    (u) => u.transactions.length > 0,
  ).length;
  const totalNotifications = pendingKYC + pendingPurchases;

  const officerRole = officer?.role || "ADMIN";

  // SEPARACIÓN PARA ACORDEONES
  const usersWithPendingTickets = serializedUsers.filter(
    (u) => u.hasPendingPurchase,
  );
  const regularUsers = serializedUsers.filter((u) => !u.hasPendingPurchase);

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div className="space-y-4">
          <div>
            <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter text-shadow-sm">
              Gestión de <span className="text-primary-dynamic">Usuarios</span>
            </h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2 italic">
              Control de Identidad KYC y Validación de Pagos
            </p>
          </div>

          {totalNotifications > 0 && (
            <div className="flex flex-wrap gap-3">
              {pendingKYC > 0 && (
                <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-full shadow-sm animate-pulse">
                  <AlertCircle size={14} className="text-amber-600" />
                  <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">
                    {pendingKYC} Verificaciones KYC
                  </span>
                </div>
              )}
              {pendingPurchases > 0 && (
                <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-full shadow-sm animate-pulse">
                  <Bell size={14} className="text-indigo-600" />
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                    {pendingPurchases} Pagos por Validar
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-slate-900 text-white px-8 py-4 rounded-[2rem] flex items-center gap-4 shadow-2xl border border-white/10 shrink-0">
          <div className="text-right">
            <p className="text-[9px] font-bold uppercase opacity-50 tracking-widest text-slate-400">
              Base de Datos
            </p>
            <p className="text-xl font-black italic">
              {serializedUsers.length} Miembros
            </p>
          </div>
          <Users className="text-primary-dynamic" size={24} />
        </div>
      </header>

      <div className="space-y-8">
        {/* SECCIÓN 1: VALIDACIÓN DE TICKETS */}
        <details className="group" open={usersWithPendingTickets.length > 0}>
          <summary className="flex items-center justify-between bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 cursor-pointer list-none hover:shadow-md transition-all select-none">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-100 p-3 rounded-2xl">
                <Ticket className="text-indigo-600" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">
                  Validación de Tickets
                </h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  {usersWithPendingTickets.length} Operaciones pendientes
                </p>
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-full text-slate-400 group-open:rotate-180 transition-transform duration-300">
              <ChevronDown size={20} />
            </div>
          </summary>
          <div className="pt-6">
            {usersWithPendingTickets.length > 0 ? (
              <UserListClient
                users={usersWithPendingTickets}
                officerRole={officerRole}
              />
            ) : (
              <div className="text-center bg-slate-50 border border-dashed border-slate-200 rounded-[2rem] py-12">
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
                  No hay pagos manuales pendientes de validación
                </p>
              </div>
            )}
          </div>
        </details>

        {/* SECCIÓN 2: GESTIÓN DE USUARIOS REGULARES */}
        <details className="group" open={usersWithPendingTickets.length === 0}>
          <summary className="flex items-center justify-between bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 cursor-pointer list-none hover:shadow-md transition-all select-none">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-100 p-3 rounded-2xl">
                <UserCog className="text-emerald-600" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">
                  Gestión de Usuarios
                </h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                  {regularUsers.length} Miembros registrados
                </p>
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-full text-slate-400 group-open:rotate-180 transition-transform duration-300">
              <ChevronDown size={20} />
            </div>
          </summary>
          <div className="pt-6">
            {regularUsers.length > 0 ? (
              <UserListClient users={regularUsers} officerRole={officerRole} />
            ) : (
              <div className="text-center bg-slate-50 border border-dashed border-slate-200 rounded-[2rem] py-12">
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
                  No hay usuarios registrados
                </p>
              </div>
            )}
          </div>
        </details>
      </div>
    </div>
  );
}
