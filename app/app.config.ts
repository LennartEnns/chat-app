export default defineAppConfig({
  // https://ui.nuxt.com/getting-started/theme#design-system
  ui: {
    textarea:{
      slots: {
        base: ['w-full rounded-md border-0 placeholder:text-dimmed focus:outline-none disabled:cursor-default disabled:opacity-75','transition-colors']
      }
    },
    colors: {
      primary: 'primaryMain',
      neutral: 'neutralMain',
    },
    button: {
      defaultVariants: {
        // Set default button color to neutral
        // color: 'neutral'
      }
    }
  }
})
