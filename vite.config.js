import { defineConfig, loadEnv } from "vite";
//import reactRefresh from "@vitejs/plugin-react-refresh";
import react from "@vitejs/plugin-react";
import path from "path";
import rollupReplace from "@rollup/plugin-replace";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    resolve: {
      alias: [
        {
          // "@": path.resolve(__dirname, "./src"),
          find: "@",
          replacement: path.resolve(__dirname, "./src"),
        },
      ],
    },
    
    // Define global constants
    define: {
      'process.env.SERVER_URL': JSON.stringify(env.VITE_SERVER_URL || 'https://www.preciousgoldsmith.net'),
      'process.env.NODE_ENV': JSON.stringify(mode),
    },

    plugins: [
      rollupReplace({
        preventAssignment: true,
        values: {
          __DEV__: JSON.stringify(mode === 'development'),
        },
      }),
      react(),
      //reactRefresh(),
    ],
  };
});
