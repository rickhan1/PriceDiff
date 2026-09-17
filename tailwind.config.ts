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
        coupang: {
          DEFAULT: "#E61E2B",
          dark: "#C01420",
          light: "#FFF1F2",
        },
        toss: {
          DEFAULT: "#0064FF",
          dark: "#0050D0",
          light: "#E8F3FF",
        },
      },
    },
  },
  plugins: [],
};
export default config;
