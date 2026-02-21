import prisma from "@/lib/prisma";

import { cookies } from "next/headers";

import { redirect } from "next/navigation";

import Image from "next/image";

import Link from "next/link";

import {
  Ticket,
  Trophy,
  Calendar,
  Sparkles,
  Medal,
  ChevronRight,
} from "lucide-react";

export const metadata = {
  title: "Mis Boletos | Sorteos Premium",

  description: "Historial de participaciones y boletos ganadores.",
};

export const dynamic = "force-dynamic";

export default async function MisBoletosPage() {
  const cookieStore = await cookies();

  const sessionToken = cookieStore.get("session_token")?.value;

  if (!sessionToken) {
    redirect("/auth/login");
  }

  const userWithTickets = await prisma.user.findUnique({
    where: { id: sessionToken },

    include: {
      tickets: {
        include: { raffle: true },

        orderBy: [{ isWinner: "desc" }, { number: "asc" }],
      },
    },
  });

  if (!userWithTickets) {
    redirect("/auth/login");
  }

  const groupedTickets = userWithTickets.tickets.reduce(
    (acc, ticket) => {
      if (!acc[ticket.raffleId]) {
        acc[ticket.raffleId] = {
          raffle: ticket.raffle,

          tickets: [],

          hasWinner: false,
        };
      }

      acc[ticket.raffleId].tickets.push(ticket);

      if (ticket.isWinner) acc[ticket.raffleId].hasWinner = true;

      return acc;
    },

    {} as Record<string, any>,
  );

  const sortedGroups = Object.values(groupedTickets).sort((a, b) => {
    if (a.hasWinner && !b.hasWinner) return -1;

    if (!a.hasWinner && b.hasWinner) return 1;

    if (a.raffle.status === "ACTIVE" && b.raffle.status !== "ACTIVE") return -1;

    if (a.raffle.status !== "ACTIVE" && b.raffle.status === "ACTIVE") return 1;

    return (
      new Date(b.raffle.drawDate).getTime() -
      new Date(a.raffle.drawDate).getTime()
    );
  });

  return (
    <main className="min-h-screen bg-[#f8fafc] pt-32 pb-24 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-screen-2xl h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-primary/5 rounded-full blur-[100px] mix-blend-multiply" />

        <div className="absolute bottom-[-10%] left-[-5%] w-[40rem] h-[40rem] bg-yellow-400/5 rounded-full blur-[100px] mix-blend-multiply" />
      </div>

      <div className="max-w-5xl mx-auto px-6 lg:px-8 relative z-10 space-y-12">
        <header className="text-center space-y-4 animate-in fade-in slide-in-from-top-5 duration-1000">
          <div className="inline-flex items-center justify-center p-4 rounded-full bg-white border border-slate-100 shadow-sm mb-2">
            <Ticket className="text-primary" size={32} />
          </div>

          <h1 className="text-5xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter italic">
            Mis <span className="text-primary">Boletos</span>
          </h1>

          <p className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">
            Bóveda personal y resultados oficiales
          </p>
        </header>

        {sortedGroups.length === 0 ? (
          <div className="bg-white p-20 rounded-[3rem] text-center shadow-sm border border-slate-100 animate-in fade-in duration-1000">
            <Trophy className="w-20 h-20 text-slate-200 mx-auto mb-6" />

            <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">
              Bóveda Vacía
            </h3>

            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 mb-8">
              Aún no has participado en nuestros eventos.
            </p>

            <Link
              href="/sorteos"
              className="inline-flex bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all shadow-xl hover:-translate-y-1"
            >
              Ver Cartelera Oficial
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedGroups.map((group, index) => {
              const { raffle, tickets, hasWinner } = group;

              const isActive = raffle.status === "ACTIVE";

              return (
                <div
                  key={raffle.id}
                  className={`bg-white rounded-[3rem] overflow-hidden transition-all duration-700 animate-in slide-in-from-bottom-5 border ${
                    hasWinner
                      ? "shadow-[0_20px_60px_-15px_rgba(234,179,8,0.2)] border-yellow-400/50 relative"
                      : "shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)] border-slate-100"
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {hasWinner && (
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300 animate-pulse" />
                  )}

                  <div
                    className={`p-8 md:p-10 ${hasWinner ? "bg-gradient-to-br from-yellow-50 via-white to-amber-50/30" : ""}`}
                  >
                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center border-b border-slate-100/50 pb-8 mb-8">
                      <div
                        className={`relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 shadow-inner ${hasWinner ? "border-4 border-yellow-400" : "border-2 border-slate-100"}`}
                      >
                        {raffle.imageUrl ? (
                          <Image
                            src={raffle.imageUrl}
                            alt={raffle.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                            <Trophy size={32} className="text-primary/30" />
                          </div>
                        )}
                      </div>

                      <div className="flex-grow space-y-2">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          {hasWinner && (
                            <span className="bg-yellow-500 text-slate-900 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.3em] shadow-md flex items-center gap-1 animate-pulse">
                              <Sparkles size={10} /> ¡Ganador Oficial!
                            </span>
                          )}

                          {!hasWinner && isActive && (
                            <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.3em] shadow-sm">
                              En Curso
                            </span>
                          )}

                          {!hasWinner && !isActive && (
                            <span className="bg-slate-200 text-slate-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.3em]">
                              Finalizado
                            </span>
                          )}
                        </div>

                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase italic tracking-tighter line-clamp-1">
                          {raffle.title}
                        </h2>

                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                          <Calendar
                            size={14}
                            className={
                              isActive ? "text-primary" : "text-slate-400"
                            }
                          />

                          <span>
                            {new Date(raffle.drawDate).toLocaleDateString(
                              "es-ES",

                              {
                                day: "2-digit",

                                month: "long",

                                year: "numeric",

                                hour: "2-digit",

                                minute: "2-digit",
                              },
                            )}
                          </span>
                        </div>
                      </div>

                      <Link
                        href={`/sorteo/${raffle.id}`}
                        className={`hover:bg-slate-100 p-4 rounded-2xl transition-colors shrink-0 ${hasWinner ? "bg-yellow-100 text-yellow-600" : "bg-slate-50 text-slate-600"}`}
                        title="Ir al Sorteo"
                      >
                        <ChevronRight size={24} />
                      </Link>
                    </div>

                    <div className="space-y-4">
                      <p
                        className={`text-[10px] font-black uppercase tracking-[0.2em] ${hasWinner ? "text-yellow-600" : "text-slate-400"}`}
                      >
                        Boletos Adquiridos ({tickets.length})
                      </p>

                      <div className="flex flex-wrap gap-3">
                        {tickets.map((ticket: any) => {
                          if (ticket.isWinner) {
                            return (
                              <div key={ticket.id} className="relative group">
                                <div className="absolute inset-0 bg-yellow-400 rounded-2xl blur-md opacity-50 group-hover:opacity-100 transition-opacity animate-pulse" />

                                <div className="relative bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 text-slate-900 px-6 py-3 rounded-2xl font-black text-xl md:text-2xl shadow-lg border border-yellow-200 flex items-center gap-2 transform transition-transform hover:scale-110">
                                  <Medal
                                    size={20}
                                    className="text-yellow-100"
                                  />
                                  #{ticket.number.toString().padStart(4, "0")}
                                </div>
                              </div>
                            );
                          }

                          if (isActive) {
                            return (
                              <div
                                key={ticket.id}
                                className="bg-slate-900 text-white px-5 py-3 rounded-2xl font-black text-lg md:text-xl shadow-md border border-slate-800 transition-transform hover:-translate-y-1"
                              >
                                #{ticket.number.toString().padStart(4, "0")}
                              </div>
                            );
                          }

                          return (
                            <div
                              key={ticket.id}
                              className="bg-slate-100 text-slate-400 px-5 py-3 rounded-2xl font-black text-lg md:text-xl border border-slate-200 grayscale opacity-70"
                            >
                              #{ticket.number.toString().padStart(4, "0")}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
