"use client";

import { Ticket, Wallet, Shuffle, ShieldAlert } from "lucide-react";
import ExternalSelector from "./ExternalSelector";
import InternalSelector from "./InternalSelector";

interface BankAccount {
  titular?: string;
  doc?: string;
  account?: string;
  phone?: string;
  type?: string;
}

export interface SelectorProps {
  raffleId: string;
  raffleTitle: string;
  raffleDescription: string;
  type?: "INTERNAL" | "EXTERNAL";
  maxTickets: number;
  pricePerTicket: number;
  soldNumbers: number[];
  totalSold: number;
  userId: string | null;
  userBalance: number;
  bankAccounts: Record<string, BankAccount>;
}

export default function TicketSelector(props: SelectorProps) {
  const isExternal = props.type === "EXTERNAL";
  const availableCount = props.maxTickets - props.totalSold;
  const isSoldOut = availableCount <= 0;

  return (
    <div className="bg-slate-900/40 backdrop-blur-3xl p-8 md:p-12 rounded-[3.5rem] border border-white/5 shadow-2xl space-y-10 relative overflow-hidden">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 w-full md:w-auto overflow-hidden">
          <div className="bg-primary-dynamic/20 p-3 rounded-2xl border border-primary-dynamic/30 shrink-0">
            {isExternal ? (
              <Shuffle className="text-primary-dynamic" size={28} />
            ) : (
              <Ticket className="text-primary-dynamic" size={28} />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none truncate">
              {isExternal ? (
                <span className="text-primary-dynamic">
                  {props.raffleTitle}
                </span>
              ) : (
                <>
                  Selector de{" "}
                  <span className="text-primary-dynamic">Tickets</span>
                </>
              )}
            </h3>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1 line-clamp-2">
              {isExternal
                ? props.raffleDescription
                : "Escoge tu combinación ganadora"}
            </p>
          </div>
        </div>

        {!isExternal && (
          <div className="bg-black/40 px-6 py-3 rounded-2xl border border-white/5 flex items-center gap-4 shadow-inner shrink-0">
            <Wallet className="text-slate-500" size={20} />
            <div className="text-right">
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
                Saldo Disponible
              </p>
              <p className="text-lg font-black text-white tracking-tighter">
                ${props.userBalance.toFixed(2)}
              </p>
            </div>
          </div>
        )}
      </div>

      {isSoldOut ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-[2.5rem] p-10 md:p-14 text-center space-y-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-10" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6 border border-red-500/30">
              <ShieldAlert size={40} className="text-red-500" />
            </div>
            <h4 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter italic leading-none mb-3">
              Boletería Totalmente <span className="text-red-500">Agotada</span>
            </h4>
            <p className="text-xs md:text-sm font-black text-slate-400 uppercase tracking-widest leading-relaxed max-w-lg mx-auto">
              El inventario de tickets para este evento ha sido asignado en su
              totalidad. Te invitamos a mantenerte atento a nuestras próximas
              ediciones.
            </p>
          </div>
        </div>
      ) : isExternal ? (
        <ExternalSelector {...props} />
      ) : (
        <InternalSelector {...props} />
      )}
    </div>
  );
}
