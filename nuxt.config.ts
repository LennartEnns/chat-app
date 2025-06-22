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
      baseUrl: process.env.BASE_URL ?? process.env.NUXT_PUBLIC_BASE_URL,
    },
  },

  css: ['~/assets/css/main.css'],

  future: {
    compatibilityVersion: 4
  },

  compatibilityDate: '2024-11-27',

  supabase: {
    url: process.env.SUPABASE_URL ?? process.env.NUXT_PUBLIC_SUPABASE_URL,
    key: process.env.SUPABASE_ANON_KEY ?? process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY,
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