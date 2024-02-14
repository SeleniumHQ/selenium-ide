export async function retry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 100
): Promise<T> {
  try {
    return await fn()
  } catch (e) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay))
      return retry(fn, retries - 1, delay)
    }
    throw e
  }
}
