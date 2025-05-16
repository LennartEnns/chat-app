<template>
  <div class="min-h-screen flex align-content-center justify-center">
    <LoginForm class="m-auto" />
  </div>
</template>

<script lang="ts" setup>
import LoginForm from '~/components/Form/LoginForm.vue';

// Workaround: Ignore code because exchangeCodeForSession does not work
const route = useRoute()
if (route.query.code) navigateTo("/login");
</script>

<style>

</style>
