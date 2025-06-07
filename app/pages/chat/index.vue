<template>
  <NuxtLayout name="chat">
    <div :class="`mainContainer ${themedGlassContainer}`">
      <!-- Container for Desktop -->
      <div v-if="!isMobile">
        <h1 class="headlineChat"> You didn't open any chats yet </h1>
        <USeparator :class="`${themedSeparator}`" color="primary"></USeparator>
      </div>
      <!-- Container for Mobile -->
       <div v-if="isMobile">

       </div>
    </div>
  </NuxtLayout>
</template>

<script lang="ts" setup>

const isMobile = useMobileDetector();
const {isLight} = useSSRSafeTheme();
const themedGlassContainer = computed(() =>
  isLight.value ? "mainGlassContainer-dark" : "mainGlassContainer-light"
);
const themedSeparator = computed(() =>
  isLight.value ? "separator-dark" : "separator-light"
);

</script>

<style>
.mainContainer{
  margin-top: 10px;
  margin-bottom: 0.1rem;
  margin-left: 2.7rem;
  margin-right: 2.7rem;
}

.mainGlassContainer-dark{
  background-color: color-mix(in srgb, var(--ui-bg) 35%, transparent);
  border: 1px solid transparent;
  border-image: linear-gradient(
    135deg,
    color-mix(in srgb, var(--ui-primary), white 0%) 20%,
    color-mix(in srgb, var(--ui-primary), white 70%) 30%,
    color-mix(in srgb, var(--ui-primary), black 50%) 100%
  );
  border-image-slice: 1;
}

.mainGlassContainer-light{
  background-color: color-mix(in srgb, var(--ui-bg) 20%, gray 7%);
  border: 1px solid transparent;
  border-image: linear-gradient(
    135deg,
    color-mix(in srgb, var(--ui-primary), white 0%) 20%,
    color-mix(in srgb, var(--ui-primary), white 70%) 30%,
    color-mix(in srgb, var(--ui-primary), black 50%) 100%
  );
  border-image-slice: 1;
}

.headlineChat{
  margin-top: 4rem;
  text-align: center;
  text-justify: auto;
  font-size: 1.5rem;
  font-style: italic;
  font-weight: lighter;
  line-height: 1.2;
  color: color-mix(in srgb, var(--ui-bg) 85%, white);
  filter: invert(40%);
}

.separator-dark{
  align-items: center;
  padding-left: 5rem;
  padding-right: 5rem;
  margin-top: 3rem;
  color: gray;
}

.separator-light{
  align-items: center;
  padding-left: 5rem;
  padding-right: 5rem;
  margin-top: 3rem;
  color: black;
}
</style>