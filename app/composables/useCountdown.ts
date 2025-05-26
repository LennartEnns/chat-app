export const useCountdown = () => {
  const timer = ref(3);

  // It's the final countdown!
  async function countdown(onFinish: () => unknown) {
    await new Promise(r => setTimeout(r, 1000));
    timer.value--;
    if (timer.value <= 0) {
      onFinish();
      return;
    }
    countdown(onFinish);
  }

  return {
    timer,
    start: countdown, // Initiate the countdown
  }
}
