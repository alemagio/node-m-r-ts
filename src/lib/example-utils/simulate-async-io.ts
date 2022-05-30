// This is just for the example
export async function simulateAsynchronousIO<T>(asynchronousAction): Promise<T> {
  return new Promise((resolve, reject) => {
    try {
      resolve(asynchronousAction())
    } catch (err) {
      reject(err)
    }
  })
}