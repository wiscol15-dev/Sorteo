"use client";

import { useState } from "react";
import { createRaffle } from "./actions";

export default function SorteoForm() {
  const [raffleType, setRaffleType] = useState<"INTERNAL" | "EXTERNAL">(
    "INTERNAL",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAction = async (formData: FormData) => {
    setErrorMessage(null);
    setIsSubmitting(true);

    const result = await createRaffle(formData);

    if (result && !result.success && result.error) {
      setErrorMessage(result.error);
      setIsSubmitting(false);
    }
  };

  return (
    <form
      action={handleAction}
      className="w-full max-w-2xl bg-white p-6 rounded-lg shadow-md flex flex-col gap-6"
    >
      {errorMessage && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <p className="text-sm font-medium text-red-800">{errorMessage}</p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="title" className="text-sm font-semibold text-gray-700">
          Título del Sorteo
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="description"
          className="text-sm font-semibold text-gray-700"
        >
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="pricePerTicket"
            className="text-sm font-semibold text-gray-700"
          >
            Precio por Boleto
          </label>
          <input
            type="number"
            step="0.01"
            id="pricePerTicket"
            name="pricePerTicket"
            required
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="maxTickets"
            className="text-sm font-semibold text-gray-700"
          >
            Límite de Boletos
          </label>
          <input
            type="number"
            id="maxTickets"
            name="maxTickets"
            required
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="minSoldThreshold"
            className="text-sm font-semibold text-gray-700"
          >
            Mínimo Vendido (%)
          </label>
          <input
            type="number"
            id="minSoldThreshold"
            name="minSoldThreshold"
            defaultValue="90"
            required
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="drawDate"
            className="text-sm font-semibold text-gray-700"
          >
            Fecha del Sorteo
          </label>
          <input
            type="datetime-local"
            id="drawDate"
            name="drawDate"
            required
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="imageFile"
            className="text-sm font-semibold text-gray-700"
          >
            Subir Archivo de Imagen
          </label>
          <input
            type="file"
            id="imageFile"
            name="imageFile"
            accept="image/*"
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="imageUrl"
            className="text-sm font-semibold text-gray-700"
          >
            O pegar URL de Imagen
          </label>
          <input
            type="url"
            id="imageUrl"
            name="imageUrl"
            placeholder="https://ejemplo.com/imagen.jpg"
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="p-4 border border-blue-100 bg-blue-50 rounded-md flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="type" className="text-sm font-semibold text-blue-900">
            Modalidad de Resolución
          </label>
          <select
            id="type"
            name="type"
            value={raffleType}
            onChange={(e) =>
              setRaffleType(e.target.value as "INTERNAL" | "EXTERNAL")
            }
            className="border border-blue-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="INTERNAL">Sorteo Interno (Automático)</option>
            <option value="EXTERNAL">Sorteo Externo (Manual)</option>
          </select>
        </div>

        {raffleType === "EXTERNAL" && (
          <div className="flex flex-col gap-2 animate-fade-in">
            <label
              htmlFor="winningNumber"
              className="text-sm font-semibold text-blue-900"
            >
              Número Ganador Oficial
            </label>
            <input
              type="number"
              id="winningNumber"
              name="winningNumber"
              required={raffleType === "EXTERNAL"}
              className="border border-blue-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: 4521"
            />
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full text-white font-bold py-3 px-4 rounded-md transition-colors mt-2 ${isSubmitting ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
      >
        {isSubmitting ? "Procesando..." : "Crear Sorteo"}
      </button>
    </form>
  );
}
