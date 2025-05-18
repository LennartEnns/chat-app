// Detects screens that are less than 768px wide
export const useMobileDetector = () => {
  const isMobile = ref(false)
  onMounted(() => {
    const check = () => isMobile.value = (window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
  })

  return isMobile;
}
