"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function toggleUserVerification(targetUserId: string) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token")?.value;

    if (!sessionToken)
      return { success: false, error: "AUTENTICACIÓN REQUERIDA." };

    const officer = await prisma.user.findUnique({
      where: { id: sessionToken },
    });

    if (
      !officer ||
      (officer.role !== "ADMIN" && officer.role !== "SUPER_ADMIN")
    ) {
      return {
        success: false,
        error: "ACCESS_DENIED: Privilegios insuficientes.",
      };
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) return { success: false, error: "Usuario no encontrado." };

    const isNowVerified = !targetUser.isVerified;

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: targetUserId },
        data: {
          isVerified: isNowVerified,
          verifiedById: isNowVerified ? officer.id : null,
          verifiedAt: isNowVerified ? new Date() : null,
        },
      });

      await tx.auditLog.create({
        data: {
          action: isNowVerified ? "USER_VERIFIED" : "USER_UNVERIFIED",
          entityType: "USER",
          entityId: targetUserId,
          userId: officer.id,
          metadata: { reason: "Manual toggle by admin" },
        },
      });
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Error in toggleUserVerification:", error.message);
    return { success: false, error: "Fallo en el protocolo de verificación." };
  }
}

export async function updateUserStatus(
  userId: string,
  status: "ACTIVE" | "SUSPENDED" | "BANNED",
) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token")?.value;

    if (!sessionToken)
      return { success: false, error: "AUTENTICACIÓN REQUERIDA." };

    const officer = await prisma.user.findUnique({
      where: { id: sessionToken },
    });

    if (
      !officer ||
      (officer.role !== "ADMIN" && officer.role !== "SUPER_ADMIN")
    ) {
      return { success: false, error: "ACCESS_DENIED." };
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { status },
      });

      await tx.auditLog.create({
        data: {
          action: `USER_STATUS_${status}`,
          entityType: "USER",
          entityId: userId,
          userId: officer.id,
        },
      });
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Error in updateUserStatus:", error.message);
    return { success: false, error: "No se pudo cambiar el estado operativo." };
  }
}

export async function deleteUserRecord(targetUserId: string) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token")?.value;

    if (!sessionToken)
      return { success: false, error: "AUTENTICACIÓN REQUERIDA." };

    const officer = await prisma.user.findUnique({
      where: { id: sessionToken },
    });

    if (officer?.role !== "SUPER_ADMIN") {
      return {
        success: false,
        error: "ACCESS_DENIED: Solo un SUPER_ADMIN puede ejecutar purgas.",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.auditLog.deleteMany({ where: { userId: targetUserId } });
      await tx.transaction.deleteMany({ where: { userId: targetUserId } });
      await tx.ticket.deleteMany({ where: { userId: targetUserId } });

      await tx.user.updateMany({
        where: { verifiedById: targetUserId },
        data: { verifiedById: null, verifiedAt: null },
      });

      await tx.user.delete({ where: { id: targetUserId } });

      await tx.auditLog.create({
        data: {
          action: "USER_DELETED",
          entityType: "USER",
          entityId: targetUserId,
          userId: officer.id,
        },
      });
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("Error in deleteUserRecord:", error.message);
    return {
      success: false,
      error: "Fallo en cascada al eliminar usuario y dependencias.",
    };
  }
}

export async function approveManualPurchase(transactionId: string) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token")?.value;

    if (!sessionToken)
      return { success: false, error: "AUTENTICACIÓN REQUERIDA." };

    const officer = await prisma.user.findUnique({
      where: { id: sessionToken },
    });

    if (
      !officer ||
      (officer.role !== "ADMIN" && officer.role !== "SUPER_ADMIN")
    ) {
      return { success: false, error: "ACCESS_DENIED." };
    }

    await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({
        where: { id: transactionId },
        include: { user: true },
      });

      if (!transaction) throw new Error("Transacción no encontrada.");
      if (transaction.status === "COMPLETED")
        throw new Error("Esta transacción ya fue aprobada.");

      await tx.transaction.update({
        where: { id: transactionId },
        data: { status: "COMPLETED" },
      });

      await tx.ticket.updateMany({
        where: { transactionId: transactionId },
        data: { status: "VALID" },
      });

      await tx.auditLog.create({
        data: {
          action: "EXTERNAL_PURCHASE_APPROVED",
          entityType: "TRANSACTION",
          entityId: transactionId,
          userId: officer.id,
          metadata: {
            amount: Number(transaction.amount),
            targetUser: transaction.user.email,
          },
        },
      });
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("Error in approveManualPurchase:", error.message);
    return {
      success: false,
      error: error.message || "Fallo al aprobar la adquisición de tickets.",
    };
  }
}

export async function rejectManualPurchase(transactionId: string) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token")?.value;

    if (!sessionToken)
      return { success: false, error: "AUTENTICACIÓN REQUERIDA." };

    const officer = await prisma.user.findUnique({
      where: { id: sessionToken },
    });

    if (
      !officer ||
      (officer.role !== "ADMIN" && officer.role !== "SUPER_ADMIN")
    ) {
      return { success: false, error: "ACCESS_DENIED." };
    }

    await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({
        where: { id: transactionId },
      });

      if (!transaction) throw new Error("Transacción no encontrada.");

      await tx.transaction.update({
        where: { id: transactionId },
        data: { status: "REJECTED" },
      });

      await tx.ticket.updateMany({
        where: { transactionId: transactionId },
        data: { status: "REJECTED" },
      });

      await tx.auditLog.create({
        data: {
          action: "EXTERNAL_PURCHASE_REJECTED",
          entityType: "TRANSACTION",
          entityId: transactionId,
          userId: officer.id,
        },
      });
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("Error in rejectManualPurchase:", error.message);
    return { success: false, error: "Error al anular la orden de compra." };
  }
}
