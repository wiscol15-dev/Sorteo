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

  // 1. OBTENCIÓN PARALELA DE DATOS EN EL SERVIDOR
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
  const siteName = config?.siteName || "Rifas Simonboli";
  const heroText = config?.heroText || "@GANASIMONBOLI";
  const iconType = config?.headerIconType || "ICON";
  const imageUrl = config?.headerImageUrl;
  const IconComponent =
    iconMap[config?.headerIconName || "ShieldCheck"] || ShieldCheck;

  // Fondos Dinámicos
  const bgImage1 = config?.bgImage1;
  const bgImage2 = config?.bgImage2;

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
    _count: undefined,
  }));

  return (
    <main className="min-h-screen pb-20 bg-[#0B0F19] relative">
      {/* =====================================================================
          CAPA DE FONDOS DINÁMICOS 50/50 (Z-0)
          ===================================================================== */}
      {/* Inicia en top-[80px] o top-[100px] para respetar el espacio de tu Navbar.
          El alto h-[50vh] md:h-[60vh] asegura que corte a la mitad de las tarjetas. */}
      <div className="absolute top-[80px] lg:top-[100px] left-0 w-full h-[50vh] md:h-[60vh] flex z-0 pointer-events-none select-none overflow-hidden">
        {/* Máscara de Degradado: Funde las imágenes con el color de fondo en la parte inferior */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F19]/20 via-[#0B0F19]/60 to-[#0B0F19] z-10" />

        {/* Mitad Izquierda (50%) */}
        <div className="relative w-1/2 h-full opacity-30">
          {bgImage1 && (
            <Image
              src={bgImage1}
              alt="Background Izquierdo"
              fill
              priority
              className="object-cover object-center"
            />
          )}
        </div>

        {/* Mitad Derecha (50%) */}
        <div className="relative w-1/2 h-full opacity-30">
          {bgImage2 && (
            <Image
              src={bgImage2}
              alt="Background Derecho"
              fill
              priority
              className="object-cover object-center"
            />
          )}
        </div>
      </div>

      {/* Capa de textura para unificar el diseño (Opcional, da un toque Premium) */}
      <div className="absolute top-[80px] lg:top-[100px] left-0 w-full h-[50vh] md:h-[60vh] z-0 pointer-events-none opacity-40 mix-blend-overlay">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02]" />
      </div>

      {/* =====================================================================
          CAPA DE CONTENIDO PRINCIPAL (Z-10)
          ===================================================================== */}
      <div className="relative z-10">
        <div className="pt-28 pb-16 md:pt-36 md:pb-20 text-center px-4 md:px-6">
          <div className="flex justify-center mb-6 md:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="inline-flex items-center gap-2 md:gap-3 px-5 py-2 md:px-6 md:py-3 rounded-full bg-[#0B0F19]/80 border border-white/10 shadow-2xl backdrop-blur-md cursor-default">
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
                <IconComponent className="text-[#4ade80] w-4 h-4 md:w-5 md:h-5" />
              )}
              {/* Actualización de texto solicitada */}
              <span className="text-[10px] md:text-xs font-black text-white uppercase tracking-[0.2em] md:tracking-[0.3em]">
                Certificado por Conalot
              </span>
            </div>
          </div>

          <h2 className="text-xs md:text-base font-black uppercase tracking-[0.3em] md:tracking-[0.5em] mb-4 md:mb-6 animate-in fade-in duration-1000 delay-100 text-[#4ade80]">
            Bienvenido a {siteName}
          </h2>
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white uppercase italic tracking-tighter max-w-6xl mx-auto leading-tight md:leading-[0.9] animate-in fade-in duration-1000 delay-200 px-4 break-words">
            {heroText}
          </h1>
        </div>

        {/* Grilla de Sorteos Interactivas */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 mt-4 md:mt-8">
          <HomeRaffleGrid
            raffles={rafflesForClient}
            userId={user?.id || null}
            bankAccounts={bankAccounts}
          />
        </div>
      </div>
    </main>
  );
}
