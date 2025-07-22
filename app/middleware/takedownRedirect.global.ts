export default defineNuxtRouteMiddleware((to, _) => {
  if (to.path === '/takedown') return;
  return navigateTo('/takedown');
})
