import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: "/", //배포용
  plugins: [react()],
  resolve: {
    alias: {
      global: 'globalthis', // 여전히 alias 추가
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis', // 핵심: SockJS가 사용하는 global 정의
      },
    },
  },
});
