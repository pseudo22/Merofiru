import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  //environment variables
  const env = loadEnv(mode,process.cwd());

  return {
    plugins: [react()],
    define: {
    }
  };
});
