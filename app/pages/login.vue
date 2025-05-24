<template>
  <NuxtLayout name="gradient-background">
    <LandingPageHeader />
    <LoginForm class="m-auto" />
  </NuxtLayout>
</template>

<script lang="ts" setup>
import LoginForm from '~/components/Form/LoginForm.vue';

// Workaround: Ignore code because exchangeCodeForSession does not work
// const route = useRoute()
// if (route.query.code) navigateTo("/login");
</script>

<style scoped>

</style>
