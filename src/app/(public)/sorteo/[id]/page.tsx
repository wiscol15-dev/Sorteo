import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import Image from "next/image";
import { Trophy, Crown, ShieldCheck } from "lucide-react";
import TicketSelector from "./TicketSelector";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SorteoDetallePage({ params }: Props) {
  const { id } = await params;

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
  const isExternal = raffle.type === "EXTERNAL";

  let soldNumbers: number[] = [];
  let totalSold = 0;

  if (isExternal) {
    totalSold = await prisma.ticket.count({
      where: {
        raffleId: id,
        status: { in: ["VALID", "PENDING"] },
      },
    });
  } else {
    const soldTicketsData = await prisma.ticket.findMany({
      where: {
        raffleId: id,
        status: { in: ["VALID", "PENDING"] },
      },
      select: { number: true },
    });
    soldNumbers = soldTicketsData.map((t) => t.number);
    totalSold = soldNumbers.length;
  }

  let winnerTicket = null;
  if (isFinished && raffle.winningNumber) {
    winnerTicket = await prisma.ticket.findFirst({
      where: { raffleId: id, number: raffle.winningNumber, status: "VALID" },
      include: { user: { select: { firstName: true, lastName: true } } },
    });
  }

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
    <main className="min-h-screen bg-[#020617] pt-[100px] lg:pt-32 pb-24 relative font-sans">
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-5 space-y-8">
            <div
              className={`relative w-full aspect-[4/3] lg:aspect-square rounded-[2rem] lg:rounded-[3.5rem] overflow-hidden border ${isFinished ? "border-amber-500/30" : "border-white/10"} shadow-xl bg-slate-900`}
            >
              {raffle.imageUrl && (
                <Image
                  src={raffle.imageUrl}
                  alt={raffle.title}
                  fill
                  className={`object-cover ${isFinished ? "grayscale-[0.3] contrast-125" : ""}`}
                  priority
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent opacity-90" />

              <div className="absolute bottom-6 lg:bottom-10 left-6 lg:left-10 right-6 lg:right-10 space-y-2">
                <div
                  className={`inline-flex ${isFinished ? "bg-amber-500" : "bg-primary-dynamic"} px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.3em] text-black mb-2 shadow-lg`}
                >
                  {isFinished ? "Evento Finalizado" : "Premio Certificado"}
                </div>
                <h2 className="text-3xl lg:text-5xl font-black text-white uppercase italic tracking-tighter leading-tight line-clamp-3">
                  {raffle.title}
                </h2>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 mt-4 lg:mt-0">
            {isFinished ? (
              <div className="bg-slate-900 p-8 lg:p-16 rounded-[2.5rem] lg:rounded-[4rem] border border-amber-500/20 shadow-xl text-center space-y-8 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 opacity-10 text-amber-500 rotate-12 pointer-events-none">
                  <Trophy size={200} />
                </div>
                <div className="space-y-4 relative z-10">
                  <div className="w-20 h-20 bg-amber-500 rounded-[2rem] flex items-center justify-center mx-auto shadow-lg border-4 border-amber-300/20">
                    <Crown size={40} className="text-slate-900" />
                  </div>
                  <h3 className="text-xl lg:text-2xl font-black text-white uppercase tracking-[0.4em]">
                    Resultado Oficial
                  </h3>
                </div>

                <div className="space-y-6 relative z-10">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">
                    Identificador Ganador
                  </p>
                  <div className="inline-block bg-amber-500 p-1 rounded-[2.5rem] shadow-xl">
                    <div className="bg-slate-950 px-10 py-6 lg:px-16 lg:py-8 rounded-[2.3rem] border border-amber-400/20">
                      <span className="text-6xl lg:text-9xl font-black italic tracking-tighter text-amber-500">
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
                  <h4 className="text-3xl lg:text-4xl font-black text-white uppercase italic tracking-tighter">
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
              <div className="space-y-6 lg:space-y-8">
                <div className="space-y-3 pl-4 lg:pl-6 border-l-4 border-primary-dynamic">
                  <h1 className="text-xl lg:text-2xl font-black text-white uppercase italic tracking-widest leading-none">
                    Gestión de{" "}
                    <span className="text-primary-dynamic">Participación</span>
                  </h1>
                  <p className="text-slate-400 text-[10px] lg:text-xs font-medium uppercase tracking-wider opacity-60">
                    {isExternal
                      ? "Sorteo Especial. Completa tu pago externo."
                      : "Selecciona tus números de la suerte en la grilla."}
                  </p>
                </div>

                <TicketSelector
                  raffleId={raffle.id}
                  raffleTitle={raffle.title}
                  raffleDescription={raffle.description}
                  type={raffle.type}
                  maxTickets={raffle.maxTickets}
                  pricePerTicket={Number(raffle.pricePerTicket)}
                  soldNumbers={soldNumbers}
                  totalSold={totalSold}
                  userId={currentUserId}
                  userBalance={currentUserBalance}
                  bankAccounts={bankAccounts}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
