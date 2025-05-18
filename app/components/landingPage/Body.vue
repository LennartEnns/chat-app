<template>
  <main class="body-section">
    <div class="main-content">
      <h1 :class="`headline ${isLight ? 'text-neutral-800' : 'text-neutral-50'}`">The modern<br>Chat App</h1>
      <p :class="`subtext ${isLight ? 'text-neutral-800' : 'text-neutral-50'}`">
        Connect to the world! <br> We do not steal your data like the big social media companies.
      </p>
    </div>
  </main>
</template>

<script setup>
const isLight = useSSRSafeTheme();
</script>

<style scoped>
.body-section {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  padding: 2rem;
  text-align: center;
}

.main-content {
  max-width: 640px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}

.headline {
  font-size: 2.5rem;
  font-weight: bold;
  line-height: 1.2;
  z-index: 1;
}

.subtext {
  font-size: 1rem;
  opacity: 0.8;
  max-width: 500px;
}
</style>