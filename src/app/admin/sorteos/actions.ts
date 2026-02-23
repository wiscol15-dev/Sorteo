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
    const title = (formData.get("title") as string)?.trim();
    const description = (formData.get("description") as string)?.trim();
    const type =
      (formData.get("type") as "INTERNAL" | "EXTERNAL") || "INTERNAL";

    const pricePerTicket = Number(formData.get("pricePerTicket"));
    const maxTickets = Number(formData.get("maxTickets"));
    const winnersCount = Number(formData.get("winnersCount") || 1);
    const minSoldRaw = Number(formData.get("minSoldThreshold"));
    const drawDateString = formData.get("drawDate") as string;

    // Capturamos los bancos habilitados si el sorteo es externo
    const availableBanks =
      type === "EXTERNAL" ? (formData.get("availableBanks") as string) : null;

    if (!title || !description || !drawDateString) {
      return { success: false, error: "Campos obligatorios faltantes." };
    }

    if (!pricePerTicket || pricePerTicket <= 0) {
      return { success: false, error: "Precio inválido." };
    }

    if (!maxTickets || maxTickets <= 0) {
      return { success: false, error: "Cantidad de boletos inválida." };
    }

    const drawDate = new Date(drawDateString);
    if (isNaN(drawDate.getTime())) {
      return { success: false, error: "Fecha inválida." };
    }

    const minSoldThreshold =
      minSoldRaw && minSoldRaw > 0 ? minSoldRaw / 100 : 0.9;

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
    } else if (imageUrl?.trim()) {
      finalImageUrl = imageUrl.trim();
    }

    await prisma.raffle.create({
      data: {
        title,
        description,
        imageUrl: finalImageUrl,
        pricePerTicket,
        maxTickets,
        minSoldThreshold,
        winnersCount,
        drawDate,
        type,
        availableBanks,
        status: "ACTIVE",
        isFinished: false,
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
    if (!selectedNumbers || selectedNumbers.length === 0) {
      return { success: false, error: "No seleccionaste boletos." };
    }

    const result = await prisma.$transaction(
      async (tx) => {
        const raffle = await tx.raffle.findUnique({
          where: { id: raffleId },
        });

        const user = await tx.user.findUnique({
          where: { id: userId },
        });

        if (!raffle || !user) throw new Error("Recurso no encontrado.");
        if (raffle.status !== "ACTIVE") throw new Error("Sorteo no activo.");

        const ticketPrice = Number(raffle.pricePerTicket);
        const totalCost = selectedNumbers.length * ticketPrice;

        if (Number(user.walletBalance) < totalCost)
          throw new Error("Saldo insuficiente.");

        const invalid = selectedNumbers.find(
          (n) => n < 1 || n > raffle.maxTickets,
        );
        if (invalid) throw new Error("Número fuera de rango.");

        const unique = [...new Set(selectedNumbers)];
        if (unique.length !== selectedNumbers.length)
          throw new Error("Números duplicados detectados.");

        const existing = await tx.ticket.findMany({
          where: { raffleId, number: { in: selectedNumbers } },
        });

        if (existing.length > 0)
          throw new Error("Algunos boletos ya fueron vendidos.");

        await tx.user.update({
          where: { id: userId },
          data: { walletBalance: { decrement: totalCost } },
        });

        await tx.ticket.createMany({
          data: selectedNumbers.map((num) => ({
            number: num,
            userId,
            raffleId,
            price: ticketPrice,
            status: "VALID",
          })),
        });

        await tx.transaction.create({
          data: {
            userId,
            amount: totalCost,
            type: "PURCHASE",
            status: "COMPLETED",
          },
        });

        return {
          email: user.email,
          name: user.firstName,
          raffleTitle: raffle.title,
          totalCost,
        };
      },
      {
        maxWait: 15000,
        timeout: 45000,
      },
    );

    try {
      const html = getTicketEmailTemplate({
        userName: result.name,
        raffleTitle: result.raffleTitle,
        numbers: selectedNumbers,
        total: result.totalCost,
      });

      await sendEmail(
        result.email,
        `Boletos Oficiales: ${result.raffleTitle}`,
        html,
      );
    } catch (e) {}

    revalidatePath(`/sorteo/${raffleId}`);
    revalidatePath("/billetera");
    revalidatePath("/mis-tickets");
    revalidatePath("/admin");

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function buyRandomTickets(
  raffleId: string,
  userId: string,
  quantity: number,
) {
  try {
    if (!quantity || quantity <= 0) {
      return { success: false, error: "Cantidad inválida." };
    }

    const result = await prisma.$transaction(
      async (tx) => {
        const raffle = await tx.raffle.findUnique({
          where: { id: raffleId },
        });

        const user = await tx.user.findUnique({
          where: { id: userId },
        });

        if (!raffle || !user) throw new Error("Recurso no encontrado.");
        if (raffle.status !== "ACTIVE") throw new Error("Sorteo no activo.");
        if (raffle.type !== "EXTERNAL")
          throw new Error("Esta función es solo para sorteos externos.");

        const ticketPrice = Number(raffle.pricePerTicket);
        const totalCost = quantity * ticketPrice;

        if (Number(user.walletBalance) < totalCost)
          throw new Error("Saldo insuficiente.");

        const existingTickets = await tx.ticket.findMany({
          where: { raffleId },
          select: { number: true },
        });

        const soldNumbers = new Set(existingTickets.map((t) => t.number));
        const availableNumbers: number[] = [];

        for (let i = 1; i <= raffle.maxTickets; i++) {
          if (!soldNumbers.has(i)) {
            availableNumbers.push(i);
          }
        }

        if (availableNumbers.length < quantity) {
          throw new Error(
            `Solo quedan ${availableNumbers.length} boletos disponibles.`,
          );
        }

        const selectedNumbers: number[] = [];
        for (let i = 0; i < quantity; i++) {
          const randomIndex = Math.floor(
            Math.random() * availableNumbers.length,
          );
          selectedNumbers.push(availableNumbers[randomIndex]);
          availableNumbers.splice(randomIndex, 1);
        }

        await tx.user.update({
          where: { id: userId },
          data: { walletBalance: { decrement: totalCost } },
        });

        await tx.ticket.createMany({
          data: selectedNumbers.map((num) => ({
            number: num,
            userId,
            raffleId,
            price: ticketPrice,
            status: "VALID",
          })),
        });

        await tx.transaction.create({
          data: {
            userId,
            amount: totalCost,
            type: "PURCHASE",
            status: "COMPLETED",
          },
        });

        return {
          email: user.email,
          name: user.firstName,
          raffleTitle: raffle.title,
          totalCost,
          selectedNumbers,
        };
      },
      {
        maxWait: 15000,
        timeout: 45000,
      },
    );

    try {
      const html = getTicketEmailTemplate({
        userName: result.name,
        raffleTitle: result.raffleTitle,
        numbers: result.selectedNumbers,
        total: result.totalCost,
      });

      await sendEmail(
        result.email,
        `Boletos Oficiales: ${result.raffleTitle}`,
        html,
      );
    } catch (e) {}

    revalidatePath(`/sorteo/${raffleId}`);
    revalidatePath("/billetera");
    revalidatePath("/mis-tickets");
    revalidatePath("/admin");

    return { success: true, assignedNumbers: result.selectedNumbers };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function buyRandomTicketsManual(formData: FormData) {
  try {
    const raffleId = formData.get("raffleId") as string;
    const userId = formData.get("userId") as string;
    const quantity = Number(formData.get("quantity"));
    const buyerName = formData.get("buyerName") as string;
    const buyerLastName = formData.get("buyerLastName") as string;
    const buyerDocument = formData.get("buyerDocument") as string;
    const buyerEmail = formData.get("buyerEmail") as string;
    const receiptFile = formData.get("receiptFile") as File;

    if (!raffleId || !userId || !quantity || quantity <= 0) {
      return { success: false, error: "Datos de orden inválidos." };
    }

    if (
      !buyerName ||
      !buyerLastName ||
      !buyerDocument ||
      !buyerEmail ||
      !receiptFile
    ) {
      return {
        success: false,
        error: "Debes completar todos los campos y adjuntar el comprobante.",
      };
    }

    const bytes = await receiptFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = receiptFile.name.split(".").pop() || "png";
    const filename = `receipt-${uniqueSuffix}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "receipts");

    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);
    const receiptUrl = `/uploads/receipts/${filename}`;

    const fullName = `${buyerName.trim()} ${buyerLastName.trim()}`;

    await prisma.$transaction(
      async (tx) => {
        const raffle = await tx.raffle.findUnique({
          where: { id: raffleId },
        });

        if (!raffle) throw new Error("Sorteo no encontrado.");
        if (raffle.status !== "ACTIVE") throw new Error("Sorteo no activo.");
        if (raffle.type !== "EXTERNAL")
          throw new Error("Esta función es solo para sorteos externos.");

        const ticketPrice = Number(raffle.pricePerTicket);
        const totalCost = quantity * ticketPrice;

        const existingTickets = await tx.ticket.findMany({
          where: { raffleId },
          select: { number: true },
        });

        const soldNumbers = new Set(existingTickets.map((t) => t.number));
        const availableNumbers: number[] = [];

        for (let i = 1; i <= raffle.maxTickets; i++) {
          if (!soldNumbers.has(i)) {
            availableNumbers.push(i);
          }
        }

        if (availableNumbers.length < quantity) {
          throw new Error(
            `Solo quedan ${availableNumbers.length} boletos disponibles.`,
          );
        }

        const selectedNumbers: number[] = [];
        for (let i = 0; i < quantity; i++) {
          const randomIndex = Math.floor(
            Math.random() * availableNumbers.length,
          );
          selectedNumbers.push(availableNumbers[randomIndex]);
          availableNumbers.splice(randomIndex, 1);
        }

        const transaction = await tx.transaction.create({
          data: {
            userId,
            amount: totalCost,
            type: "PURCHASE",
            status: "PENDING",
            buyerName: fullName,
            buyerDocument,
            buyerEmail,
            receiptUrl,
          },
        });

        await tx.ticket.createMany({
          data: selectedNumbers.map((num) => ({
            number: num,
            userId,
            raffleId,
            price: ticketPrice,
            status: "PENDING",
            transactionId: transaction.id,
          })),
        });
      },
      {
        maxWait: 15000,
        timeout: 45000,
      },
    );

    revalidatePath(`/sorteo/${raffleId}`);
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

    if (!raffle) return { success: false, error: "Sorteo no encontrado." };
    if (raffle.status === "FINISHED")
      return { success: false, error: "Sorteo ya finalizado." };
    if (raffle.type === "EXTERNAL")
      return {
        success: false,
        error: "Sorteo externo requiere resolución manual.",
      };

    const soldTickets = raffle.tickets.filter(
      (t) => t.status === "VALID",
    ).length;
    const minimumRequired = raffle.maxTickets * raffle.minSoldThreshold;

    if (soldTickets < minimumRequired) {
      return {
        success: false,
        error: "Ventas insuficientes. Por favor, prolonga la fecha del sorteo.",
      };
    }

    const winnersCount = Math.min(raffle.winnersCount, raffle.maxTickets);
    const winningNumbers: number[] = [];

    while (winningNumbers.length < winnersCount) {
      const random = Math.floor(Math.random() * raffle.maxTickets) + 1;
      if (!winningNumbers.includes(random)) winningNumbers.push(random);
    }

    await prisma.$transaction(async (tx) => {
      await tx.ticket.updateMany({
        where: { raffleId, number: { in: winningNumbers } },
        data: { isWinner: true },
      });

      await tx.raffle.update({
        where: { id: raffleId },
        data: {
          status: "FINISHED",
          isFinished: true,
          winningNumber: winningNumbers[0],
          winningNumbers,
        },
      });
    });

    revalidatePath("/admin/sorteos");
    revalidatePath(`/sorteo/${raffleId}`);
    revalidatePath("/sorteos");
    revalidatePath("/mis-boletos");

    return { success: true, winningNumbers };
  } catch (error) {
    return {
      success: false,
      error: "Fallo crítico en el motor de aleatoriedad.",
    };
  }
}

export async function resolveExternalRaffle(
  raffleId: string,
  winningNumber: number,
) {
  try {
    const raffle = await prisma.raffle.findUnique({
      where: { id: raffleId },
      include: { tickets: true },
    });

    if (!raffle) return { success: false, error: "Sorteo no encontrado." };
    if (raffle.status === "FINISHED")
      return { success: false, error: "Sorteo ya finalizado." };
    if (raffle.type !== "EXTERNAL")
      return {
        success: false,
        error: "Este sorteo no es de modalidad externa.",
      };

    const soldTickets = raffle.tickets.filter(
      (t) => t.status === "VALID",
    ).length;
    const minimumRequired = raffle.maxTickets * raffle.minSoldThreshold;

    if (soldTickets < minimumRequired) {
      return {
        success: false,
        error:
          "Ventas insuficientes. Por favor, prolonga la fecha del sorteo en la edición.",
      };
    }

    if (winningNumber <= 0 || winningNumber > raffle.maxTickets) {
      return {
        success: false,
        error: "El número ganador se encuentra fuera del rango de boletos.",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.ticket.updateMany({
        where: { raffleId, number: winningNumber },
        data: { isWinner: true },
      });

      await tx.raffle.update({
        where: { id: raffleId },
        data: {
          status: "FINISHED",
          isFinished: true,
          winningNumber: winningNumber,
          winningNumbers: [winningNumber],
        },
      });
    });

    revalidatePath("/admin/sorteos");
    revalidatePath(`/sorteo/${raffleId}`);
    revalidatePath("/sorteos");
    revalidatePath("/mis-boletos");

    return { success: true };
  } catch (error) {
    return { success: false, error: "Fallo al procesar el ganador externo." };
  }
}

export async function depositFunds(userId: string, amount: number) {
  try {
    if (!amount || amount <= 0)
      return { success: false, error: "Monto inválido." };

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { walletBalance: { increment: amount } },
      }),
      prisma.transaction.create({
        data: { userId, amount, type: "DEPOSIT", status: "COMPLETED" },
      }),
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
    const email = (formData.get("email") as string)?.toLowerCase()?.trim();

    if (!email) return { success: false, error: "Email requerido." };

    const newUser = await prisma.user.create({
      data: {
        email,
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
      error:
        error.code === "P2002"
          ? "Correo o identificación ya existe."
          : "Error interno.",
    };
  }
}

export async function deleteRaffle(id: string) {
  try {
    const cookieStore = cookies();
    const sessionToken = (await cookieStore).get("session_token")?.value;

    if (!sessionToken)
      return { success: false, error: "AUTENTICACIÓN REQUERIDA." };

    const user = await prisma.user.findUnique({
      where: { id: sessionToken },
    });

    if (user?.role !== "SUPER_ADMIN") {
      return {
        success: false,
        error: "ACCESS_DENIED: Privilegios insuficientes.",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.ticket.deleteMany({ where: { raffleId: id } });
      await tx.raffle.delete({ where: { id } });
    });

    revalidatePath("/admin/sorteos");
    revalidatePath("/admin");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    return { success: false, error: "Fallo al eliminar el sorteo." };
  }
}

export async function updateRaffle(id: string, formData: FormData) {
  let isSuccess = false;

  try {
    const title = (formData.get("title") as string)?.trim();
    const description = (formData.get("description") as string)?.trim();
    const pricePerTicket = Number(formData.get("pricePerTicket"));
    const maxTickets = Number(formData.get("maxTickets"));
    const winnersCount = Number(formData.get("winnersCount") || 1);
    const drawDate = new Date(formData.get("drawDate") as string);
    const type = formData.get("type") as "INTERNAL" | "EXTERNAL" | null;
    const minSoldRaw = Number(formData.get("minSoldThreshold"));

    if (!title || !description)
      return { success: false, error: "Datos inválidos." };

    let finalImageUrl: string | undefined;
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

    const updateData: any = {
      title,
      description,
      pricePerTicket,
      maxTickets,
      winnersCount,
      drawDate,
    };

    if (minSoldRaw && minSoldRaw > 0) {
      updateData.minSoldThreshold = minSoldRaw / 100;
    }

    if (finalImageUrl) updateData.imageUrl = finalImageUrl;
    if (type) updateData.type = type;

    await prisma.raffle.update({
      where: { id },
      data: updateData,
    });

    isSuccess = true;
  } catch (error) {
    return { success: false, error: "Fallo al actualizar sorteo." };
  }

  if (isSuccess) {
    revalidatePath("/admin/sorteos");
    revalidatePath("/");
    redirect("/admin/sorteos");
  }
}
