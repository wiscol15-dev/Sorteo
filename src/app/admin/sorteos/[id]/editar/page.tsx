import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import EditForm from "./EditForm";

export default async function EditarSorteoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;

  const raffle = await prisma.raffle.findUnique({
    where: { id: resolvedParams.id },
  });

  if (!raffle) {
    redirect("/admin/sorteos");
  }

  const serializedRaffle = {
    ...raffle,
    pricePerTicket: Number(raffle.pricePerTicket),
  };

  return <EditForm raffle={serializedRaffle} />;
}
