"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { updateKycDocument } from "@/app/admin/actions"; // Ruta corregida
import {
  UploadCloud,
  FileCheck,
  Loader2,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

interface KYCUploadProps {
  userId: string;
}

export default function KYCUpload({ userId }: KYCUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación de Tamaño (5MB) [cite: 2026-02-13]
    if (file.size > 5 * 1024 * 1024) {
      alert("El archivo es demasiado grande. Máximo 5MB.");
      return;
    }

    setUploading(true);
    setStatus("idle");
    setErrorMessage("");

    const fileExt = file.name.split(".").pop();
    const fileName = `kyc/${userId}-${Date.now()}.${fileExt}`;

    try {
      // 1. Subida al Storage de Supabase
      const { error: uploadError, data } = await supabase.storage
        .from("kyc-documents")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // 2. Obtención de la URL Pública
      const {
        data: { publicUrl },
      } = supabase.storage.from("kyc-documents").getPublicUrl(fileName);

      // 3. Persistencia en base de datos vía Server Action [cite: 2026-02-13]
      const result = await updateKycDocument(userId, publicUrl);

      if (result.success) {
        setStatus("success");
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error("Error en KYC Upload:", error.message);
      setErrorMessage(error.message || "Fallo en la conexión con el servidor.");
      setStatus("error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto animate-in fade-in duration-700">
      <div
        className={`relative group border-4 border-dashed rounded-[3.5rem] p-12 transition-all duration-500 bg-white shadow-2xl ${
          status === "success"
            ? "border-emerald-500/30 bg-emerald-50/10"
            : status === "error"
              ? "border-red-500/30 bg-red-50/10"
              : "border-slate-100 hover:border-primary-dynamic/50 shadow-primary-dynamic/5"
        }`}
      >
        <input
          type="file"
          onChange={handleUpload}
          disabled={uploading || status === "success"}
          className="absolute inset-0 opacity-0 cursor-pointer z-20 disabled:cursor-not-allowed"
          accept="image/*,application/pdf"
        />

        <div className="flex flex-col items-center text-center space-y-6">
          <div className="relative">
            {uploading ? (
              <div className="p-5">
                <Loader2
                  className="animate-spin text-primary-dynamic"
                  size={64}
                />
              </div>
            ) : status === "success" ? (
              <div className="bg-emerald-500 p-6 rounded-3xl text-white animate-in zoom-in shadow-lg shadow-emerald-500/20">
                <FileCheck size={40} />
              </div>
            ) : (
              <div className="bg-slate-900 p-6 rounded-3xl text-white group-hover:scale-110 transition-transform shadow-lg shadow-slate-900/20">
                <UploadCloud size={40} />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-3xl font-black uppercase tracking-tighter italic text-slate-900 leading-none">
              {status === "success" ? "Documento Recibido" : "Verificación KYC"}
            </h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed px-4">
              {status === "success"
                ? "Tu identidad está siendo procesada por nuestro equipo de seguridad."
                : "Carga una copia legible de tu documento de identidad (DNI/Pasaporte)."}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
              Conexión Encriptada SSL AES-256
            </span>
          </div>
        </div>

        {status === "error" && (
          <div className="mt-6 flex items-center justify-center gap-2 text-red-500 animate-bounce">
            <AlertCircle size={16} />
            <p className="text-[10px] font-black uppercase tracking-widest">
              {errorMessage || "Error en la carga. Reintenta."}
            </p>
          </div>
        )}
      </div>

      <p className="mt-8 text-center text-[9px] text-slate-400 font-bold uppercase tracking-[0.3em] opacity-60">
        Cumplimiento normativo de activos digitales [cite: 2026-02-13]
      </p>
    </div>
  );
}
