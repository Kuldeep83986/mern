import test from "node:test";
import assert from "node:assert/strict";
import { parseIndianAmount, parseLandArea, parseInstalments, parseFrequency } from "../src/normalizers.js";
import { parseEligibilityText } from "../src/eligibilityParser.js";
import { calculateAICost } from "../src/aiFallback.js";

test("Normalizers - Indian currency parsing edge cases", () => {
  assert.strictEqual(parseIndianAmount("₹2.5 lakh")?.amount, 250000);
  assert.strictEqual(parseIndianAmount("Rs. 50,000/-")?.amount, 50000);
  assert.strictEqual(parseIndianAmount("grant of INR 10,000")?.amount, 10000);
  assert.strictEqual(parseIndianAmount("₹5 crore")?.amount, 50000000);
  assert.strictEqual(parseIndianAmount("1.5L")?.amount, 150000);
});

test("Normalizers - Land area normalization (hectares to acres)", () => {
  const ha = parseLandArea("owning less than 2 hectares");
  assert.ok(ha);
  assert.strictEqual(ha.acres, 4.94);

  const acres = parseLandArea("land holding up to 5 acres");
  assert.ok(acres);
  assert.strictEqual(acres.acres, 5);
});

test("Normalizers - Frequency and instalments parsing", () => {
  assert.strictEqual(parseFrequency("paid once a year"), "annual");
  assert.strictEqual(parseFrequency("p.m. pension"), "monthly");
  assert.strictEqual(parseFrequency("lump sum assistance"), "one_time");

  assert.strictEqual(parseInstalments("in three equal instalments"), 3);
  assert.strictEqual(parseInstalments("4 instalments per year"), 4);
  assert.strictEqual(parseInstalments("two tranches"), 2);
});

test("Eligibility Parser - Completely unrecognized input is flagged to review queue", () => {
  const result = parseEligibilityText("SCHEME_UNRECOGNIZED", "Astronauts traveling to low Earth orbit", {
    source_text: "Astronauts traveling to low Earth orbit",
    location: "Page 99",
    source_ref: "https://isro.gov.in",
    captured_date: "2024-01-01"
  });

  assert.strictEqual(result.record.status, "found");
  assert.strictEqual(result.record.confidence, "low");
  assert.strictEqual(result.reviewItems.length, 1);
  assert.match(result.reviewItems[0].reason, /does not match any recognized eligibility concept/i);
});

test("AI Fallback - Pricing calculation matches known formula", () => {
  const cost = calculateAICost("gemini-1.5-flash", 650, 180, 84.0);
  assert.ok(cost.costPerSchemeINR > 0.005);
  assert.ok(cost.costPerSchemeINR < 0.02);
  assert.ok(cost.costFor5000SchemesINR < 100);
});

