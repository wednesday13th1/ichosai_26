import {defineConfig} from 'vite';

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/ichosai_26/' : '/'
});
