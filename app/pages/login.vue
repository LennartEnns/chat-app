<template>
  <div>
    {{ text }}
  </div>
</template>

<script setup>
  const rtConf = useRuntimeConfig();
  const text = ref(rtConf.public.supabaseUrl);
</script>
