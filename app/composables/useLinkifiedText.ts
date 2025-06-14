export const useLinkifiedText = (text: Ref<string>) => {
  return computed(() => linkifyText(text.value));
}
