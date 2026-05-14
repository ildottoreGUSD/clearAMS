import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/player/",
  build: {
    outDir: "dist",
    rollupOptions: {
      input: { player: "player.html" },
    },
  },
  server: { port: 3001 },
});
