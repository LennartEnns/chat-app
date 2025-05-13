<template>
  <main class="body-section">
    <div class="main-content">
      <h1 class="headline">The modern<br />Chat App</h1>
      <p class="subtext">
        We've got a super innovate creation, never seen before, YapSpace.
      </p>
    </div>
  </main>
</template>

<script setup></script>

<style scoped>
.body-section {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  padding: 2rem;
  text-align: center;
  color: white;
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
}

.subtext {
  font-size: 1rem;
  opacity: 0.8;
  max-width: 500px;
}
</style>