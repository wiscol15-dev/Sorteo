"use client";

import React, { useState, useEffect } from "react";
import {
  Image as ImageIcon,
  Grid,
  UploadCloud,
  CheckCircle2,
  Ticket,
  Trophy,
  Gift,
  Crown,
  Coins,
  Banknote,
  Wallet,
  CreditCard,
  Gem,
  Star,
  Award,
  Medal,
  Target,
  Flag,
  MapPin,
  Rocket,
  Zap,
  Flame,
  Heart,
  ThumbsUp,
} from "lucide-react";

export const iconMap: Record<string, React.ElementType> = {
  Ticket,
  Trophy,
  Gift,
  Crown,
  Coins,
  Banknote,
  Wallet,
  CreditCard,
  Gem,
  Star,
  Award,
  Medal,
  Target,
  Flag,
  MapPin,
  Rocket,
  Zap,
  Flame,
  Heart,
  ThumbsUp,
};

interface Props {
  defaultType: string;
  defaultName: string;
  defaultImageUrl: string | null;
  isSuper: boolean;
}

export default function HeaderIconSelector({
  defaultType,
  defaultName,
  defaultImageUrl,
  isSuper,
}: Props) {
  const [activeTab, setActiveTab] = useState<string>(defaultType);
  const [selectedIcon, setSelectedIcon] = useState<string>(defaultName);
  const [previewUrl, setPreviewUrl] = useState<string | null>(defaultImageUrl);

  return (
    <div className="bg-black/30 p-6 rounded-2xl border border-white/5 space-y-5">
      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-3">
        <Target size={14} className="text-primary-dynamic" /> 0. Icono Superior
        (Header)
      </h4>

      <input type="hidden" name="headerIconType" value={activeTab} />
      <input type="hidden" name="headerIconName" value={selectedIcon} />

      <div className="flex bg-black/40 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => setActiveTab("ICON")}
          disabled={!isSuper}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
            activeTab === "ICON"
              ? "bg-primary-dynamic text-white shadow-lg"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <Grid size={14} /> Lista de Iconos
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("IMAGE")}
          disabled={!isSuper}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
            activeTab === "IMAGE"
              ? "bg-primary-dynamic text-white shadow-lg"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <ImageIcon size={14} /> Subir Imagen Propia
        </button>
      </div>

      {activeTab === "ICON" ? (
        <div className="grid grid-cols-5 gap-3 p-2 bg-black/20 rounded-xl max-h-48 overflow-y-auto custom-scrollbar">
          {Object.entries(iconMap).map(([name, IconComponent]) => (
            <button
              key={name}
              type="button"
              disabled={!isSuper}
              onClick={() => setSelectedIcon(name)}
              className={`p-3 rounded-xl flex items-center justify-center border-2 transition-all relative group ${
                selectedIcon === name
                  ? "border-primary-dynamic bg-primary-dynamic/20 text-primary-dynamic"
                  : "border-white/5 bg-white/5 text-slate-400 hover:border-white/20 hover:text-white"
              }`}
            >
              <IconComponent size={20} />
              {selectedIcon === name && (
                <div className="absolute -top-1 -right-1 bg-primary-dynamic text-black rounded-full p-0.5">
                  <CheckCircle2 size={10} />
                </div>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <label
            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl transition-all group relative overflow-hidden ${!isSuper ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-white/5 border-white/10 hover:border-primary-dynamic/50"}`}
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-contain p-2 z-10"
              />
            ) : (
              <div className="flex flex-col items-center justify-center pt-5 pb-6 z-10">
                <UploadCloud
                  size={24}
                  className="text-slate-400 mb-2 group-hover:text-primary-dynamic transition-colors"
                />
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                  Click para subir imagen (PNG/JPG)
                </p>
              </div>
            )}

            {/* Input de archivo real */}
            <input
              type="file"
              name="headerImageFile"
              accept="image/png, image/jpeg, image/svg+xml"
              disabled={!isSuper}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setPreviewUrl(URL.createObjectURL(file));
                }
              }}
            />
            {previewUrl && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[9px] text-white font-black uppercase">
                  Cambiar Imagen
                </p>
              </div>
            )}
          </label>
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest text-center">
            Nota: Las imágenes propias NO cambian de color con el tema.
          </p>
        </div>
      )}
    </div>
  );
}
