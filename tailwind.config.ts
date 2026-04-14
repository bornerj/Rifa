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
          50: "#f0fdfa",
          100: "#ccfbf1",
          500: "#14b8a6",
          700: "#0f766e",
          900: "#134e4a",
        },
        accent: {
          300: "#fcd34d",
          500: "#f59e0b",
          700: "#b45309",
        },
        ink: "#0f172a",
        paper: "#fffaf0",
      },
      boxShadow: {
        raffle: "0 18px 45px rgba(15, 118, 110, 0.14)",
      },
      backgroundImage: {
        "raffle-glow":
          "radial-gradient(circle at top, rgba(20, 184, 166, 0.18), transparent 36%), radial-gradient(circle at bottom right, rgba(245, 158, 11, 0.24), transparent 28%)",
      },
    },
  },
  plugins: [],
};

export default config;
