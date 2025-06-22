<template>
  <div class="min-h-dvh flex flex-col text-white font-sans landing-background">
    <NuxtParticles
      id="particles"
      :options="particleOptions"
      @load="onParticlesLoad"
    />
    <LandingPageHeader z-index="1" :logged-in="loggedIn" />
    <LandingPageBody class="flex-grow" z-index="1" :logged-in="loggedIn" />
    <LandingPageFooter z-index="1" @open-faq="slideoverOpen = true" />
    <FaqSlideover v-model="slideoverOpen" />
  </div>
</template>

<script setup lang="ts">
import type {
  RecursivePartial,
  IOptions,
  Container,
} from "@tsparticles/engine";
import type { Reactive } from "vue";

const session = useSupabaseSession();
const loggedIn = computed(() => (!!session.value));
const { isLight } = useSSRSafeTheme();
const slideoverOpen = ref(false);

const particlesColor: ComputedRef<string> = computed(() =>
  isLight.value ? "#222" : "#eee"
);
const particleOptions: Reactive<RecursivePartial<IOptions>> = reactive({
  fullScreen: {
    enable: true,
    zIndex: 0,
  },
  background: {
    color: {
      value: "transparent",
    },
  },
  fpsLimit: 60,
  interactivity: {
    events: {
      onHover: {
        enable: true,
        parallax: {
          enable: true,
          force: 60, // How strong the parallax movement is
          smooth: 10, // Smoothness of the movement
        },
      },
    },
  },
  particles: {
    color: {
      value: particlesColor,
    },
    opacity: {
      value: {
        min: 0.1,
        max: 0.3,
      },
    },
    move: {
      enable: true,
      direction: "top",
      speed: 2,
    },
    number: {
      value: 125,
      density: {
        enable: true,
      },
    },
    size: {
      value: {
        min: 1,
        max: 10,
      },
    },
    shape: {
      type: "square",
    },
    links: {
      enable: true,
      color: particlesColor,
      opacity: 0.7,
    },
  },
  detectRetina: true,
});

let particlesContainer: Container | null = null;
const onParticlesLoad = (container: Container) => {
  particlesContainer = container;
};
watch(particleOptions, () => {
  particlesContainer?.init();
});

const gradientColor1 = computed(() =>
  isLight.value ? "var(--ui-color-primary-400)" : "var(--ui-color-primary-600)"
);
const gradientColor2 = computed(() =>
  isLight.value ? "var(--ui-color-primary-100)" : "#0c1223"
);
</script>

<style scoped>
.landing-background {
  position: relative;
  background: radial-gradient(
      ellipse 150% 50% at 50% 1%,
      v-bind(gradientColor2) 0%,
      transparent 70%
    ),
    radial-gradient(
      circle at 20% 10%,
      v-bind(gradientColor1),
      v-bind(gradientColor2) 75%
    );
  background-color: #0c0c0c;
  overflow: hidden;
  background-attachment: initial;
}
</style>
