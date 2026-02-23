import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import NuevoSorteoClient from "./NuevoSorteoClient";

export const dynamic = "force-dynamic";

export default async function NuevoSorteoServerPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;

  if (!sessionToken) {
    redirect("/auth/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionToken },
    select: { role: true },
  });

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    redirect("/");
  }

  const siteConfig = await prisma.siteConfig.findFirst();
  let configuredBanks: string[] = [];

  try {
    if (siteConfig?.bankAccounts) {
      const parsedBanks = JSON.parse(siteConfig.bankAccounts);
      configuredBanks = Object.keys(parsedBanks);
    }
  } catch (error) {
    configuredBanks = [];
  }

  return <NuevoSorteoClient configuredBanks={configuredBanks} />;
}
