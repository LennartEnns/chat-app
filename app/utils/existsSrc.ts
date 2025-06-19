export default async (url: string) => {
  try {
    const res = await $fetch.raw(url, { method: 'HEAD' })
    return res.status === 200
  } catch {
    return false
  }
}