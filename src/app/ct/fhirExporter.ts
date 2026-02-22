import type { CTVolumeMeta, CTInferenceResult } from "./ctTypes";

export function buildCTFhirBundle(
  meta: CTVolumeMeta,
  result: CTInferenceResult
): { bundle: Record<string, unknown>; json: string } {
  const now = new Date().toISOString();
  const observationId = `ct-observation-${meta.id}`;

  const riskCode =
    result.riskTier === "CRITICAL"
      ? "CRIT"
      : result.riskTier === "REFER"
        ? "HIGH"
        : result.riskTier === "MONITOR"
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
                code: "18748-4",
                display: "CT study",
              },
            ],
            text: `Pediatric CT screening (PediScreen AI) - ${meta.modality}`,
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
              text: result.riskTier,
            },
          ],
          component: [
            {
              code: { text: "Hemorrhage Risk" },
              valueQuantity: { value: result.domainScores.hemorrhageRisk, unit: "probability" },
            },
            {
              code: { text: "Fracture Risk" },
              valueQuantity: { value: result.domainScores.fractureRisk, unit: "probability" },
            },
            {
              code: { text: "NEC Risk" },
              valueQuantity: { value: result.domainScores.necRisk, unit: "probability" },
            },
            {
              code: { text: "Tumor Burden" },
              valueQuantity: { value: result.domainScores.tumorBurden, unit: "probability" },
            },
          ],
          note: result.keyFindings.map((f) => ({ text: f })),
          device: {
            display: `MedGemma CT ${result.modelVersion} (Edge AI)`,
          },
        },
      },
      {
        fullUrl: `urn:uuid:ct-imaging-study-${meta.id}`,
        resource: {
          resourceType: "ImagingStudy",
          id: `ct-imaging-study-${meta.id}`,
          status: "available",
          modality: [
            {
              system: "http://dicom.nema.org/resources/ontology/DCM",
              code: "CT",
              display: "Computed Tomography",
            },
          ],
          numberOfSeries: 1,
          numberOfInstances: meta.sliceCount,
          description: `Pediatric ${meta.modality} - ${meta.rows}x${meta.cols}x${meta.sliceCount}`,
          series: [
            {
              uid: meta.seriesInstanceUID,
              modality: { code: "CT" },
              numberOfInstances: meta.sliceCount,
            },
          ],
        },
      },
    ],
  };

  return { bundle, json: JSON.stringify(bundle, null, 2) };
}

export function downloadFhirBundle(json: string, filename?: string): void {
  const blob = new Blob([json], { type: "application/fhir+json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename ?? `ct-fhir-bundle-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
