const averageSizesTable = {
  "4k": { width: 3840, height: 2160, weight: 210000 },
  "1080p": { width: 1920, height: 1080, weight: 80000 },
  "720p": { width: 1280, height: 720, weight: 56000 },
};

export function calculatePngMemoryUse(
  fps: number,
  durationInSeconds: number,
  width: number,
  height: number,
): number {
  const pixelCount = width * height;
  const nearestSize = Object.entries(averageSizesTable).find(
    ([_, size]) => pixelCount <= size.width * size.height,
  );
  const nearestSizeWeight = nearestSize?.[1]?.weight ?? 0;
  const totalFrames = Math.ceil(durationInSeconds * fps);
  return totalFrames * nearestSizeWeight;
}
