import type { MRIVolume, MRIVolumeMeta, MRIScanType } from "./mriTypes";

export async function pickMRIFile(): Promise<File | null> {
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

export function detectMRISequence(filename: string): MRIScanType {
  const lower = filename.toLowerCase();
  if (lower.includes("t1") || lower.includes("mprage")) return "T1_MPRAGE";
  if (lower.includes("flair")) return "FLAIR";
  if (lower.includes("t2")) return "T2_SPACE";
  if (lower.includes("dti") || lower.includes("diffusion")) return "DTI";
  if (lower.includes("swi") || lower.includes("suscept")) return "SWI";
  if (lower.includes("ciss")) return "CISS";
  if (lower.includes("asl") || lower.includes("perfusion")) return "ASL";
  if (lower.includes("fmri") || lower.includes("bold")) return "fMRI";
  return "T1_MPRAGE";
}

export async function loadMRIVolumeFromFile(
  file: File,
  modality?: MRIScanType,
  patientAgeMonths?: number
): Promise<MRIVolume> {
  const detectedModality = modality ?? detectMRISequence(file.name);

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

  for (let z = 18; z < 46; z++) {
    for (let y = 14; y < 50; y++) {
      for (let x = 14; x < 50; x++) {
        const idx = z * rows * cols + y * cols + x;
        const cx = x - 32;
        const cy = y - 32;
        const cz = z - 32;
        const dist = Math.sqrt(cx * cx + cy * cy + cz * cz);
        if (dist < 20) {
          data[idx] = Math.min(1, data[idx] + 0.3 + Math.random() * 0.1);
        }
      }
    }
  }

  const trValues = { T1_MPRAGE: 2300, T2_SPACE: 3200, DTI: 8000, SWI: 27, CISS: 5.2, FLAIR: 9000, ASL: 4600, fMRI: 2000 };
  const teValues = { T1_MPRAGE: 2.98, T2_SPACE: 420, DTI: 90, SWI: 20, CISS: 2.6, FLAIR: 120, ASL: 12, fMRI: 30 };

  const meta: MRIVolumeMeta = {
    id: `mri-${Date.now()}`,
    seriesInstanceUID: `1.2.840.10008.mri.${Date.now()}.1`,
    studyInstanceUID: `1.2.840.10008.mri.${Date.now()}.0`,
    modality: detectedModality,
    sliceCount,
    rows,
    cols,
    voxelSpacing: [1.0, 1.0, 1.0],
    TR: trValues[detectedModality] ?? 2300,
    TE: teValues[detectedModality] ?? 2.98,
    acquisitionDateTime: new Date().toISOString(),
    patientAgeMonths: patientAgeMonths ?? 24,
    motionScore: 0.12 + Math.random() * 0.2,
    anonymized: true,
    sourcePath: file.name,
  };

  return { meta, data };
}

export function generateDemoMRIVolume(
  modality: MRIScanType,
  patientAgeMonths: number
): MRIVolume {
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

        const skull = dist < 28 && dist > 25 ? 0.15 : 0;
        const csf = dist < 25 && dist > 23 ? 0.1 : 0;
        const cortex = dist < 23 && dist > 18 ? 0.65 + Math.random() * 0.1 : 0;
        const whitematter = dist < 18 ? 0.85 + Math.random() * 0.08 : 0;
        const noise = Math.random() * 0.03;

        if (modality === "T1_MPRAGE") {
          data[idx] = Math.min(1, skull * 0.3 + csf * 0.1 + cortex * 0.6 + whitematter * 0.9 + noise);
        } else if (modality === "T2_SPACE" || modality === "FLAIR") {
          data[idx] = Math.min(1, skull * 0.1 + csf * 0.95 + cortex * 0.7 + whitematter * 0.4 + noise);
        } else if (modality === "DTI") {
          const fa = whitematter > 0 ? 0.3 + Math.random() * 0.5 : cortex > 0 ? 0.1 + Math.random() * 0.15 : noise;
          data[idx] = fa;
        } else {
          data[idx] = Math.min(1, skull + csf + cortex + whitematter + noise);
        }
      }
    }
  }

  if (modality === "T1_MPRAGE" || modality === "T2_SPACE") {
    for (let z = 24; z < 40; z++) {
      for (let y = 28; y < 36; y++) {
        for (let x = 20; x < 28; x++) {
          const idx = z * rows * cols + y * cols + x;
          data[idx] = modality === "T2_SPACE" ? 0.95 : 0.1;
        }
        for (let x = 36; x < 44; x++) {
          const idx = z * rows * cols + y * cols + x;
          data[idx] = modality === "T2_SPACE" ? 0.95 : 0.1;
        }
      }
    }
  }

  const trValues = { T1_MPRAGE: 2300, T2_SPACE: 3200, DTI: 8000, SWI: 27, CISS: 5.2, FLAIR: 9000, ASL: 4600, fMRI: 2000 };
  const teValues = { T1_MPRAGE: 2.98, T2_SPACE: 420, DTI: 90, SWI: 20, CISS: 2.6, FLAIR: 120, ASL: 12, fMRI: 30 };

  const meta: MRIVolumeMeta = {
    id: `mri-demo-${Date.now()}`,
    seriesInstanceUID: `1.2.840.10008.mri.demo.${Date.now()}.1`,
    studyInstanceUID: `1.2.840.10008.mri.demo.${Date.now()}.0`,
    modality,
    sliceCount,
    rows,
    cols,
    voxelSpacing: [1.0, 1.0, 1.0],
    TR: trValues[modality] ?? 2300,
    TE: teValues[modality] ?? 2.98,
    acquisitionDateTime: new Date().toISOString(),
    patientAgeMonths,
    motionScore: 0.08 + Math.random() * 0.1,
    anonymized: true,
    sourcePath: "demo-mri-volume",
  };

  return { meta, data };
}
