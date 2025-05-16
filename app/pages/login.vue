<template>
  <div class="min-h-screen flex align-content-center justify-center landing-background">
    <LoginForm class="m-auto" />
  </div>
</template>

<script lang="ts" setup>
import LoginForm from '~/components/Form/LoginForm.vue';
</script>

<style scoped>
.landing-background {
  position: relative;
  background:
    radial-gradient(ellipse 150% 50% at 50% 1%, #0C1223 0%, transparent 70%),
    radial-gradient(circle at 20% 10%, var(--color-primary-700), #0C1223 75%);
  background-color: #0c0c0c;
  overflow: hidden;
  background-attachment: initial
}
</style>
