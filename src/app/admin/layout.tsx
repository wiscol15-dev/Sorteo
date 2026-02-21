import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SidebarAdmin from "@/components/admin/SidebarAdmin";
import prisma from "@/lib/prisma";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;

  if (!sessionToken) {
    redirect("/auth/login");
  }

  // Ejecución en paralelo: Validación de usuario + Conteo de tareas pendientes
  const [user, pendingUsersCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: sessionToken },
      select: {
        id: true,
        role: true,
        firstName: true,
        lastName: true,
      },
    }),
    prisma.user.count({
      where: {
        role: "USER",
        isVerified: false,
      },
    }),
  ]);

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    redirect("/");
  }

  return (
    <AdminLayoutClient
      user={user}
      sidebar={
        <SidebarAdmin role={user.role} pendingUsers={pendingUsersCount} />
      }
    >
      {children}
    </AdminLayoutClient>
  );
}
