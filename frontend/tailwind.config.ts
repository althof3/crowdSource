import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0D0F14",
        card: "#13161E",
        accent: "#4F8EF7",
        green_verified: "#22C55E",
        orange_pothole: "#F97316",
        red_crime: "#EF4444",
      },
    },
  },
  plugins: [],
};
export default config;
