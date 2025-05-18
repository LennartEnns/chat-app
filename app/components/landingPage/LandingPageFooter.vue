<template>
  <footer :class="`footer-bar ${isLight ? 'text-neutral-800' : 'text-neutral-50'}`">
    <p>
      © 2025 YapSpace · <a href="#" class="footer-link">Terms & Conditions</a> · <a href="#" class="footer-link">Privacy</a>
    </p>
  </footer>
</template>
  
<script setup>
const isLight = useSSRSafeTheme()
</script>
  
<style scoped>
  .footer-bar {
    padding: 1rem;
    text-align: center;
    font-size: 0.875rem;
    z-index: 1;
  }
  .footer-link {
    text-decoration: underline;
    margin: 0 0.5rem;
  }
</style>