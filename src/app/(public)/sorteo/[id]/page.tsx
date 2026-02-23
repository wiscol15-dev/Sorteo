import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Trophy, Crown, ShieldCheck } from "lucide-react";
import { Suspense } from "react";
import TicketDataWrapper from "./TicketDataWrapper";
import { Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SorteoDetallePage({ params }: Props) {
  const { id } = await params;

  // 1. CARGA SÚPER RÁPIDA: Solo traemos la información visual del sorteo.
  // Esto hace que el celular pinte la pantalla instantáneamente sin lag.
  const [raffle, config] = await Promise.all([
    prisma.raffle.findUnique({
      where: { id },
    }),
    prisma.siteConfig.findFirst(),
  ]);

  if (!raffle) return notFound();

  let bankAccounts = {};
  try {
    bankAccounts = JSON.parse(config?.bankAccounts || "{}");
  } catch (e) {
    bankAccounts = {};
  }

  const isFinished = raffle.status === "FINISHED";

  // Buscar ganador solo si ya terminó
  let winnerTicket = null;
  if (isFinished && raffle.winningNumber) {
    winnerTicket = await prisma.ticket.findFirst({
      where: { raffleId: id, number: raffle.winningNumber, status: "VALID" },
      include: { user: { select: { firstName: true, lastName: true } } },
    });
  }

  return (
    <main className="min-h-screen bg-[#020617] pt-[120px] lg:pt-32 pb-24 relative overflow-hidden font-sans">
      {/* Fondos */}
      <div className="absolute inset-0 pointer-events-none opacity-50">
        <div
          className={`absolute top-0 left-1/4 w-[60rem] h-[60rem] ${isFinished ? "bg-amber-500/10" : "bg-primary-dynamic/10"} rounded-full blur-[150px] animate-pulse`}
        />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* COLUMNA IZQUIERDA: VISUAL (Carga Inmediata) */}
          <div className="lg:col-span-5 space-y-8 animate-in slide-in-from-left-8 duration-700">
            {/* FIX MÓVIL: aspect-[4/3] en celular, aspect-square en PC */}
            <div
              className={`relative w-full aspect-[4/3] lg:aspect-square rounded-[2rem] md:rounded-[3.5rem] overflow-hidden border ${isFinished ? "border-amber-500/30" : "border-white/10"} shadow-2xl group`}
            >
              {raffle.imageUrl && (
                <Image
                  src={raffle.imageUrl}
                  alt={raffle.title}
                  fill
                  className={`object-cover transition-transform duration-[3s] group-hover:scale-110 ${isFinished ? "grayscale-[0.3] contrast-125" : ""}`}
                  priority
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent opacity-90" />

              <div className="absolute bottom-6 md:bottom-10 left-6 md:left-10 right-6 md:right-10 space-y-2">
                <div
                  className={`inline-flex ${isFinished ? "bg-amber-500" : "bg-primary-dynamic"} px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.3em] text-black mb-2 shadow-lg`}
                >
                  {isFinished ? "Evento Finalizado" : "Premio Certificado"}
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white uppercase italic tracking-tighter leading-tight line-clamp-3">
                  {raffle.title}
                </h2>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: LÓGICA DE COMPRA */}
          <div className="lg:col-span-7 animate-in slide-in-from-right-8 duration-700 mt-4 lg:mt-0">
            {isFinished ? (
              <div className="bg-slate-900/40 backdrop-blur-3xl p-8 md:p-16 rounded-[2.5rem] md:rounded-[4rem] border border-amber-500/20 shadow-[0_0_50px_rgba(245,158,11,0.1)] text-center space-y-8 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 opacity-10 text-amber-500 rotate-12 pointer-events-none">
                  <Trophy size={200} />
                </div>
                <div className="space-y-4 relative z-10">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-amber-500 rounded-[2rem] flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(245,158,11,0.4)] border-4 border-amber-300/20">
                    <Crown size={40} className="text-slate-900" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-[0.4em]">
                    Resultado Oficial
                  </h3>
                </div>

                <div className="space-y-6 relative z-10">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">
                    Identificador Ganador
                  </p>
                  <div className="inline-block bg-gradient-to-b from-amber-400 to-amber-600 p-1 rounded-[2.5rem] shadow-2xl shadow-amber-500/20">
                    <div className="bg-slate-950 px-12 py-6 md:px-16 md:py-8 rounded-[2.3rem] border border-amber-400/20">
                      <span className="text-6xl md:text-9xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-amber-500">
                        #
                        {raffle.winningNumber ||
                          winnerTicket?.number.toString().padStart(2, "0") ||
                          "00"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/5 space-y-2 relative z-10">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                    Adjudicado a:
                  </p>
                  <h4 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter">
                    {winnerTicket?.user?.firstName || "Sorteo"}{" "}
                    <span className="text-amber-500">
                      {winnerTicket?.user?.lastName || "Desierto"}
                    </span>
                  </h4>
                  <div className="flex items-center justify-center gap-2 text-emerald-500 mt-4">
                    <ShieldCheck size={16} />
                    <span className="text-[9px] font-black uppercase tracking-widest">
                      Validación Biométrica Confirmada
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              // 2. SUSPENSE MÁGICO: Muestra un loader elegante mientras el servidor consulta la BD en segundo plano
              <Suspense
                fallback={
                  <div className="flex flex-col items-center justify-center p-16 bg-slate-900/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 shadow-2xl w-full h-[400px]">
                    <Loader2
                      size={48}
                      className="animate-spin text-primary-dynamic mb-6"
                    />
                    <p className="text-xs font-black text-white uppercase tracking-[0.3em] animate-pulse text-center">
                      Cargando Entorno Seguro...
                    </p>
                  </div>
                }
              >
                {/* 3. COMPONENTE PUENTE: Carga los tickets y la billetera de forma diferida */}
                <TicketDataWrapper
                  raffle={raffle}
                  bankAccounts={bankAccounts}
                />
              </Suspense>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
