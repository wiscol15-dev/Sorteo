import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import TicketSelector from "./TicketSelector";

export default async function TicketDataWrapper({ raffle, bankAccounts }: any) {
  // LÓGICA DE DATOS: Esto se ejecuta en el servidor MIENTRAS el cliente ve el loader.
  const isExternal = raffle.type === "EXTERNAL";
  let soldNumbers: number[] = [];
  let totalSold = 0;

  if (isExternal) {
    // Si es externo, solo contamos (Ultrarrápido)
    totalSold = await prisma.ticket.count({
      where: {
        raffleId: raffle.id,
        status: { in: ["VALID", "PENDING"] },
      },
    });
  } else {
    // Si es interno, traemos los números para pintar la grilla
    const soldTicketsData = await prisma.ticket.findMany({
      where: {
        raffleId: raffle.id,
        status: { in: ["VALID", "PENDING"] },
      },
      select: { number: true },
    });
    soldNumbers = soldTicketsData.map((t) => t.number);
    totalSold = soldNumbers.length;
  }

  // Validación de Usuario
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
    <div className="space-y-6 md:space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="space-y-3 pl-4 md:pl-6 border-l-4 border-primary-dynamic">
        <h1 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-widest leading-none">
          Gestión de <span className="text-primary-dynamic">Participación</span>
        </h1>
        <p className="text-slate-400 text-[10px] md:text-xs font-medium uppercase tracking-wider opacity-60">
          {isExternal
            ? "Sorteo Especial. Completa tu pago externo para adquirir tickets."
            : "Sorteo en curso. Selecciona tus números de la suerte en la grilla."}
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
  );
}
