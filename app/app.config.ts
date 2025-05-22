export default defineAppConfig({
  // https://ui.nuxt.com/getting-started/theme#design-system
  ui: {
    textarea:{
      slots: {
        base: ['w-full rounded-md border-0 placeholder:text-dimmed focus:outline-none disabled:cursor-default disabled:opacity-75','transition-colors']
      }
    },
    colors: {
      primary: 'defaultPrimary',
      neutral: 'neutral',
      /* 
      secondary: 'secondaryMain',
      tertiary: 'bgMain',
      success: 'successMain',
      info: 'infoMain',
      warning: 'warningMain',
      error: 'errorMain', */
    },
    button: {
      defaultVariants: {
        // Set default button color to neutral
        // color: 'neutral'
      }
    }
  }
})
