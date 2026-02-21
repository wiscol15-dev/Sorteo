"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { sendEmail } from "@/lib/mail";
import { getTicketEmailTemplate } from "@/lib/templates/ticket-email";
import { cookies } from "next/headers";

export async function createRaffle(formData: FormData) {
  let isSuccess = false;

  try {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const pricePerTicket = parseFloat(formData.get("pricePerTicket") as string);
    const maxTickets = parseInt(formData.get("maxTickets") as string, 10);
    const minSoldThreshold =
      parseFloat(formData.get("minSoldThreshold") as string) / 100 || 0.9;
    const winnersCount =
      parseInt(formData.get("winnersCount") as string, 10) || 1;
    const drawDateString = formData.get("drawDate") as string;
    const drawDate = new Date(drawDateString);

    let finalImageUrl: string | null = null;
    const imageUrl = formData.get("imageUrl") as string;
    const imageFile = formData.get("imageFile") as File | null;

    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = imageFile.name.split(".").pop() || "png";
      const filename = `sorteo-${uniqueSuffix}.${ext}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");

      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, filename), buffer);
      finalImageUrl = `/uploads/${filename}`;
    } else if (imageUrl && imageUrl.trim() !== "") {
      finalImageUrl = imageUrl.trim();
    }

    await prisma.raffle.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        imageUrl: finalImageUrl,
        pricePerTicket,
        maxTickets,
        minSoldThreshold,
        winnersCount,
        drawDate,
      },
    });

    isSuccess = true;
  } catch (error) {
    return { success: false, error: "Fallo en la creación del sorteo." };
  }

  if (isSuccess) {
    revalidatePath("/admin/sorteos");
    revalidatePath("/admin");
    redirect("/admin/sorteos");
  }
}

export async function buyTickets(
  raffleId: string,
  userId: string,
  selectedNumbers: number[],
) {
  try {
    const transactionResult = await prisma.$transaction(async (tx) => {
      const raffle = await tx.raffle.findUnique({ where: { id: raffleId } });
      const user = await tx.user.findUnique({ where: { id: userId } });

      if (!raffle || !user) throw new Error("Recurso no encontrado.");
      if (raffle.status !== "ACTIVE") throw new Error("Sorteo no activo.");

      const ticketPrice = Number(raffle.pricePerTicket);
      const totalCost = selectedNumbers.length * ticketPrice;
      const currentBalance = Number(user.walletBalance);

      if (currentBalance < totalCost) throw new Error("Saldo insuficiente.");

      const existingTickets = await tx.ticket.findMany({
        where: { raffleId, number: { in: selectedNumbers } },
      });

      if (existingTickets.length > 0) throw new Error("Boletos ya vendidos.");

      await tx.user.update({
        where: { id: userId },
        data: { walletBalance: { decrement: totalCost } },
      });

      await tx.ticket.createMany({
        data: selectedNumbers.map((num) => ({
          number: num,
          userId: userId,
          raffleId: raffleId,
          price: ticketPrice,
        })),
      });

      await tx.transaction.create({
        data: { userId, amount: totalCost, type: "PURCHASE" },
      });

      return {
        success: true,
        userEmail: user.email,
        userName: user.firstName,
        raffleTitle: raffle.title,
        totalCost,
      };
    });

    if (transactionResult.success) {
      try {
        const emailHtml = getTicketEmailTemplate({
          userName: transactionResult.userName,
          raffleTitle: transactionResult.raffleTitle,
          numbers: selectedNumbers,
          total: transactionResult.totalCost,
        });
        await sendEmail(
          transactionResult.userEmail,
          `Boletos Oficiales: ${transactionResult.raffleTitle}`,
          emailHtml,
        );
      } catch (e) {}
    }

    revalidatePath(`/sorteo/${raffleId}`);
    revalidatePath("/billetera");
    revalidatePath("/mis-tickets");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function executeRaffleDraw(raffleId: string) {
  try {
    const raffle = await prisma.raffle.findUnique({
      where: { id: raffleId },
      include: { tickets: true },
    });

    if (!raffle || raffle.status === "FINISHED") {
      return { success: false, error: "Sorteo no disponible o ya finalizado." };
    }

    const totalPossibleTickets = raffle.maxTickets;
    const winnersCountToPick = raffle.winnersCount;
    const drawnWinningNumbers: number[] = [];

    while (
      drawnWinningNumbers.length <
      Math.min(winnersCountToPick, totalPossibleTickets)
    ) {
      const randomNumber = Math.floor(Math.random() * totalPossibleTickets) + 1;
      if (!drawnWinningNumbers.includes(randomNumber)) {
        drawnWinningNumbers.push(randomNumber);
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.ticket.updateMany({
        where: {
          raffleId: raffleId,
          number: { in: drawnWinningNumbers },
        },
        data: { isWinner: true },
      });

      await tx.raffle.update({
        where: { id: raffleId },
        data: {
          status: "FINISHED",
          winningNumber: drawnWinningNumbers[0],
          winningNumbers: drawnWinningNumbers,
        },
      });
    });

    revalidatePath("/admin/sorteos");
    revalidatePath(`/sorteo/${raffleId}`);
    revalidatePath("/sorteos");
    revalidatePath("/mis-boletos");

    return { success: true, winningNumbers: drawnWinningNumbers };
  } catch (error) {
    return {
      success: false,
      error: "Fallo crítico en el motor de aleatoriedad.",
    };
  }
}

export async function depositFunds(userId: string, amount: number) {
  try {
    if (amount <= 0) throw new Error("Monto inválido.");
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { walletBalance: { increment: amount } },
      }),
      prisma.transaction.create({ data: { userId, amount, type: "DEPOSIT" } }),
    ]);
    revalidatePath("/billetera");
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Fallo al procesar recarga." };
  }
}

export async function registerUserByAdmin(formData: FormData) {
  try {
    const newUser = await prisma.user.create({
      data: {
        email: (formData.get("email") as string).toLowerCase().trim(),
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        name: `${formData.get("firstName")} ${formData.get("lastName")}`,
        phone: formData.get("phone") as string,
        idNumber: formData.get("idNumber") as string,
        role: "USER",
      },
    });
    revalidatePath("/admin/users");
    return { success: true, userId: newUser.id };
  } catch (error: any) {
    return {
      success: false,
      error: error.code === "P2002" ? "Correo/ID ya existe." : "Error interno.",
    };
  }
}

// =====================================================================
// OPERACIÓN CRÍTICA: PURGA DE SORTEO (MODIFICADO Y BLINDADO)
// =====================================================================
export async function deleteRaffle(id: string) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token")?.value;

    if (!sessionToken)
      return { success: false, error: "AUTENTICACIÓN REQUERIDA." };

    const user = await prisma.user.findUnique({ where: { id: sessionToken } });

    // VALIDACIÓN ESTRICTA: Solo SuperAdmin puede ejecutar esta función
    if (user?.role !== "SUPER_ADMIN") {
      return {
        success: false,
        error: "ACCESS_DENIED: Privilegios insuficientes para la purga.",
      };
    }

    // TRANSACCIÓN ATÓMICA EN CASCADA: Se borran dependencias (tickets) antes que el núcleo (sorteo)
    await prisma.$transaction(async (tx) => {
      await tx.ticket.deleteMany({ where: { raffleId: id } });
      await tx.raffle.delete({ where: { id } });
    });

    revalidatePath("/admin/sorteos");
    revalidatePath("/");
    revalidatePath("/admin/estadisticas");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Fallo crítico en la purga de sorteo:", error);
    return {
      success: false,
      error: "Fallo en cascada al eliminar sorteo y sus dependencias.",
    };
  }
}

export async function updateRaffle(id: string, formData: FormData) {
  try {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const pricePerTicket = parseFloat(formData.get("pricePerTicket") as string);
    const maxTickets = parseInt(formData.get("maxTickets") as string, 10);
    const winnersCount =
      parseInt(formData.get("winnersCount") as string, 10) || 1;
    const drawDate = new Date(formData.get("drawDate") as string);

    let finalImageUrl: string | undefined = undefined;
    const imageUrl = formData.get("imageUrl") as string;
    const imageFile = formData.get("imageFile") as File | null;

    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const filename = `sorteo-${Date.now()}.png`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, filename), Buffer.from(bytes));
      finalImageUrl = `/uploads/${filename}`;
    } else if (imageUrl?.trim()) {
      finalImageUrl = imageUrl.trim();
    }

    await prisma.raffle.update({
      where: { id },
      data: {
        title: title.trim(),
        description: description.trim(),
        ...(finalImageUrl && { imageUrl: finalImageUrl }),
        pricePerTicket,
        maxTickets,
        winnersCount,
        drawDate,
      },
    });

    revalidatePath("/admin/sorteos");
    revalidatePath("/");
    redirect("/admin/sorteos");
  } catch (error) {
    return { success: false, error: "Fallo al actualizar sorteo." };
  }
}
