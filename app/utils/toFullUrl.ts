export default (path: string) => {
  const rtConf = useRuntimeConfig();
  return rtConf.public.baseUrl + path;
}
