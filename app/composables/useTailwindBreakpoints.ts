export const useTailwindBreakpoints = () => {
  const breakpoints = {
    'sm': 640,
    'md': 768,
    'lg': 1024,
    'xl': 1280,
    '2xl': 1536,
  }

  // Boolean refs for each breakpoint
  const smOrAbove = ref(false)
  const mdOrAbove = ref(false)
  const lgOrAbove = ref(false)
  const xlOrAbove = ref(false)
  const _2xlOrAbove = ref(false)

  const updateFlags = () => {
    const width = window.innerWidth
    smOrAbove.value = width >= breakpoints.sm
    mdOrAbove.value = width >= breakpoints.md
    lgOrAbove.value = width >= breakpoints.lg
    xlOrAbove.value = width >= breakpoints.xl
    _2xlOrAbove.value = width >= breakpoints['2xl']
  }

  // Keep flags updated
  onMounted(() => {
    updateFlags()
    window.addEventListener('resize', updateFlags)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', updateFlags)
  })

  return {
    smOrAbove,
    mdOrAbove,
    lgOrAbove,
    xlOrAbove,
    _2xlOrAbove,
  }
}
