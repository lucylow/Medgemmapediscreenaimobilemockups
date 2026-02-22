import type { MRIVolume, MRISliceData } from "./mriTypes";

export type SliceView = "axial" | "coronal" | "sagittal";

export function getMRISlice(
  volume: MRIVolume,
  view: SliceView,
  index: number,
  brightness: number = 0,
  contrast: number = 1
): MRISliceData {
  const { meta, data } = volume;
  const { rows, cols, sliceCount } = meta;

  let width: number;
  let height: number;

  switch (view) {
    case "axial":
      width = cols;
      height = rows;
      break;
    case "coronal":
      width = cols;
      height = sliceCount;
      break;
    case "sagittal":
      width = rows;
      height = sliceCount;
      break;
  }

  const pixels = new Uint8ClampedArray(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let voxel: number;

      switch (view) {
        case "axial":
          voxel = data[index * rows * cols + y * cols + x];
          break;
        case "coronal":
          voxel = data[y * rows * cols + index * cols + x];
          break;
        case "sagittal":
          voxel = data[y * rows * cols + x * cols + index];
          break;
      }

      let val = voxel * contrast + brightness;
      val = Math.max(0, Math.min(1, val));
      const byte = Math.round(val * 255);

      const pixIdx = (y * width + x) * 4;
      pixels[pixIdx] = byte;
      pixels[pixIdx + 1] = byte;
      pixels[pixIdx + 2] = byte;
      pixels[pixIdx + 3] = 255;
    }
  }

  return { width, height, pixels };
}

export function getMRISliceDimensions(
  volume: MRIVolume,
  view: SliceView
): { width: number; height: number; maxIndex: number } {
  const { rows, cols, sliceCount } = volume.meta;

  switch (view) {
    case "axial":
      return { width: cols, height: rows, maxIndex: sliceCount - 1 };
    case "coronal":
      return { width: cols, height: sliceCount, maxIndex: rows - 1 };
    case "sagittal":
      return { width: rows, height: sliceCount, maxIndex: cols - 1 };
  }
}

export function extractMRIPatches3D(
  volume: MRIVolume,
  patchSize: [number, number, number] = [64, 64, 64]
): Float32Array[] {
  const { meta, data } = volume;
  const [px, py, pz] = patchSize;
  const { rows, cols, sliceCount } = meta;
  const patches: Float32Array[] = [];

  for (let z = 0; z + pz <= sliceCount; z += pz) {
    const patch = new Float32Array(px * py * pz);
    for (let dz = 0; dz < pz; dz++) {
      for (let y = 0; y < Math.min(py, rows); y++) {
        for (let x = 0; x < Math.min(px, cols); x++) {
          const srcIndex = (z + dz) * rows * cols + y * cols + x;
          const dstIndex = dz * px * py + y * px + x;
          patch[dstIndex] = data[srcIndex];
        }
      }
    }
    patches.push(patch);
  }

  return patches;
}

export function applyMotionCorrection(volume: MRIVolume): {
  corrected: MRIVolume;
  motionScore: number;
} {
  const { data, meta } = volume;
  const correctedData = new Float32Array(data.length);

  for (let i = 0; i < data.length; i++) {
    correctedData[i] = Math.max(0, Math.min(1, data[i] * 1.05 - 0.02));
  }

  const motionScore = 0.05 + Math.random() * 0.15;

  return {
    corrected: { meta: { ...meta, motionScore }, data: correctedData },
    motionScore,
  };
}
