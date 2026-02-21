import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import Image from "next/image";
import TicketSelector from "./TicketSelector";
import { Trophy, Star, Crown, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SorteoDetallePage({ params }: Props) {
  const { id } = await params;

  const raffle = await prisma.raffle.findUnique({
    where: { id },
    include: {
      tickets: {
        include: { user: { select: { firstName: true, lastName: true } } },
      },
    },
  });

  if (!raffle) return notFound();

  const isFinished = raffle.status === "FINISHED";
  const winnerTicket = raffle.tickets.find((t) => t.isWinner);
  const soldNumbers = raffle.tickets.map((t) => t.number);

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;
  let currentUserId = null;
  let currentUserBalance = 0;

  if (sessionToken) {
    const user = await prisma.user.findUnique({
      where: { id: sessionToken },
      select: { id: true, walletBalance: true },
    });
    if (user) {
      currentUserId = user.id;
      currentUserBalance = Number(user.walletBalance);
    }
  }

  return (
    <main className="min-h-screen bg-[#020617] pt-32 pb-24 relative overflow-hidden font-sans">
      <div className="absolute inset-0 pointer-events-none opacity-50">
        <div
          className={`absolute top-0 left-1/4 w-[60rem] h-[60rem] ${isFinished ? "bg-amber-500/10" : "bg-primary-dynamic/10"} rounded-full blur-[150px] animate-pulse`}
        />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-8 animate-in slide-in-from-left-8 duration-1000">
            <div
              className={`relative aspect-square rounded-[3.5rem] overflow-hidden border ${isFinished ? "border-amber-500/30" : "border-white/10"} shadow-2xl group`}
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
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-90" />

              <div className="absolute bottom-10 left-10 right-10 space-y-2">
                <div
                  className={`inline-flex ${isFinished ? "bg-amber-500" : "bg-primary-dynamic"} px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.3em] text-black mb-2 shadow-lg`}
                >
                  {isFinished ? "Evento Finalizado" : "Premio Certificado"}
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-tight">
                  {raffle.title}
                </h2>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 animate-in slide-in-from-right-8 duration-1000">
            {isFinished ? (
              <div className="bg-slate-900/40 backdrop-blur-3xl p-10 md:p-16 rounded-[4rem] border border-amber-500/20 shadow-[0_0_50px_rgba(245,158,11,0.1)] text-center space-y-10 relative overflow-hidden">
                {/* Decoración Heroica */}
                <div className="absolute -top-10 -right-10 opacity-10 text-amber-500 rotate-12">
                  <Trophy size={200} />
                </div>

                <div className="space-y-4 relative z-10">
                  <div className="w-24 h-24 bg-amber-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(245,158,11,0.4)] border-4 border-amber-300/20">
                    <Crown size={48} className="text-slate-900" />
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-[0.4em]">
                    Resultado Oficial
                  </h3>
                </div>

                <div className="space-y-6 relative z-10">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">
                    Identificador Ganador
                  </p>
                  <div className="inline-block bg-gradient-to-b from-amber-400 to-amber-600 p-1 rounded-[2.5rem] shadow-2xl shadow-amber-500/20">
                    <div className="bg-slate-950 px-16 py-8 rounded-[2.3rem] border border-amber-400/20">
                      <span className="text-7xl md:text-9xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-amber-500">
                        #
                        {raffle.winningNumber ||
                          winnerTicket?.number.toString().padStart(2, "0") ||
                          "00"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-10 border-t border-white/5 space-y-2 relative z-10">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                    Adjudicado a:
                  </p>
                  <h4 className="text-4xl font-black text-white uppercase italic tracking-tighter">
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
              <div className="space-y-8">
                <div className="space-y-4 pl-6 border-l-4 border-primary-dynamic">
                  <h1 className="text-2xl font-black text-white uppercase italic tracking-widest leading-none">
                    Gestión de{" "}
                    <span className="text-primary-dynamic">Participación</span>
                  </h1>
                  <p className="text-slate-400 text-xs font-medium uppercase tracking-wider opacity-60">
                    Sorteo en curso. Selecciona tus tickets disponibles.
                  </p>
                </div>

                <TicketSelector
                  raffleId={raffle.id}
                  maxTickets={raffle.maxTickets}
                  pricePerTicket={Number(raffle.pricePerTicket)}
                  soldNumbers={soldNumbers}
                  userId={currentUserId}
                  userBalance={currentUserBalance}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
