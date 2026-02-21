import { cookies } from "next/headers";

import { redirect } from "next/navigation";

import { Metadata } from "next";

import prisma from "@/lib/prisma";

import WalletClient from "./WalletClient";

export const metadata: Metadata = {
  title: "Wallet | Sorteos Premium",

  description: "Infraestructura de activos digitales de alta fidelidad.",
};

export default async function BilleteraPage() {
  const cookieStore = await cookies();

  const sessionToken = cookieStore.get("session_token")?.value;

  if (!sessionToken) redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: { id: sessionToken },

    include: {
      transactions: {
        orderBy: { createdAt: "desc" },

        take: 30,
      },
    },
  });

  if (!user) redirect("/auth/login");

  const serializedUser = {
    id: user.id,

    firstName: user.firstName,

    lastName: user.lastName,

    walletBalance: Number(user.walletBalance),
  };

  const serializedTransactions = user.transactions.map((t) => ({
    id: t.id,

    amount: Number(t.amount),

    type: t.type,

    status: t.status,

    referenceId: t.referenceId,

    paymentMethod: t.paymentMethod,

    createdAt: t.createdAt.toISOString(),
  }));

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 relative overflow-hidden pt-32 pb-24">
      {/* CAPA ATMOSFÉRICA BINANCE-STYLE */}

      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/4 w-[60rem] h-[60rem] bg-amber-500/10 rounded-full blur-[150px] animate-pulse"
          style={{ animationDuration: "8s" }}
        />

        <div
          className="absolute bottom-0 right-1/4 w-[50rem] h-[50rem] bg-primary-dynamic/5 rounded-full blur-[120px] animate-pulse"
          style={{ animationDuration: "12s" }}
        />

        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <header className="flex flex-col items-center justify-center text-center space-y-8 mb-16 animate-in fade-in slide-in-from-top-10 duration-1000">
          <div className="inline-flex items-center justify-center p-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 backdrop-blur-xl">
            <span className="px-5 py-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[10px] font-black uppercase tracking-[0.4em] shadow-[0_0_30px_rgba(243,186,47,0.3)]">
              SISTEMA DE ACTIVOS DIGITALES
            </span>
          </div>

          <h1 className="text-7xl md:text-9xl font-black uppercase tracking-tighter italic text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
            WALLET
          </h1>
        </header>

        <div className="relative rounded-[3.5rem] border border-white/10 bg-[#0f172a]/40 backdrop-blur-3xl p-1 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden group">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50 blur-[1px]" />

          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-30" />

          <div className="relative z-20">
            <WalletClient
              user={serializedUser}
              transactions={serializedTransactions}
            />
          </div>
        </div>

        <footer className="mt-16 text-center">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] flex items-center justify-center gap-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            SECURE ACCESS ENCRYPTED
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </p>
        </footer>
      </div>
    </main>
  );
}
