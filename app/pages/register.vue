<template>
  <NuxtLayout name="gradient-background">
    <LandingPageHeader :logged-in="false" />
    <RegistrationForm class="m-auto" />
  </NuxtLayout>
</template>

<script lang="ts" setup>
import RegistrationForm from '~/components/Form/AuthFlow/RegistrationForm.vue';
</script>

<style scoped>

</style>
