"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
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

    let finalHeaderImageUrl: string | undefined = undefined;

    if (headerIconType === "IMAGE") {
      const imageFile = formData.get("headerImageFile") as File | null;
      if (imageFile && imageFile.size > 0) {
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filename = `header-custom-${Date.now()}.png`;
        const uploadDir = path.join(
          process.cwd(),
          "public",
          "uploads",
          "config",
        );

        await mkdir(uploadDir, { recursive: true });
        await writeFile(path.join(uploadDir, filename), buffer);
        finalHeaderImageUrl = `/uploads/config/${filename}`;
      }
    }

    const currentConfig = await prisma.siteConfig.findFirst();

    const configData = {
      siteName,
      heroText,
      colorPrincipal,
      colorSecundario,
      cardBgColor,
      cardTextColor,
      headerIconType,
      headerIconName,
      ...(finalHeaderImageUrl && { headerImageUrl: finalHeaderImageUrl }),
    };

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
          },
        },
      });
    });

    revalidatePath("/", "layout");
    revalidatePath("/admin/configuracion");
    return { success: true };
  } catch (error: any) {
    console.error("Falló la actualización de ADN:", error.message);
    return { success: false, error: error.message };
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
      if (!file || file.size === 0)
        throw new Error(
          "IDENTIFICATION_REQUIRED: Documento obligatorio para SuperAdmin.",
        );

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `clearance-${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
      const uploadDir = path.join(process.cwd(), "public", "security");

      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, filename), buffer);
      docUrl = `/security/${filename}`;
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
    console.error("Error crítico al eliminar oficial:", error.message);
    return { success: false, error: error.message };
  }
}
