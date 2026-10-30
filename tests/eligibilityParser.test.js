import test from "node:test";
import assert from "node:assert/strict";
import { parseEligibilityText } from "../src/eligibilityParser.js";

const dummyEvidence = {
  source_text: "test snippet",
  location: "Page 2, Para 4",
  source_ref: "https://example.gov.in/test.pdf",
  captured_date: "2024-01-01"
};

test("Eligibility Parser - SC/ST with income under ₹2.5 lakh", () => {
  const raw = "SC/ST families with income under ₹2.5 lakh";
  const result = parseEligibilityText("TEST_ELIG_001", raw, dummyEvidence);

  assert.strictEqual(result.reviewItems.length, 0);
  assert.ok(result.record.value);
  assert.strictEqual(result.record.value.type, "compound");

  const compound = result.record.value;
  assert.strictEqual(compound.combinator, "AND");

  const scCond = compound.conditions.find(
    (c) => c.type === "simple" && c.concept === "social_category"
  );
  assert.ok(scCond);
  assert.deepStrictEqual(scCond.value, ["SC", "ST"]);

  const incCond = compound.conditions.find(
    (c) => c.type === "simple" && c.concept === "annual_family_income"
  );
  assert.ok(incCond);
  assert.strictEqual(incCond.value, 250000);
  assert.strictEqual(incCond.operator, "<=");
});

test("Eligibility Parser - Age range (18 to 59 years)", () => {
  const raw = "Age between 18 and 59 years";
  const result = parseEligibilityText("TEST_ELIG_002", raw, dummyEvidence);

  const compound = result.record.value;
  assert.strictEqual(compound.combinator, "AND");

  const minAge = compound.conditions.find(
    (c) => c.type === "simple" && c.concept === "age" && c.operator === ">="
  );
  const maxAge = compound.conditions.find(
    (c) => c.type === "simple" && c.concept === "age" && c.operator === "<="
  );

  assert.strictEqual(minAge.value, 18);
  assert.strictEqual(maxAge.value, 59);
});

test("Eligibility Parser - Top-level OR condition", () => {
  const raw = "Farmers with land less than 2 hectares OR annual income below 1.5 lakh";
  const result = parseEligibilityText("TEST_ELIG_003", raw, dummyEvidence);

  assert.ok(result.record.value);
  assert.strictEqual(result.record.value.type, "compound");

  const compound = result.record.value;
  assert.strictEqual(compound.combinator, "OR");
  assert.strictEqual(compound.conditions.length, 2);
});

test("Eligibility Parser - Subjective moral character criterion sent to Review Queue", () => {
  const raw = "Applicant must be of good moral character and have village sarpanch recommendation";
  const result = parseEligibilityText("TEST_ELIG_004", raw, dummyEvidence);

  assert.strictEqual(result.record.confidence, "low");
  assert.strictEqual(result.reviewItems.length, 1);
  assert.match(result.reviewItems[0].reason, /moral character/i);
});

