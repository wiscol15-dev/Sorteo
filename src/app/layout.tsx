import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import prisma from "@/lib/prisma";

export async function generateMetadata(): Promise<Metadata> {
  const config = await prisma.siteConfig.findFirst();
  return {
    title: config?.siteName || "Sorteos Premium | Plataforma Oficial",
    description:
      config?.heroText ||
      "Participa en los sorteos más exclusivos con transparencia total.",
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;

  const [user, siteConfig] = await Promise.all([
    sessionToken
      ? prisma.user.findUnique({
          where: { id: sessionToken },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            walletBalance: true,
          },
        })
      : null,
    prisma.siteConfig.findFirst(),
  ]);

  const serializedUser = user
    ? {
        ...user,
        walletBalance: Number(user.walletBalance),
      }
    : null;

  const primaryColor = siteConfig?.colorPrincipal || "#2563eb";
  const backgroundColor = siteConfig?.colorSecundario || "#0f172a";
  const cardBgColor = siteConfig?.cardBgColor || "#1e293b";
  const cardTextColor = siteConfig?.cardTextColor || "#ffffff";
  const siteTitle = siteConfig?.siteName || "Sorteos Premium";

  const headerIconType = siteConfig?.headerIconType || "ICON";
  const headerIconName = siteConfig?.headerIconName || "ShieldCheck";
  const headerImageUrl = siteConfig?.headerImageUrl || null;

  return (
    <html lang="es">
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
          :root {
            --primary-brand: ${primaryColor};
            --bg-system: ${backgroundColor};
            --card-bg: ${cardBgColor};
            --card-text: ${cardTextColor};
          }
          body {
            background-color: var(--bg-system) !important;
          }
          .text-primary-dynamic {
            color: var(--primary-brand) !important;
          }
          .bg-primary-dynamic {
            background-color: var(--primary-brand) !important;
          }
          .card-dynamic {
            background-color: var(--card-bg) !important;
            color: var(--card-text) !important;
            border-color: color-mix(in srgb, var(--card-text) 10%, transparent) !important;
          }
        `,
          }}
        />
      </head>
      <body className="antialiased transition-colors duration-500 min-h-screen flex flex-col font-sans">
        <Navbar
          user={serializedUser}
          siteName={siteTitle}
          headerIconType={headerIconType}
          headerIconName={headerIconName}
          headerImageUrl={headerImageUrl}
        />

        <main className="flex-grow relative">{children}</main>

        <Footer siteName={siteTitle} />
      </body>
    </html>
  );
}
