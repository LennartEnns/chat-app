<template>
  <NuxtLayout name="gradient-background">
    <LandingPageHeader :logged-in="false" />
    <LoginForm class="m-auto" />
  </NuxtLayout>
</template>

<script lang="ts" setup>
import LoginForm from '~/components/Form/AuthFlow/LoginForm.vue';
</script>

<style scoped>

</style>
