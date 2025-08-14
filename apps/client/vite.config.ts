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
    host: '0.0.0.0', // Allow external access
    port: 3000,
    strictPort: true, // Fail if port is already in use
    allowedHosts: [
      "2fd9-2400-1a00-b040-c463-d14c-df81-1a3e-d1e7.ngrok-free.app",
      "161.129.67.102", // Your server IP
      "localhost",
      "127.0.0.1"
    ],
  },

  build: {
    chunkSizeWarningLimit: 1000,
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
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-slot',
            '@radix-ui/react-tabs',
            'class-variance-authority',
            'clsx',
            'tailwind-merge',
            'lucide-react'
          ],
          'utils-vendor': ['axios', 'zod'],
          'query-vendor': ['@tanstack/react-query'],
          'common': ['@ebusewa/common']
        }
      },
    },
  },
});
