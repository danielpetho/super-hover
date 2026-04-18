import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  root: path.resolve(__dirname),
  server: {
    port: 5173,
  },
});
