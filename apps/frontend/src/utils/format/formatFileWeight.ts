/**
 * Format file weight in bytes to a readable string (KB, MB, GB)
 * @param weightInBytes
 */
export function formatFileWeight(weightInBytes: number): string {
  if (weightInBytes < 1024) {
    return `${weightInBytes} bytes`;
  }
  if (weightInBytes < 1024 * 1024) {
    return `${(weightInBytes / 1024).toFixed(2)} KB`;
  }
  if (weightInBytes < 1024 * 1024 * 1024) {
    return `${(weightInBytes / 1024 / 1024).toFixed(2)} MB`;
  }
  return `${(weightInBytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}
