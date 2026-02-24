"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Trophy,
  Clock,
  ChevronRight,
  Hash,
  Shuffle,
  MousePointerClick,
  ShieldCheck,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import ExternalPurchaseForm, {
  BankAccount,
} from "@/components/raffles/ExternalPurchaseForm";

// Definimos la estructura exacta que nos envía el servidor
interface RaffleSummary {
  id: string;
  title: string;
  imageUrl: string | null;
  status: string;
  type: string;
  drawDate: Date;
  pricePerTicket: number;
  maxTickets: number;
  winningNumber: number | null;
  soldCount: number;
  tickets: {
    number: number;
    user: { firstName: string | null; lastName: string | null } | null;
  }[];
}

interface Props {
  raffles: RaffleSummary[];
  userId: string | null;
  bankAccounts: Record<string, BankAccount>;
}

export default function HomeRaffleGrid({
  raffles,
  userId,
  bankAccounts,
}: Props) {
  const [selectedExternalRaffle, setSelectedExternalRaffle] =
    useState<RaffleSummary | null>(null);

  const openModal = (raffle: RaffleSummary) => {
    setSelectedExternalRaffle(raffle);
  };

  const closeModal = () => {
    setSelectedExternalRaffle(null);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-stretch">
        {raffles.map((raffle) => {
          const soldPercentage = Math.min(
            100,
            (raffle.soldCount / raffle.maxTickets) * 100,
          );
          const isActive = raffle.status === "ACTIVE";
          const isFinished = raffle.status === "FINISHED";
          const isExternal = raffle.type === "EXTERNAL";
          const winners = raffle.tickets;

          // Componente de Botón Inteligente
          const ActionButton = () => {
            const baseClasses = `w-full p-5 md:p-6 rounded-[2rem] font-black uppercase text-xs tracking-widest flex items-center justify-between transition-all shadow-xl group/btn ${
              isActive
                ? isExternal
                  ? "text-white hover:brightness-110 bg-indigo-600 hover:shadow-indigo-600/20"
                  : "text-white hover:brightness-110 bg-primary-dynamic hover:shadow-primary-dynamic/20"
                : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white"
            }`;

            if (isActive && isExternal) {
              return (
                <button
                  onClick={() => openModal(raffle)}
                  className={baseClasses}
                >
                  Participar Ahora (Flash)
                  <ChevronRight className="transition-transform group-hover/btn:translate-x-1 w-4 h-4 md:w-5 md:h-5" />
                </button>
              );
            }

            return (
              <Link href={`/sorteo/${raffle.id}`} className={baseClasses}>
                {isActive ? "Participar Ahora" : "Ver Detalles"}
                <ChevronRight className="transition-transform group-hover/btn:translate-x-1 w-4 h-4 md:w-5 md:h-5" />
              </Link>
            );
          };

          return (
            <div
              key={raffle.id}
              className="rounded-[2.5rem] md:rounded-[3rem] p-3 md:p-4 shadow-2xl relative flex flex-col h-full transition-all duration-500 border border-slate-100/5 bg-[#0a0f1d] group hover:-translate-y-2"
            >
              <div className="relative w-full h-64 md:h-80 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden mb-4 md:mb-6 flex-shrink-0 flex items-center justify-center bg-slate-900">
                {raffle.imageUrl ? (
                  <Image
                    src={raffle.imageUrl}
                    alt={raffle.title}
                    fill
                    loading="lazy"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-30 text-primary-dynamic">
                    <Trophy className="w-12 h-12 md:w-16 md:h-16" />
                  </div>
                )}

                <div
                  className={`absolute top-4 left-4 md:top-6 md:left-6 backdrop-blur-md text-white px-4 py-1.5 md:px-5 md:py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] shadow-2xl flex items-center gap-2 z-20 ${isExternal ? "bg-indigo-900/80" : "bg-black/60"}`}
                >
                  {isExternal ? (
                    <>
                      <Shuffle className="w-3 h-3 text-indigo-400" /> Sorteo
                      Flash
                    </>
                  ) : (
                    <>
                      <MousePointerClick className="w-3 h-3 text-primary-dynamic" />{" "}
                      Elige tu número
                    </>
                  )}
                </div>

                {isFinished && (
                  <div className="absolute top-4 right-4 md:top-6 md:right-6 bg-amber-500 text-black px-4 py-1.5 md:px-5 md:py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] shadow-2xl flex items-center gap-2 z-20 animate-in zoom-in duration-500">
                    <Trophy className="w-3 h-3 md:w-4 md:h-4" /> Finalizado
                  </div>
                )}

                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/50 z-20">
                    <div
                      className={`h-full transition-all duration-1000 shadow-[0_0_10px_currentColor] ${isExternal ? "bg-indigo-500 text-indigo-500" : "bg-primary-dynamic text-primary-dynamic"}`}
                      style={{ width: `${soldPercentage}%` }}
                    />
                  </div>
                )}
              </div>

              <div className="px-2 md:px-4 pb-2 md:pb-4 flex flex-col flex-grow justify-between space-y-6">
                <div>
                  <h3 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter line-clamp-2 min-h-[3.5rem] md:min-h-[4rem] flex items-center text-white">
                    {raffle.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-2 md:mt-3 text-[10px] font-bold uppercase tracking-widest opacity-70">
                    <Clock className="text-primary-dynamic w-3 h-3 md:w-4 md:h-4" />
                    Cierre: {new Date(raffle.drawDate).toLocaleDateString()}
                  </div>
                </div>

                {isFinished && (
                  <div className="bg-black/30 p-4 md:p-5 rounded-3xl border border-white/5 space-y-3">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                      <Hash className="text-primary-dynamic w-3 h-3 md:w-4 md:h-4" />
                      Resultado
                    </p>
                    {winners.length > 0 ? (
                      winners.map((w, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center text-sm uppercase font-black italic"
                        >
                          <span className="text-white truncate max-w-[60%]">
                            {w.user?.firstName} {w.user?.lastName}
                          </span>
                          <span className="px-3 py-1 rounded-xl border text-xs md:text-sm text-primary-dynamic bg-primary-dynamic/10 border-primary-dynamic/20">
                            #{w.number}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-amber-500 font-black uppercase italic">
                          Desierto
                        </span>
                        <span className="text-white opacity-50 font-mono">
                          #{raffle.winningNumber || "---"}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <ActionButton />
              </div>
            </div>
          );
        })}
      </div>

      {/* --- MODAL DE COMPRA EXTERNA --- */}
      <Modal isOpen={!!selectedExternalRaffle} onClose={closeModal}>
        {selectedExternalRaffle && (
          <ExternalPurchaseForm
            raffleId={selectedExternalRaffle.id}
            raffleTitle={selectedExternalRaffle.title}
            imageUrl={selectedExternalRaffle.imageUrl}
            maxTickets={selectedExternalRaffle.maxTickets}
            pricePerTicket={selectedExternalRaffle.pricePerTicket}
            totalSold={selectedExternalRaffle.soldCount}
            userId={userId}
            bankAccounts={bankAccounts}
            onClose={closeModal}
          />
        )}
      </Modal>
    </>
  );
}
