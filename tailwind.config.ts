import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: "#F3F000",
          black: "#121212",
          "black-deep": "#0e0e0e",
          card: "#1B1B1B",
          border: "#2C2C2C",
          muted: "#9E9E9E",
          red: "#E62429",
          surface: "#141313",
          white: "#F8F8F6",
        },
      },
      fontFamily: {
        comic: ["Anton", "Bebas Neue", "Impact", "sans-serif"],
        sans: ["Inter", "Work Sans", "system-ui", "sans-serif"],
        editorial: ["Work Sans", "Inter", "sans-serif"],
      },
      boxShadow: {
        "comic-yellow": "4px 4px 0px 0px #F3F000",
        "comic-yellow-lg": "6px 6px 0px 0px #F3F000",
        "comic-black": "4px 4px 0px 0px #000000",
        "comic-red": "4px 4px 0px 0px #E62429",
        "comic-sm": "2px 2px 0px 0px #F3F000",
        "card-shadow": "0px 10px 30px rgba(0, 0, 0, 0.85)",
      },
    },
  },
  plugins: [],
};

export default config;
