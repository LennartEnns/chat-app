<template>
  <div class="min-h-screen flex flex-col text-white font-sans landing-background">
    <NuxtParticles id="particles" :options="particleOptions" />
    <Header z-index="1" />
    <Body class="flex-grow" z-index="1" />
    <Footer z-index="1" />
  </div>
</template>

<script setup lang="ts">
import Header from '~/components/landingPage/Header.vue'
import Body from '~/components/landingPage/Body.vue'
import Footer from '~/components/landingPage/Footer.vue'

import { onMounted, onUnmounted } from 'vue';
import type { RecursivePartial, IOptions } from '@tsparticles/engine'
import type { Reactive } from 'vue';

const isLight = useSSRSafeTheme();

onMounted(() => {
  const handleWheel = (event: WheelEvent) => {
    const scrollTop = window.scrollY
    const documentHeight = document.documentElement.scrollHeight;
    const windowHeight = window.innerHeight;

    // interfere, when user is at top
    if (scrollTop === 0 && event.deltaY < 0) {
      event.preventDefault();
      return;
    }

    // interfere, when user is at bottom
    if (scrollTop + windowHeight === documentHeight && event.deltaY > 0) {
      event.preventDefault();
      return;
    }
  };

  window.addEventListener('wheel', handleWheel, { passive: false });
  onUnmounted(() => {
    window.removeEventListener('wheel', handleWheel);
  });
});

const particlesColor = computed(() => isLight.value ? '#222' : '"#eee"')
const particleOptions: RecursivePartial<IOptions> = {
  fullScreen: {
    enable: true,
    zIndex: 0,
  },
  background: {
    color: {
      value: 'transparent'
    }
  },
  fpsLimit: 60,
  interactivity: {
    events: {
      onHover: {
        enable: true,
        parallax: {
          enable: true,
          force: 60, // How strong the parallax movement is
          smooth: 10 // Smoothness of the movement
        }
      },
    },
  },
  particles: {
    color: {
      value: particlesColor.value,
    },
    opacity: {
      value: {
        min: 0.1,
        max: 0.3,
      }
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
      }
    },
    size: {
      value: {
        min: 1,
        max: 10,
      },
    },
    modes: {
      parallax: {
        enable: true,
        force: 60, // How strong the parallax movement is
        smooth: 10 // Smoothness of the movement
      }
    },
    shape: {
      type: "square"
    },
    links: {
      enable: true,
      color: particlesColor.value,
      opacity: 0.5,
    },
  },
  detectRetina: true
};

const gradientColor1 = computed(() => isLight.value  ? 'var(--color-primary-400)' : 'var(--color-primary-600)');
const gradientColor2 = computed(() => isLight.value  ? '#d3dbf2' : '#0c1223');
</script>

<style scoped>
.landing-background {
  position: relative;
  background:
    radial-gradient(ellipse 150% 50% at 50% 1%, v-bind(gradientColor2) 0%, transparent 70%),
    radial-gradient(circle at 20% 10%, v-bind(gradientColor1), v-bind(gradientColor2) 75%);
  background-color: #0c0c0c;
  overflow: hidden;
  background-attachment: initial
}

.landing-background::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: url('~/assets/images/stars.png');
  background-repeat: repeat;
  background-size: cover;
  opacity: 0.10;
  z-index: 0;
  mix-blend-mode: color-dodge;
  pointer-events: none;
}
</style>