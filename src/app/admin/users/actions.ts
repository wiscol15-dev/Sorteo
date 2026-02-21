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

    await prisma.user.update({
      where: { id: targetUserId },
      data: {
        isVerified: isNowVerified,
        verifiedById: isNowVerified ? officer.id : null,
        verifiedAt: isNowVerified ? new Date() : null,
      },
    });

    revalidatePath("/admin/usuarios");
    return { success: true };
  } catch (error: any) {
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

    await prisma.user.update({
      where: { id: userId },
      data: { status },
    });

    revalidatePath("/admin/usuarios");
    return { success: true };
  } catch (error) {
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
    });

    revalidatePath("/admin/usuarios");
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: "Fallo en cascada al eliminar usuario y dependencias.",
    };
  }
}
