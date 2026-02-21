import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Palette, Layout, Save } from "lucide-react";

export default async function AdminDisenoPage() {
  // 1. LECTURA DIRECTA DE BASE DE DATOS (Elimina el error de getConfig)
  const config = await prisma.siteConfig.findFirst();

  // 2. SERVER ACTION INTEGRADA (Elimina el error de updateConfig)
  async function updateDesignConfig(formData: FormData) {
    "use server";

    const colorPrincipal = formData.get("colorPrincipal") as string;
    const colorSecundario = formData.get("colorSecundario") as string;
    const siteName = formData.get("siteName") as string;

    const existingConfig = await prisma.siteConfig.findFirst();

    if (existingConfig) {
      await prisma.siteConfig.update({
        where: { id: existingConfig.id },
        data: { colorPrincipal, colorSecundario, siteName },
      });
    } else {
      await prisma.siteConfig.create({
        data: { colorPrincipal, colorSecundario, siteName },
      });
    }

    // Refresca la caché de todo el layout para aplicar los colores al instante
    revalidatePath("/", "layout");
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <header>
        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic">
          Personalización
        </h1>
        <p className="text-slate-500 font-medium">
          Controla el branding y la identidad visual de tu plataforma.
        </p>
      </header>

      {/* Se inyecta la Server Action autónoma */}
      <form action={updateDesignConfig} className="space-y-8">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <Palette size={24} />
            </div>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
              Esquema de Colores
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Color Principal (Botones y Enlaces)
              </label>
              <div className="flex gap-4">
                <input
                  name="colorPrincipal"
                  type="color"
                  defaultValue={config?.colorPrincipal || "#2563eb"}
                  className="w-20 h-20 rounded-2xl cursor-pointer border-4 border-slate-50 shadow-inner"
                />
                <input
                  type="text"
                  placeholder="#000000"
                  className="flex-1 p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-mono font-bold outline-none focus:border-primary uppercase text-slate-700"
                  defaultValue={config?.colorPrincipal || "#2563eb"}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Color Secundario (Fondos y Paneles)
              </label>
              <div className="flex gap-4">
                <input
                  name="colorSecundario"
                  type="color"
                  defaultValue={config?.colorSecundario || "#0f172a"}
                  className="w-20 h-20 rounded-2xl cursor-pointer border-4 border-slate-50 shadow-inner"
                />
                <input
                  type="text"
                  placeholder="#000000"
                  className="flex-1 p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-mono font-bold outline-none focus:border-primary uppercase text-slate-700"
                  defaultValue={config?.colorSecundario || "#0f172a"}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-slate-100 rounded-2xl text-slate-600">
              <Layout size={24} />
            </div>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
              Identidad del Sitio
            </h2>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Nombre Comercial
            </label>
            <input
              name="siteName"
              type="text"
              defaultValue={config?.siteName || "Sorteos Pro"}
              className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-primary text-slate-700"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-slate-900 text-white font-black py-6 rounded-[2rem] hover:bg-slate-800 transition-all uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-3"
        >
          <Save size={18} /> Guardar Cambios de Estilo
        </button>
      </form>
    </div>
  );
}
