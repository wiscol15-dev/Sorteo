"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Ticket,
  Image as ImageIcon,
  Calendar,
  DollarSign,
  Hash,
  Target,
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  UploadCloud,
  Link as LinkIcon,
} from "lucide-react";
import { updateRaffle } from "../../actions";

export default function EditForm({ raffle }: { raffle: any }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [imageMode, setImageMode] = useState<"url" | "file">("file");
  const [imagePreview, setImagePreview] = useState<string | null>(
    raffle.imageUrl || null,
  );

  const formattedDate = new Date(raffle.drawDate).toISOString().slice(0, 16);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(raffle.imageUrl || null);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImagePreview(e.target.value || raffle.imageUrl || null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const response = await updateRaffle(raffle.id, formData);

      if (response && !response.success) {
        setError(
          response.error ||
            "Ocurrió un error inesperado al actualizar el sorteo.",
        );
        setIsLoading(false);
      }
    } catch (err) {
      setError(
        "Fallo de conexión con el servidor. Por favor, intenta de nuevo.",
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <Link
            href="/admin/sorteos"
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft size={14} /> Volver a Sorteos
          </Link>
          <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">
            Editar <span className="text-primary">Sorteo</span>
          </h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2 italic">
            Modificación de evento premium
          </p>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 text-red-600 p-5 rounded-3xl flex items-center gap-3 text-xs font-black uppercase tracking-widest border border-red-100 shadow-sm animate-in zoom-in-95">
          <AlertCircle size={20} className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-10 rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)] border border-slate-100 space-y-6">
            <h3 className="text-xl font-black uppercase italic tracking-widest text-slate-900 border-b border-slate-50 pb-4">
              Información General
            </h3>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">
                Título del Sorteo
              </label>
              <div className="relative">
                <Ticket
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"
                  size={18}
                />
                <input
                  name="title"
                  type="text"
                  required
                  defaultValue={raffle.title}
                  disabled={isLoading}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white p-5 pl-14 rounded-3xl outline-none transition-all font-bold text-slate-900 disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">
                Descripción Completa
              </label>
              <textarea
                name="description"
                required
                rows={4}
                defaultValue={raffle.description}
                disabled={isLoading}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white p-5 rounded-3xl outline-none transition-all font-bold text-slate-900 resize-none disabled:opacity-50"
              />
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-50">
              <div className="flex items-center justify-between ml-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Imagen del Premio (Opcional)
                </label>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setImageMode("file");
                    }}
                    className={`text-[9px] font-black uppercase px-4 py-2 rounded-lg transition-all flex items-center gap-1 ${imageMode === "file" ? "bg-white shadow-sm text-primary" : "text-slate-400 hover:text-slate-600"}`}
                  >
                    <UploadCloud size={12} /> Archivo Local
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImageMode("url");
                    }}
                    className={`text-[9px] font-black uppercase px-4 py-2 rounded-lg transition-all flex items-center gap-1 ${imageMode === "url" ? "bg-white shadow-sm text-primary" : "text-slate-400 hover:text-slate-600"}`}
                  >
                    <LinkIcon size={12} /> Usar Link
                  </button>
                </div>
              </div>

              {imageMode === "file" ? (
                <div className="relative group cursor-pointer">
                  <input
                    type="file"
                    name="imageFile"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isLoading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div
                    className={`w-full border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center transition-all ${imagePreview ? "border-primary/50 bg-primary/5" : "border-slate-200 bg-slate-50 hover:border-primary/50 hover:bg-white"}`}
                  >
                    {imagePreview ? (
                      <div className="relative w-full h-48 rounded-xl overflow-hidden shadow-inner">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <>
                        <div className="bg-white p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                          <ImageIcon className="text-slate-400" size={32} />
                        </div>
                        <p className="text-sm font-bold text-slate-600">
                          Haz clic o arrastra una nueva imagen aquí
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-2">
                          Dejar vacío para conservar la actual
                        </p>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <LinkIcon
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"
                    size={18}
                  />
                  <input
                    name="imageUrl"
                    type="url"
                    onChange={handleUrlChange}
                    disabled={isLoading}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white p-5 pl-14 rounded-3xl outline-none transition-all font-bold text-slate-900 disabled:opacity-50"
                  />
                  {imagePreview && (
                    <div className="mt-4 relative w-full h-48 rounded-2xl overflow-hidden shadow-inner border border-slate-100">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden text-white space-y-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>

            <h3 className="text-xl font-black uppercase italic tracking-widest text-white/90 border-b border-white/10 pb-4 relative z-10">
              Métricas
            </h3>

            <div className="space-y-2 relative z-10">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
                Precio por Boleto ($)
              </label>
              <div className="relative">
                <DollarSign
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"
                  size={18}
                />
                <input
                  name="pricePerTicket"
                  type="number"
                  step="0.01"
                  min="0.1"
                  required
                  defaultValue={raffle.pricePerTicket}
                  disabled={isLoading}
                  className="w-full bg-white/10 border-2 border-transparent focus:border-primary focus:bg-white/20 p-5 pl-14 rounded-3xl outline-none transition-all font-black text-white disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-2 relative z-10">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
                Cantidad de Boletos
              </label>
              <div className="relative">
                <Hash
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"
                  size={18}
                />
                <input
                  name="maxTickets"
                  type="number"
                  min="10"
                  required
                  defaultValue={raffle.maxTickets}
                  disabled={isLoading}
                  className="w-full bg-white/10 border-2 border-transparent focus:border-primary focus:bg-white/20 p-5 pl-14 rounded-3xl outline-none transition-all font-black text-white disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-2 relative z-10">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
                Meta mínima de venta (%)
              </label>
              <div className="relative">
                <Target
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"
                  size={18}
                />
                <input
                  name="minSoldThreshold"
                  type="number"
                  min="1"
                  max="100"
                  required
                  defaultValue={raffle.minSoldThreshold * 100}
                  disabled={isLoading}
                  className="w-full bg-white/10 border-2 border-transparent focus:border-primary focus:bg-white/20 p-5 pl-14 rounded-3xl outline-none transition-all font-black text-white disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-2 relative z-10">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
                Fecha Programada
              </label>
              <div className="relative">
                <Calendar
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500"
                  size={18}
                />
                <input
                  name="drawDate"
                  type="datetime-local"
                  required
                  defaultValue={formattedDate}
                  disabled={isLoading}
                  className="w-full bg-white/10 border-2 border-transparent focus:border-primary focus:bg-white/20 p-5 pl-14 rounded-3xl outline-none transition-all font-black text-white appearance-none disabled:opacity-50"
                  style={{ colorScheme: "dark" }}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-white p-7 rounded-[2.5rem] font-black uppercase text-sm tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-[0_20px_40px_-15px_rgba(37,99,235,0.5)] group disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-1"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Actualizando...
              </>
            ) : (
              <>
                <Save
                  size={20}
                  className="group-hover:scale-110 transition-transform"
                />
                Actualizar Sorteo Oficial
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
