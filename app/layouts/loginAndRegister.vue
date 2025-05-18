<template>
  <div class="min-h-screen flex align-content-center justify-center landing-background">
    <slot />
  </div>
</template>

<script lang="ts" setup>
const isLight = useSSRSafeTheme();

const gradientColor1 = computed(() => isLight.value  ? '#d3dbf2' : 'var(--color-primary-700)');
const gradientColor2 = computed(() => isLight.value  ? 'var(--color-primary-300)' : '#0c1223');
</script>

<style scoped>
.landing-background {
  position: relative;
  background:
    radial-gradient(ellipse 150% 50% at 50% 1%, v-bind(gradientColor2) 0%, transparent 70%),
    radial-gradient(circle at 20% 10%, v-bind(gradientColor1), v-bind(gradientColor2) 75%);
  background-color: #0c0c0c;
  overflow: hidden;
  background-attachment: initial
}
</style>