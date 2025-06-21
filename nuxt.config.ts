// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  vite: {
    esbuild: {
      drop: ['console', 'debugger'], // remove all console.* and debugger statements in production
    },
  },

  modules: [
    '@nuxt/ui',
    '@nuxt/eslint',
    '@nuxtjs/supabase',
    'nuxt-particles',
    '@nuxt/image',
  ],
  runtimeConfig: {
    public: {
      baseUrl: process.env.NUXT_BASE_URL,
    },
  },

  css: ['~/assets/css/main.css'],

  future: {
    compatibilityVersion: 4
  },

  compatibilityDate: '2024-11-27',

  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/', '/register', '/flow/**'],
    },
    types: '~~/database.types.ts',
  },

  particles: {
    mode: 'slim',
    lazy: true,
  }
})