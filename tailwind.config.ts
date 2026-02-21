import type { Config } from "tailwindcss";

const config: Config = {
  // 1. CONTENT: Escaneo de archivos en las rutas correctas
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    // 2. BREAKPOINTS EXTREMOS: Estructurados en la raíz para respetar el "Móvil Primero"
    screens: {
      xs: "375px", // Teléfonos pequeños (iPhone SE)
      sm: "640px", // Teléfonos estándar
      md: "768px", // Tablets (iPad)
      lg: "1024px", // Laptops / Pantallas estándar
      xl: "1280px", // Monitores de escritorio
      "2xl": "1536px", // Monitores grandes
      "3xl": "1920px", // Pantallas Full HD / Laptops Gaming
      tv: "2560px", // Smart TVs / Monitores Ultrawide y 4K
    },
    extend: {
      // 3. COLORES DINÁMICOS: Conectados mediante CSS nativo con tu RootLayout
      colors: {
        primary: {
          DEFAULT: "var(--primary-color)",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "var(--secondary-color)",
          foreground: "#ffffff",
        },
        // Mantenemos la variable dinámica principal de la plataforma
        "primary-dynamic": "var(--primary-brand)",
      },
      // 4. TIPOGRAFÍA
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui"],
      },
      // 5. ANIMACIONES PREMIUM DE GRADO OPERATIVO
      keyframes: {
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-5px)" },
          "75%": { transform: "translateX(5px)" },
        },
        "fade-in-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
      animation: {
        shake: "shake 0.2s ease-in-out 0s 2",
        "fade-in-up": "fade-in-up 0.5s ease-out forwards",
        "spin-slow": "spin 3s linear infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"), // Extensión para animaciones fluidas UI
  ],
};

export default config;
