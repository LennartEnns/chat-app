<template>
  <div>
    
  </div>
</template>

<script lang="ts" setup>
const supabase = useSupabaseClient();
const { error: updateError } = await supabase.auth.updateUser({
  password: '12345678',
})
console.log(updateError)
</script>

<style>

</style>