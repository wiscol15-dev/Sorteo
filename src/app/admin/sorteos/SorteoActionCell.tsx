"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { executeRaffleDraw } from "./actions";
import { Trophy, Clock, PlayCircle, Loader2 } from "lucide-react";

interface SorteoActionCellProps {
  raffleId: string;
  drawDateStr: string;
  initialStatus: string;
}

export default function SorteoActionCell({
  raffleId,
  drawDateStr,
  initialStatus,
}: SorteoActionCellProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [currentStatus, setCurrentStatus] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(false);

  const isCompleted =
    currentStatus === "FINISHED" || currentStatus === "COMPLETED";

  useEffect(() => {
    if (isCompleted) return;
    const targetDate = new Date(drawDateStr).getTime();

    const checkTime = () => {
      const now = Date.now();
      const diff = targetDate - now;

      if (diff <= 0) {
        setIsTimeUp(true);
        setTimeLeft("00:00:00");
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        if (hours < 24) {
          setTimeLeft(
            `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
          );
        } else {
          const days = Math.floor(hours / 24);
          setTimeLeft(`${days} Días, ${hours % 24}h`);
        }
      }
    };

    checkTime();
    const interval = setInterval(checkTime, 1000);
    return () => clearInterval(interval);
  }, [drawDateStr, isCompleted]);

  const handleExecute = async () => {
    setIsLoading(true);
    const result = await executeRaffleDraw(raffleId);

    if (result.success) {
      setCurrentStatus("FINISHED");
      startTransition(() => {
        router.refresh();
      });
    } else {
      alert(result.error || "Fallo crítico en el motor de sorteo.");
    }
    setIsLoading(false);
  };

  if (isCompleted) {
    return (
      <div className="inline-flex bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest items-center gap-2 shadow-md">
        <Trophy size={14} className="text-primary" /> Finalizado
      </div>
    );
  }

  if (isTimeUp) {
    return (
      <button
        onClick={handleExecute}
        disabled={isLoading || isPending}
        className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-emerald-200 hover:-translate-y-0.5 flex items-center gap-2 animate-pulse mx-auto disabled:opacity-50 disabled:animate-none"
      >
        {isLoading || isPending ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <PlayCircle size={14} />
        )}
        {isLoading || isPending ? "Procesando..." : "Ejecutar Sorteo"}
      </button>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="inline-flex bg-slate-50 text-slate-400 border border-slate-200 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest items-center gap-2">
        <Clock size={14} /> En Espera
      </div>
      <span className="text-[9px] font-black text-primary tracking-widest font-mono bg-primary/10 px-2 py-0.5 rounded-md">
        {timeLeft}
      </span>
    </div>
  );
}
