<template>
  <div class="min-h-dvh flex items-center justify-center space-y-3 flex-col text-white font-sans landing-background px-4">
    <h2 :class="`headline-space-text ${isLight ? 'text-neutral-800' : 'text-neutral-50'}`">Looks like you're lost in space</h2>
    <h2 :class="`headline-error-message ${isLight ? 'text-neutral-800' : 'text-neutral-50'}`">{{ error.message }}</h2>
    <div class="status-code-container">
      <h1 :class="`headline-status-code ${isLight ? 'text-neutral-800' : 'text-neutral-50'}`">{{ error.statusCode }}</h1>
      <img 
        ref="astroRef"
        class="overlayImage" 
        :style="{ display: error.statusCode === 404 ? 'block' : 'none' }"
        src="assets/images/astronaut.png" 
        alt="Lost astronaut floating in space"
        role="img">
    </div>
    <UButton 
    :class="`${themedUserColor}`"
    size="lg"
    @click="handleError"
    > Go Back
  </UButton>
  </div>
</template>

<script setup lang="ts">

import type { NuxtError } from '#app';
import colors from 'tailwindcss/colors'

const { isLight } = useSSRSafeTheme();
const supabase = useSupabaseClient();
const { data } = await supabase.auth.getSession()
const authenticated = data.session?.user.role
const primaryColor = useCookie("uiPrimary").value;

const props = defineProps<{
  error: NuxtError
}>()

const themedUserColor = computed(() =>
  isLight.value ? "user-light-mode" : "user-dark-mode"
);
const handleError = () => {
  if(authenticated == "authenticated"){
    clearError({ redirect: '/chat'})
  } else clearError({ redirect: '/' })
}

onMounted(() => {
  const handleWheel = (event: WheelEvent) => {
    const scrollTop = window.scrollY;
    const documentHeight = document.documentElement.scrollHeight;
    const windowHeight = window.innerHeight;

    if (scrollTop === 0 && event.deltaY < 0) {
      event.preventDefault();
      return;
    }
    if (scrollTop + windowHeight === documentHeight && event.deltaY > 0) {
      event.preventDefault();
      return;
    }
  };

  window.addEventListener("wheel", handleWheel, { passive: false });
  onUnmounted(() => {
    window.removeEventListener("wheel", handleWheel);
  });
});

const gradientColor2 = computed(() => {
  if (!primaryColor || !(primaryColor in colors)) {
    return '#333333'
  }

  const colorShades = colors[primaryColor as keyof typeof colors]
  return isLight.value ? colorShades[200] : "#0c1223"
})

const gradientColor1 = computed(() => {
  if (!primaryColor || !(primaryColor in colors)) {
    return '#555555'
  }

  const colorShades = colors[primaryColor as keyof typeof colors]
  return isLight.value ? colorShades[400] : colorShades[600]
})

const primaryColorValue = computed(() => {
  if (!primaryColor || !(primaryColor in colors)) {
    return '#6366f1'
  }

  const colorShades = colors[primaryColor as keyof typeof colors]
  return isLight.value ? colorShades[400] : colorShades[600];
})
</script>

<style scoped>

.status-code-container {
  position: relative;
  display: inline-block;
}

.headline-status-code {
  font-size: 20.5rem;
  font-weight: bold;
  line-height: 1.2;
  z-index: 2;
  position: relative;
}

.headline-error-message {
  font-size: 1.5rem;
  font-weight: 500;
  line-height: 1.5;
  z-index: 2;
  text-align: center;
  max-width: 90vw;
  word-wrap: break-word;
}

.headline-space-text {
  font-size: 2.5rem;
  font-weight: bolder;
  line-height: 1.2;
  z-index: 2;
  text-align: center;
  max-width: 90vw;
  word-wrap: break-word;
}

.overlayImage {
  position: absolute;
  right: 49%;
  top: 63%;
  transform: translate(50%, -50%);
  width: 18rem;
  height: auto;
  z-index: 3;
  opacity: 1;
}

@media (max-width: 768px) {
  .headline-status-code {
    font-size: 42.7vw;
  }
  
  .headline-space-text {
    font-size: clamp(1.25rem, 7vw, 4rem);
  }
  
  .headline-error-message {
    font-size: 3.1vw;
  }
  
  .overlayImage {
    width: 36vw;
    right: 49%;
    top: 63%;
  }
  
  .status-code-container {
    margin: 1rem 0;
  }
}
  
.user-dark-mode {
  background-color: color-mix(in srgb, v-bind(primaryColorValue) 55%, transparent);
  color: white;
  border-color: v-bind(primaryColorValue);
}

.user-light-mode {
  background-color: color-mix(in srgb, v-bind(primaryColorValue) 65%, transparent);
  color: black;
  border-color: v-bind(primaryColorValue);
}

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

.landing-background::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: url("~/assets/images/stars.png");
  background-repeat: repeat;
  background-size: cover;
  opacity: 0.1;
  z-index: 1;
  mix-blend-mode: color-dodge;
  pointer-events: none;
}
</style>