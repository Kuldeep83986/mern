import test from "node:test";
import assert from "node:assert/strict";
import { processScheme } from "../src/pipeline.js";
import { SAMPLE_SCHEMES } from "../src/data/sampleSchemes.js";

test("Pipeline - Full scheme ingestion creates valid ProcessedScheme with provenance", () => {
  const pmKisan = SAMPLE_SCHEMES.find((s) => s.scheme_ref === "SCHEME_CEN_PMKISAN_001");
  assert.ok(pmKisan);
  const processed = processScheme(pmKisan);

  assert.strictEqual(processed.scheme_ref, "SCHEME_CEN_PMKISAN_001");
  assert.strictEqual(processed.benefits.length, 1);
  assert.strictEqual(processed.benefits[0].amount, 6000);
  assert.strictEqual(processed.benefits[0].number_of_instalments, 3);

  // Evidence verification
  assert.ok(processed.fields["benefits"].evidence);
  assert.strictEqual(
    processed.fields["benefits"].evidence.source_ref,
    "https://pmkisan.gov.in/Documents/OperationalGuidelines.pdf"
  );
  assert.strictEqual(processed.fields["benefits"].status, "found");
  assert.strictEqual(processed.fields["benefits"].confidence, "high");
});

test("Pipeline - Discretionary scheme sends items to review queue without guessing", () => {
  const discretionary = SAMPLE_SCHEMES.find((s) => s.scheme_ref === "SCHEME_DISCRETIONARY_007");
  assert.ok(discretionary);
  const processed = processScheme(discretionary);

  assert.strictEqual(processed.benefits.length, 0);
  assert.strictEqual(processed.review_queue.length, 2);
  assert.strictEqual(processed.fields["benefits"].confidence, "low");
  assert.strictEqual(processed.fields["eligibility"].confidence, "low");
});

test("Pipeline - Conflicting sources detected and preserved with status: conflict", () => {
  const conflictScheme = SAMPLE_SCHEMES.find((s) => s.scheme_ref === "SCHEME_CONFLICT_008");
  assert.ok(conflictScheme);
  const processed = processScheme(conflictScheme);

  assert.strictEqual(processed.fields["eligibility"].status, "conflict");
  assert.strictEqual(processed.conflicts.length, 2);

  const sources = processed.conflicts.map((c) => c.evidence?.captured_date);
  assert.ok(sources.includes("2021-08-10"));
  assert.ok(sources.includes("2024-07-01"));
});

