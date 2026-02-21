"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Verifica manualmente la identidad de un usuario desde el panel admin
 */
export async function verifyUser(userId: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      // Al verificar, activamos al usuario y marcamos su verificación
      data: {
        isVerified: true,
        status: "ACTIVE",
      },
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: "No se pudo verificar la identidad del usuario.",
    };
  }
}

/**
 * Actualiza el documento KYC de un usuario (Llamado desde el componente KYCUpload)
 */
export async function updateKycDocument(userId: string, documentUrl: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        idDocumentUrl: documentUrl,
        // Marcamos como pendiente para que el admin lo revise en el panel
        status: "PENDING_VERIFICATION",
      },
    });

    revalidatePath("/admin/users");
    revalidatePath("/billetera"); // Actualiza la vista del usuario
    return { success: true };
  } catch (error: any) {
    console.error("Error en updateKycDocument Action:", error.message);
    return {
      success: false,
      error: "No se pudo vincular el documento a tu cuenta oficial.",
    };
  }
}

/**
 * Cambia el estado operativo de una cuenta
 */
export async function updateUserStatus(
  userId: string,
  status: "ACTIVE" | "SUSPENDED" | "BANNED" | "PENDING_VERIFICATION",
) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { status },
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: "Error crítico al actualizar el estado del usuario.",
    };
  }
}

export async function deleteUser(userId: string) {
  try {
    await prisma.user.delete({
      where: { id: userId },
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        "No se pudo eliminar el registro del usuario. Verifique si tiene transacciones activas.",
    };
  }
}

export async function updateSiteConfig(formData: FormData) {
  try {
    const data = {
      siteName: formData.get("siteName") as string,
      heroText: formData.get("heroText") as string,
      colorPrincipal: formData.get("colorPrincipal") as string,
      colorSecundario: formData.get("colorSecundario") as string,
      cardBgColor: formData.get("cardBgColor") as string,
      cardTextColor: formData.get("cardTextColor") as string,
    };

    await prisma.siteConfig.upsert({
      where: { id: "default_config" },
      update: data,
      create: { id: "default_config", ...data },
    });

    revalidatePath("/", "layout");
    revalidatePath("/admin/configuracion");

    return { success: true };
  } catch (error) {
    console.error("Error en updateSiteConfig:", error);
    return {
      success: false,
      error: "Error al actualizar la configuración visual del sitio.",
    };
  }
}
