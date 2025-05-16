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
      value: "#eee"
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
      color: "#eee",
      opacity: 0.5,
    },
  },
  detectRetina: true
}
</script>

<style scoped>
.landing-background {
  position: relative;
  background:
    radial-gradient(ellipse 150% 50% at 50% 1%, #0C1223 0%, transparent 70%),
    radial-gradient(circle at 20% 10%, var(--color-green-700), #0C1223 75%);
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