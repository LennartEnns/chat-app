<template>
  <div
    :class="`min-h-dvh flex flex-col align-content-center justify-center ${
      isLight ? 'landing-background-light' : 'landing-background-dark'
    }`"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup>
const { isLight } = useSSRSafeTheme();

const gradientColor1 = computed(() =>
  isLight.value ? "#fff7ff" : "var(--ui-color-primary-700)"
);
const gradientColor2 = computed(() =>
  isLight.value ? "var(--ui-color-primary-800)" : "#0c1223"
);
</script>

<style scoped>
.landing-background-light {
  color: #fff7ff;
  position: relative;
  background: radial-gradient(
      ellipse 150% 70% at 20% 1%,
      v-bind(gradientColor1) 0%,
      transparent 70%
    ),
    radial-gradient(
      circle at 20% 10%,
      v-bind(gradientColor2),
      v-bind(gradientColor1) 85%
    );
  background-color: #0c0c0c;
  background-attachment: initial;
}
.landing-background-dark {
  position: relative;
  background: radial-gradient(
      ellipse 150% 50% at 50% 1%,
      v-bind(gradientColor2) 0%,
      transparent 70%
    ),
    radial-gradient(
      circle at 20% 10%,
      v-bind(gradientColor1),
      v-bind(gradientColor2) 75%
    );
  background-color: #0c0c0c;
  background-attachment: initial;
}
</style>
