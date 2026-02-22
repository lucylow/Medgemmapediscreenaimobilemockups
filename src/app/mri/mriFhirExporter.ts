import type { MRIVolumeMeta, MRIInferenceResult } from "./mriTypes";

export function buildMRIFhirBundle(
  meta: MRIVolumeMeta,
  result: MRIInferenceResult
): { bundle: Record<string, unknown>; json: string } {
  const now = new Date().toISOString();
  const observationId = `mri-observation-${meta.id}`;

  const riskCode =
    result.riskAmplification === "CRITICAL"
      ? "CRIT"
      : result.riskAmplification === "SIGNIFICANT_INCREASE"
        ? "HIGH"
        : result.riskAmplification === "INCREASED"
          ? "MOD"
          : "LOW";

  const bundle = {
    resourceType: "Bundle",
    type: "collection",
    timestamp: now,
    meta: {
      profile: ["http://hl7.org/fhir/StructureDefinition/Bundle"],
    },
    entry: [
      {
        fullUrl: `urn:uuid:${observationId}`,
        resource: {
          resourceType: "Observation",
          id: observationId,
          status: "final",
          category: [
            {
              coding: [
                {
                  system: "http://terminology.hl7.org/CodeSystem/observation-category",
                  code: "imaging",
                  display: "Imaging",
                },
              ],
            },
          ],
          code: {
            coding: [
              {
                system: "http://loinc.org",
                code: "12131-8",
                display: "MRI brain",
              },
            ],
            text: `Pediatric MRI brain screening (PediScreen AI) - ${meta.modality}`,
          },
          effectiveDateTime: now,
          valueCodeableConcept: {
            text: result.clinicalSummary,
          },
          interpretation: [
            {
              coding: [
                {
                  system: "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
                  code: riskCode,
                },
              ],
              text: result.riskAmplification,
            },
          ],
          component: [
            {
              code: { text: "Brain Age Gap" },
              valueQuantity: { value: result.domainScores.brainAgeGapMonths, unit: "months" },
            },
            {
              code: { text: "Cortical Thickness" },
              valueQuantity: { value: result.domainScores.corticalThickness, unit: "mm" },
            },
            {
              code: { text: "White Matter Integrity (FA)" },
              valueQuantity: { value: result.domainScores.whiteMatterIntegrity, unit: "score" },
            },
            {
              code: { text: "Ventricular Ratio" },
              valueQuantity: { value: result.domainScores.ventricularRatio, unit: "ratio" },
            },
            {
              code: { text: "Myelination Score" },
              valueQuantity: { value: result.domainScores.myelinationScore, unit: "score" },
            },
            {
              code: { text: "Brain Age Equivalent" },
              valueQuantity: { value: result.brainAgeEquivalent, unit: "months" },
            },
          ],
          note: result.keyFindings.map((f) => ({ text: f })),
          device: {
            display: `MedGemma MRI ${result.modelVersion} (Edge AI)`,
          },
        },
      },
      {
        fullUrl: `urn:uuid:mri-imaging-study-${meta.id}`,
        resource: {
          resourceType: "ImagingStudy",
          id: `mri-imaging-study-${meta.id}`,
          status: "available",
          modality: [
            {
              system: "http://dicom.nema.org/resources/ontology/DCM",
              code: "MR",
              display: "Magnetic Resonance",
            },
          ],
          numberOfSeries: 1,
          numberOfInstances: meta.sliceCount,
          description: `Pediatric MRI ${meta.modality} - ${meta.rows}x${meta.cols}x${meta.sliceCount} (TR=${meta.TR}ms, TE=${meta.TE}ms)`,
          series: [
            {
              uid: meta.seriesInstanceUID,
              modality: { code: "MR" },
              numberOfInstances: meta.sliceCount,
            },
          ],
        },
      },
    ],
  };

  return { bundle, json: JSON.stringify(bundle, null, 2) };
}

export function downloadMRIFhirBundle(json: string, filename?: string): void {
  const blob = new Blob([json], { type: "application/fhir+json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename ?? `mri-fhir-bundle-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
