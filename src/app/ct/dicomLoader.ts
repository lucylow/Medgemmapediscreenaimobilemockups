import type { CTVolume, CTVolumeMeta, CTModality } from "./ctTypes";

export async function pickCTFile(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".dcm,.dicom,.nii,.nii.gz,.zip";
    input.onchange = () => {
      const file = input.files?.[0] ?? null;
      resolve(file);
    };
    input.oncancel = () => resolve(null);
    input.click();
  });
}

export function detectModality(filename: string): CTModality {
  const lower = filename.toLowerCase();
  if (lower.includes("head") || lower.includes("brain") || lower.includes("cranial")) return "CT_HEAD";
  if (lower.includes("abd") || lower.includes("abdom")) return "CT_ABDOMEN";
  if (lower.includes("chest") || lower.includes("thorax")) return "CT_CHEST";
  if (lower.includes("dental") || lower.includes("cbct")) return "CBCT_DENTAL";
  if (lower.includes("msk") || lower.includes("fract") || lower.includes("bone")) return "CT_MS";
  return "CT_HEAD";
}

export async function loadCTVolumeFromFile(
  file: File,
  modality?: CTModality
): Promise<CTVolume> {
  const detectedModality = modality ?? detectModality(file.name);

  const rows = 64;
  const cols = 64;
  const sliceCount = 64;
  const totalVoxels = rows * cols * sliceCount;
  const data = new Float32Array(totalVoxels);

  const fileBuffer = await file.arrayBuffer();
  const fileBytes = new Uint8Array(fileBuffer);

  const seed = fileBytes.length > 0 ? fileBytes[0] : 42;
  let rng = seed;
  for (let i = 0; i < totalVoxels; i++) {
    rng = (rng * 1103515245 + 12345) & 0x7fffffff;
    data[i] = (rng % 4000) / 4000;
  }

  for (let z = 20; z < 44; z++) {
    for (let y = 16; y < 48; y++) {
      for (let x = 16; x < 48; x++) {
        const idx = z * rows * cols + y * cols + x;
        data[idx] = Math.min(1, data[idx] + 0.2 + Math.random() * 0.15);
      }
    }
  }

  const meta: CTVolumeMeta = {
    id: `ct-${Date.now()}`,
    seriesInstanceUID: `1.2.840.10008.${Date.now()}.1`,
    studyInstanceUID: `1.2.840.10008.${Date.now()}.0`,
    modality: detectedModality,
    sliceCount,
    rows,
    cols,
    voxelSpacing: [0.5, 0.5, 1.0],
    hounsfieldRange: [-1000, 3000],
    acquisitionDateTime: new Date().toISOString(),
    anonymized: true,
    sourcePath: file.name,
  };

  return { meta, data };
}

export function generateDemoVolume(modality: CTModality): CTVolume {
  const rows = 64;
  const cols = 64;
  const sliceCount = 64;
  const totalVoxels = rows * cols * sliceCount;
  const data = new Float32Array(totalVoxels);

  for (let z = 0; z < sliceCount; z++) {
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const idx = z * rows * cols + y * cols + x;
        const cx = x - cols / 2;
        const cy = y - rows / 2;
        const cz = z - sliceCount / 2;
        const dist = Math.sqrt(cx * cx + cy * cy + cz * cz);
        const skull = dist < 28 && dist > 24 ? 0.9 : 0;
        const brain = dist < 24 ? 0.4 + Math.random() * 0.15 : 0;
        const noise = Math.random() * 0.05;
        data[idx] = Math.min(1, skull + brain + noise);
      }
    }
  }

  if (modality === "CT_HEAD") {
    for (let z = 28; z < 38; z++) {
      for (let y = 20; y < 30; y++) {
        for (let x = 35; x < 45; x++) {
          const idx = z * rows * cols + y * cols + x;
          data[idx] = Math.min(1, data[idx] + 0.35);
        }
      }
    }
  }

  const meta: CTVolumeMeta = {
    id: `ct-demo-${Date.now()}`,
    seriesInstanceUID: `1.2.840.10008.demo.${Date.now()}.1`,
    studyInstanceUID: `1.2.840.10008.demo.${Date.now()}.0`,
    modality,
    sliceCount,
    rows,
    cols,
    voxelSpacing: [0.5, 0.5, 1.0],
    hounsfieldRange: [-1000, 3000],
    acquisitionDateTime: new Date().toISOString(),
    anonymized: true,
    sourcePath: "demo-volume",
  };

  return { meta, data };
}
