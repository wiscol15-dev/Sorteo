"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function processInstantDeposit(
  userId: string,
  formData: FormData,
) {
  try {
    const amount = parseFloat(formData.get("amount") as string);
    const paymentMethod = formData.get("metodoPago") as string;

    if (isNaN(amount) || amount <= 0) {
      return { success: false, error: "El monto debe ser un valor positivo." };
    }

    if (!paymentMethod) {
      return { success: false, error: "Protocolo de pago no especificado." };
    }

    const generatedReference = `DEP-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { walletBalance: { increment: amount } },
      });

      await tx.transaction.create({
        data: {
          userId,
          amount,
          type: "DEPOSIT",
          status: "COMPLETED",
          referenceId: generatedReference,
          paymentMethod,
        },
      });
    });

    revalidatePath("/billetera");
    revalidatePath("/admin/users");

    return { success: true };
  } catch (error) {
    console.error("CRITICAL_FINANCIAL_ERROR_DEPOSIT:", error);
    return { success: false, error: "Fallo en el nodo de capitalización." };
  }
}

export async function processWithdrawalRequest(
  userId: string,
  formData: FormData,
) {
  try {
    const amount = parseFloat(formData.get("amount") as string);
    const withdrawalMethod = formData.get("withdrawalMethod") as string;

    if (isNaN(amount) || amount <= 0) {
      return { success: false, error: "Monto de extracción inválido." };
    }

    const generatedReference = `WTH-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { walletBalance: true },
      });

      if (!user || Number(user.walletBalance) < amount) {
        throw new Error("SOLVENCIA_INSUFICIENTE");
      }

      await tx.user.update({
        where: { id: userId },
        data: { walletBalance: { decrement: amount } },
      });

      return await tx.transaction.create({
        data: {
          userId,
          amount: -amount,
          type: "WITHDRAWAL",
          status: "PENDING",
          referenceId: generatedReference,
          paymentMethod: withdrawalMethod || "BANK_TRANSFER",
        },
      });
    });

    revalidatePath("/billetera");
    revalidatePath("/admin/users");

    return { success: true, reference: result.referenceId };
  } catch (error: any) {
    if (error.message === "SOLVENCIA_INSUFICIENTE") {
      return {
        success: false,
        error: "Fondos insuficientes para esta operación.",
      };
    }
    console.error("CRITICAL_FINANCIAL_ERROR_WITHDRAWAL:", error);
    return {
      success: false,
      error: "Fallo en el protocolo de descapitalización.",
    };
  }
}
