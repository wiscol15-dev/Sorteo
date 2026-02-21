"use client";

import { useState } from "react";
import { buyTickets } from "@/app/admin/sorteos/actions";
import { Loader2, CheckCircle2 } from "lucide-react";

interface TicketGridProps {
  raffleId: string;
  maxTickets: number;
  occupiedNumbers: number[];
  pricePerTicket: number;
}

export default function TicketGrid({
  raffleId,
  maxTickets,
  occupiedNumbers,
  pricePerTicket,
}: TicketGridProps) {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  // El ID del usuario debe venir de la sesión en el futuro [cite: 2026-02-13]
  const userId = "tu_user_id_real_aqui";

  const toggleNumber = (num: number) => {
    if (occupiedNumbers.includes(num)) return;
    setSelectedNumbers((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num],
    );
  };

  const handlePurchase = async () => {
    if (selectedNumbers.length === 0) return;
    setLoading(true);
    try {
      const res = await buyTickets(raffleId, userId, selectedNumbers);
      if (res.success) {
        alert("¡Compra exitosa! Revisa tu correo.");
        window.location.reload();
      } else {
        alert(res.error || "Error en la compra");
      }
    } catch (error) {
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Grid de Números con Optimización de Renderizado [cite: 2026-02-13] */}
      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-3">
        {Array.from({ length: maxTickets }, (_, i) => i + 1).map((num) => {
          const isOccupied = occupiedNumbers.includes(num);
          const isSelected = selectedNumbers.includes(num);

          return (
            <button
              key={num}
              onClick={() => toggleNumber(num)}
              disabled={isOccupied || loading}
              className={`
                h-14 rounded-2xl font-black text-sm transition-all duration-300
                ${
                  isOccupied
                    ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                    : isSelected
                      ? "bg-primary text-white shadow-lg shadow-primary/30 scale-110 z-10"
                      : "bg-white border-2 border-slate-100 text-slate-600 hover:border-primary hover:text-primary"
                }
              `}
            >
              {num.toString().padStart(2, "0")}
            </button>
          );
        })}
      </div>

      {/* Panel de Checkout Flotante/Fijo [cite: 2026-02-13] */}
      {selectedNumbers.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl border border-white/10 animate-in slide-in-from-bottom-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-1 text-center md:text-left">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                Resumen de Selección
              </p>
              <h4 className="text-2xl font-black italic">
                {selectedNumbers.length}{" "}
                {selectedNumbers.length === 1 ? "Boleto" : "Boletos"}
              </h4>
              <p className="text-slate-400 font-bold">
                Total: ${(selectedNumbers.length * pricePerTicket).toFixed(2)}
              </p>
            </div>

            <button
              onClick={handlePurchase}
              disabled={loading}
              className="w-full md:w-auto bg-primary hover:bg-blue-600 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <CheckCircle2 size={18} />
              )}
              Confirmar Reserva
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
