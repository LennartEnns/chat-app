<template>
  <AuthFlowInfoCard v-if="route.query.error" operation-title="Password Reset" class="m-auto" />
</template>

<script lang="ts" setup>
const route = useRoute();
const supabase = useSupabaseClient();
const { error: updateError } = await supabase.auth.updateUser({
  password: '12345678',
})
console.log(updateError)
</script>

<style>

</style>