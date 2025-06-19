/**
 * Composable for getting the reactive parameter from routes that have "[id]" in their name
 */
export const useRouteIdParam = () => {
  const route = useRoute();
  const routeChatroomId = computed(() => {
    const params = route.params;
    return params.id as string;
  });
  return routeChatroomId;
}
