import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const envDir = 'envfiles';

  const env = loadEnv(mode, envDir);

  return {
    base: '/airtel-aaa-admin-frontend/',
    //OCP FE access    
    //base: '/',
    plugins: [react()],
    server: {
      port: 3002,
    },
    envDir,
    define: {
      'process.env': env,
    },
    // build: {
    //   rollupOptions: {
    //     output: {
    //       entryFileNames: `data.js`, 
    //       chunkFileNames: `chunk.js`,
    //       assetFileNames: `data.js`,    
    //     },
    //   },
    // }
  };
});

