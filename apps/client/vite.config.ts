import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

export default defineConfig({
  // 1. Emit all asset URLs relative to the HTML file
  base: "./",

  // 2. Polyfill process.env.NODE_ENV in the bundle
  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    global: "globalThis",
  },

  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      // 3. Alias `process` to the browser shim
      process: "process/browser",
    },
  },

  optimizeDeps: {
    // ensure the browser-shimmed `process` gets pre-bundled
    include: ["process/browser"],
  },

  server: {
    host: true,
    port: 3000,
    allowedHosts: [
      "2fd9-2400-1a00-b040-c463-d14c-df81-1a3e-d1e7.ngrok-free.app",
    ],
  },

  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      external: [
        "winston",
        "util",
        "os",
        "fs",
        "path",
        "zlib",
        "http",
        "https",
        "buffer",
        "events",
      ],
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return id
              .toString()
              .split("node_modules/")[1]
              .split("/")[0]
              .toString();
          }
        },
      },
    },
  },
});
