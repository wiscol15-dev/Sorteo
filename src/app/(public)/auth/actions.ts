"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { hash, compare } from "bcryptjs";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("session_token");
  revalidatePath("/", "layout");
  redirect("/");
}

export async function login(formData: FormData) {
  try {
    const email = (formData.get("email") as string).toLowerCase().trim();
    const password = formData.get("password") as string;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password) {
      return { success: false, error: "Credenciales no válidas." };
    }

    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      return { success: false, error: "Contraseña incorrecta." };
    }

    if (!user.isVerified && user.role === "USER") {
      return { success: false, error: "Tu cuenta está en revisión KYC." };
    }

    const cookieStore = await cookies();
    cookieStore.set("session_token", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    revalidatePath("/", "layout");
    const destination =
      user.role === "ADMIN" || user.role === "SUPER_ADMIN" ? "/admin" : "/";
    return { success: true, redirectTo: destination };
  } catch (error) {
    return {
      success: false,
      error: "Fallo crítico en el motor de autenticación.",
    };
  }
}

export async function registerUser(formData: FormData) {
  try {
    const email = (formData.get("email") as string).toLowerCase().trim();
    const password = formData.get("password") as string;
    const firstName = (formData.get("firstName") as string).trim();
    const lastName = (formData.get("lastName") as string).trim();
    const idNumber = (formData.get("idNumber") as string).trim();
    const phone = (formData.get("phone") as string).trim();
    const idFile = formData.get("idFile") as File | null;

    if (
      !email ||
      !password ||
      !firstName ||
      !lastName ||
      !idNumber ||
      !idFile ||
      idFile.size === 0
    ) {
      return {
        success: false,
        error:
          "Todos los campos, incluyendo el documento de identidad, son requeridos.",
      };
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { idNumber }],
      },
    });

    if (existingUser) {
      return {
        success: false,
        error:
          "El correo electrónico o número de identidad ya se encuentran registrados.",
      };
    }

    let finalIdCardUrl: string | null = null;
    const bytes = await idFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = `kyc-${idNumber}-${uniqueSuffix}.jpg`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "kyc");

    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);
    finalIdCardUrl = `/uploads/kyc/${filename}`;

    const hashedPassword = await hash(password, 12);

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        idNumber,
        phone,
        idCardUrl: finalIdCardUrl,
        isVerified: false,
        role: "USER",
        status: "ACTIVE",
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error("REGISTRATION_INTERNAL_ERROR:", error);
    return {
      success: false,
      error: "Fallo en los protocolos de registro. Intente más tarde.",
    };
  }
}
