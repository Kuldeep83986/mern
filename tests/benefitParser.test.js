import test from "node:test";
import assert from "node:assert/strict";
import { parseBenefitText } from "../src/benefitParser.js";

const dummyEvidence = {
  source_text: "test snippet",
  location: "Page 1, Para 2",
  source_ref: "https://example.gov.in/test.pdf",
  captured_date: "2024-01-01"
};

test("Benefit Parser - PM KISAN style (₹6,000 / year in three instalments)", () => {
  const raw = "Financial benefit of ₹6,000 a year in three equal instalments directly into bank accounts";
  const result = parseBenefitText("TEST_001", raw, dummyEvidence);

  assert.strictEqual(result.reviewItems.length, 0);
  assert.ok(result.record.value);
  assert.strictEqual(result.record.value.length, 1);

  const b = result.record.value[0];
  assert.strictEqual(b.amount, 6000);
  assert.strictEqual(b.currency, "INR");
  assert.strictEqual(b.frequency, "annual");
  assert.strictEqual(b.number_of_instalments, 3);
  assert.strictEqual(b.type, "financial");
  assert.strictEqual(b.category, "direct_benefit_transfer");
});

test("Benefit Parser - Monthly pension (Rs. 1,500 per month)", () => {
  const raw = "Financial assistance of Rs. 1,500 per month paid to destitute persons";
  const result = parseBenefitText("TEST_002", raw, dummyEvidence);

  assert.strictEqual(result.reviewItems.length, 0);
  const b = result.record.value[0];
  assert.strictEqual(b.amount, 1500);
  assert.strictEqual(b.frequency, "monthly");
  assert.strictEqual(b.number_of_instalments, null);
});

test("Benefit Parser - Lakh notation (Health cover up to ₹5 lakh)", () => {
  const raw = "Health insurance cover up to ₹5 lakh per family per year";
  const result = parseBenefitText("TEST_003", raw, dummyEvidence);

  const b = result.record.value[0];
  assert.strictEqual(b.amount, 500000);
  assert.strictEqual(b.category, "insurance_cover");
  assert.strictEqual(b.type, "insurance");
  assert.strictEqual(b.frequency, "annual");
});

test("Benefit Parser - In-kind physical benefit (Free bicycle)", () => {
  const raw = "Distribution of one free bicycle to students entering Class 11";
  const result = parseBenefitText("TEST_004", raw, dummyEvidence);

  const b = result.record.value[0];
  assert.strictEqual(b.category, "in_kind");
  assert.strictEqual(b.type, "physical_asset");
  assert.strictEqual(b.amount, null);
});

test("Benefit Parser - Discretionary ambiguous benefit sent to Review Queue", () => {
  const raw = "Benefit will be decided on a case-by-case basis at the discretion of the Collector";
  const result = parseBenefitText("TEST_005", raw, dummyEvidence);

  assert.strictEqual(result.reviewItems.length, 1);
  assert.strictEqual(result.record.confidence, "low");
  assert.match(result.reviewItems[0].reason, /discretionary/i);
});

