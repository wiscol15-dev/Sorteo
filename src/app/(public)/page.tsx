import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { ShieldCheck, Trophy } from "lucide-react";
import { iconMap } from "@/app/admin/configuracion/HeaderIconSelector";
import Image from "next/image";
import HomeRaffleGrid from "@/components/home/HomeRaffleGrid";

export const dynamic = "force-dynamic";

export default async function Home() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;

  // 1. OBTENCIÓN PARALELA DE DATOS (Máxima Velocidad SSR)
  const [rafflesData, config, user] = await Promise.all([
    prisma.raffle.findMany({
      orderBy: [{ status: "asc" }, { drawDate: "desc" }],
      select: {
        id: true,
        title: true,
        imageUrl: true,
        status: true,
        type: true,
        drawDate: true,
        pricePerTicket: true,
        maxTickets: true,
        winningNumber: true,
        _count: {
          select: {
            tickets: { where: { status: { in: ["VALID", "PENDING"] } } },
          },
        },
        tickets: {
          where: { isWinner: true },
          select: {
            number: true,
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    }),
    prisma.siteConfig.findFirst(),
    sessionToken
      ? prisma.user.findUnique({
          where: { id: sessionToken },
          select: { id: true },
        })
      : Promise.resolve(null),
  ]);

  // 2. PROCESAMIENTO DE CONFIGURACIÓN
  const siteName = config?.siteName || "Sorteos Premium";
  const heroText =
    config?.heroText || "PARTICIPA EN LOS SORTEOS MÁS EXCLUSIVOS DEL MUNDO";
  const iconType = config?.headerIconType || "ICON";
  const imageUrl = config?.headerImageUrl;
  const IconComponent =
    iconMap[config?.headerIconName || "ShieldCheck"] || ShieldCheck;

  let bankAccounts = {};
  try {
    bankAccounts = JSON.parse(config?.bankAccounts || "{}");
  } catch (e) {
    // Si falla el parseo, se envía un objeto vacío
  }

  // 3. ADAPTACIÓN DE DATOS PARA EL CLIENTE
  const rafflesForClient = rafflesData.map((r) => ({
    ...r,
    pricePerTicket: Number(r.pricePerTicket),
    soldCount: r._count.tickets,
    _count: undefined, // Limpiamos esta propiedad para no enviar basura al cliente
  }));

  return (
    <main className="min-h-screen pb-20 bg-[#020617]">
      {/* --- HERO SECTION ESTATICO --- */}
      <div className="pt-32 pb-16 md:pt-40 md:pb-20 text-center px-4 md:px-6 relative overflow-hidden">
        <div className="flex justify-center mb-6 md:mb-8 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="inline-flex items-center gap-2 md:gap-3 px-4 py-2 md:px-6 md:py-3 rounded-full bg-white/5 border border-white/10 shadow-2xl backdrop-blur-md cursor-default">
            {iconType === "IMAGE" && imageUrl ? (
              <div className="relative w-4 h-4 md:w-5 md:h-5">
                <Image
                  src={imageUrl}
                  alt="Certificado"
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <IconComponent className="text-primary-dynamic w-4 h-4 md:w-5 md:h-5" />
            )}
            <span className="text-[9px] md:text-[10px] font-black text-white uppercase tracking-[0.2em] md:tracking-[0.3em]">
              Certificado Oficial
            </span>
          </div>
        </div>

        <h2 className="text-xs md:text-base font-black uppercase tracking-[0.3em] md:tracking-[0.5em] mb-4 md:mb-6 relative z-10 animate-in fade-in duration-1000 delay-100 text-primary-dynamic">
          Bienvenido a {siteName}
        </h2>
        <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 uppercase italic tracking-tighter max-w-6xl mx-auto relative z-10 leading-tight md:leading-[0.9] animate-in fade-in duration-1000 delay-200 px-4 break-words">
          {heroText}
        </h1>
      </div>

      {/* --- GRID INTERACTIVO (CLIENT COMPONENT) --- */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10 mt-8 md:mt-10">
        <HomeRaffleGrid
          raffles={rafflesForClient}
          userId={user?.id || null}
          bankAccounts={bankAccounts}
        />
      </div>
    </main>
  );
}
