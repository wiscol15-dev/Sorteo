"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";

export async function updateSystemConfig(formData: FormData, userId: string) {
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for") || "127.0.0.1";

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.role !== "SUPER_ADMIN") {
      throw new Error(
        "CRITICAL_SECURITY_BREACH: Nivel de acceso insuficiente.",
      );
    }

    const siteName = (formData.get("siteName") as string).trim();
    const heroText = (formData.get("heroText") as string).trim();
    const colorPrincipal = formData.get("primaryColor") as string;
    const colorSecundario = formData.get("bgColor") as string;
    const cardBgColor = (formData.get("cardBgColor") as string) || "#1e293b";
    const cardTextColor =
      (formData.get("cardTextColor") as string) || "#ffffff";

    const headerIconType = (formData.get("headerIconType") as string) || "ICON";
    const headerIconName =
      (formData.get("headerIconName") as string) || "ShieldCheck";

    // 1. PROCESAMIENTO DE IMAGEN DEL HEADER A BASE64 (Compatible con Vercel)
    let finalHeaderImageUrl: string | undefined = undefined;
    if (headerIconType === "IMAGE") {
      const imageFile = formData.get("headerImageFile") as File | null;
      if (imageFile && imageFile.size > 0) {
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Image = buffer.toString("base64");
        const mimeType = imageFile.type || "image/png";
        finalHeaderImageUrl = `data:${mimeType};base64,${base64Image}`;
      }
    }

    // 2. PROCESAMIENTO DE FONDOS DINÁMICOS 50/50 A BASE64
    let finalBgImage1: string | undefined = undefined;
    const bgImage1File = formData.get("bgImage1File") as File | null;
    if (bgImage1File && bgImage1File.size > 0) {
      const bytes = await bgImage1File.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64Image = buffer.toString("base64");
      const mimeType = bgImage1File.type || "image/png";
      finalBgImage1 = `data:${mimeType};base64,${base64Image}`;
    }

    let finalBgImage2: string | undefined = undefined;
    const bgImage2File = formData.get("bgImage2File") as File | null;
    if (bgImage2File && bgImage2File.size > 0) {
      const bytes = await bgImage2File.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64Image = buffer.toString("base64");
      const mimeType = bgImage2File.type || "image/png";
      finalBgImage2 = `data:${mimeType};base64,${base64Image}`;
    }

    // 3. CAPTURA DINÁMICA DE CUENTAS BANCARIAS
    const bankAccountsObj: Record<string, any> = {};
    const totalBanks =
      parseInt(formData.get("total_banks_count") as string) || 50;

    for (let i = 0; i < totalBanks; i++) {
      const bankName = formData.get(`bank_${i}_name`) as string;
      if (bankName) {
        const titular =
          (formData.get(`bank_${i}_titular`) as string)?.trim() || "";
        const doc = (formData.get(`bank_${i}_doc`) as string)?.trim() || "";
        const account =
          (formData.get(`bank_${i}_account`) as string)?.trim() || "";
        const phone = (formData.get(`bank_${i}_phone`) as string)?.trim() || "";
        const type = (formData.get(`bank_${i}_type`) as string)?.trim() || "";

        if (titular || doc || account || phone || type) {
          bankAccountsObj[bankName] = { titular, doc, account, phone, type };
        }
      }
    }

    const bankAccounts = JSON.stringify(bankAccountsObj);

    // 4. CONSTRUCCIÓN DEL OBJETO DE ACTUALIZACIÓN
    const currentConfig = await prisma.siteConfig.findFirst();

    const configData: any = {
      siteName,
      heroText,
      colorPrincipal,
      colorSecundario,
      cardBgColor,
      cardTextColor,
      headerIconType,
      headerIconName,
      bankAccounts,
    };

    // Solo se adjuntan si el usuario subió imágenes nuevas (evita sobreescribir con nulos)
    if (finalHeaderImageUrl) configData.headerImageUrl = finalHeaderImageUrl;
    if (finalBgImage1) configData.bgImage1 = finalBgImage1;
    if (finalBgImage2) configData.bgImage2 = finalBgImage2;

    // 5. TRANSACCIÓN SEGURA A LA BASE DE DATOS
    await prisma.$transaction(async (tx) => {
      if (currentConfig) {
        await tx.siteConfig.update({
          where: { id: currentConfig.id },
          data: configData,
        });
      } else {
        await tx.siteConfig.create({
          data: configData,
        });
      }

      await tx.auditLog.create({
        data: {
          userId,
          action: "SYSTEM_CONFIG_UPDATE",
          ipAddress: ip,
          metadata: {
            siteName,
            headerIconType,
            headerIconName,
            backgroundsUpdated: !!finalBgImage1 || !!finalBgImage2,
            banksUpdated: Object.keys(bankAccountsObj).length,
          },
        },
      });
    });

    // 6. PURGA GLOBAL DE CACHÉ PARA REFLEJAR CAMBIOS AL INSTANTE
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("Config Update Error:", error.message);
    return {
      success: false,
      error: "Fallo en la actualización de configuración.",
    };
  }
}

export async function toggleUserStatus(
  targetId: string,
  newStatus: "ACTIVE" | "SUSPENDED",
) {
  try {
    await prisma.user.update({
      where: { id: targetId },
      data: { status: newStatus },
    });
    revalidatePath("/admin/configuracion");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function registerNewOfficer(
  formData: FormData,
  isSuper: boolean,
  adminId: string,
) {
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for") || "127.0.0.1";

  try {
    const creator = await prisma.user.findUnique({ where: { id: adminId } });
    if (creator?.role !== "SUPER_ADMIN") {
      throw new Error(
        "UNAUTHORIZED_RECRUITMENT: Solo un SUPER_ADMIN puede comisionar oficiales.",
      );
    }

    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      throw new Error("INTEGRITY_ERROR: Las contraseñas no coinciden.");
    }

    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passRegex.test(password)) {
      throw new Error(
        "SECURITY_ERROR: La contraseña no cumple los protocolos de complejidad.",
      );
    }

    const email = (formData.get("email") as string).toLowerCase().trim();
    const role = isSuper ? "SUPER_ADMIN" : "ADMIN";
    const hashedPassword = await bcrypt.hash(password, 12);

    let docUrl = "";
    if (isSuper) {
      const file = formData.get("docFile") as File;
      if (!file || file.size === 0) {
        throw new Error(
          "IDENTIFICATION_REQUIRED: Documento obligatorio para SuperAdmin.",
        );
      }

      // PROCESAMIENTO DE DOCUMENTO A BASE64 (Compatible con Vercel)
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64Image = buffer.toString("base64");
      const mimeType = file.type || "image/png";
      docUrl = `data:${mimeType};base64,${base64Image}`;
    }

    await prisma.$transaction([
      prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName: formData.get("firstName") as string,
          lastName: formData.get("lastName") as string,
          phone: formData.get("phone") as string,
          idNumber: formData.get("idNumber") as string,
          role: role,
          idDocumentUrl: docUrl,
          status: "ACTIVE",
        },
      }),
      prisma.auditLog.create({
        data: {
          userId: adminId,
          action: `OFFICER_RECRUITMENT_${role}`,
          ipAddress: ip,
          metadata: { targetEmail: email, role },
        },
      }),
    ]);

    revalidatePath("/admin/configuracion");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteUserAccount(targetId: string) {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.auditLog.deleteMany({ where: { userId: targetId } });
      await tx.transaction.deleteMany({ where: { userId: targetId } });
      await tx.ticket.deleteMany({ where: { userId: targetId } });
      await tx.user.delete({ where: { id: targetId } });
    });

    revalidatePath("/admin/configuracion");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
