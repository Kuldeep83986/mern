/**
 * Ingestion Pipeline for Haqdarshak Scheme Knowledge Base.
 * Coordinates parsing, provenance tracking, conflict detection, and human review dispatch.
 */

import { parseBenefitText } from "./benefitParser.js";
import { parseEligibilityText } from "./eligibilityParser.js";

/**
 * @param {any} input
 * @returns {any}
 */
export function processScheme(input) {
  const fields = {};
  const reviewQueue = [];
  const conflicts = [];
  let finalBenefits = [];
  let finalEligibilityAST = null;

  // 1. Process Benefits
  if (input.raw_fields.benefits && input.raw_fields.benefits.length > 0) {
    if (input.raw_fields.benefits.length === 1) {
      const item = input.raw_fields.benefits[0];
      const parsed = parseBenefitText(input.scheme_ref, item.raw_text, item.evidence);

      fields["benefits"] = parsed.record;
      if (parsed.record.value && Array.isArray(parsed.record.value)) {
        finalBenefits = parsed.record.value;
      }
      reviewQueue.push(...parsed.reviewItems);
    } else {
      // Multiple benefit entries - check for conflict vs multi-component benefits
      const records = [];
      for (const item of input.raw_fields.benefits) {
        const parsed = parseBenefitText(input.scheme_ref, item.raw_text, item.evidence);
        records.push(parsed.record);
        if (parsed.record.value && Array.isArray(parsed.record.value)) {
          finalBenefits.push(...parsed.record.value);
        }
        reviewQueue.push(...parsed.reviewItems);
      }
      fields["benefits"] = {
        scheme_ref: input.scheme_ref,
        field: "benefits",
        value: finalBenefits,
        evidence: input.raw_fields.benefits[0].evidence,
        confidence: "medium",
        status: "found",
        note: `Contains ${input.raw_fields.benefits.length} extracted benefit sources`
      };
    }
  } else {
    fields["benefits"] = {
      scheme_ref: input.scheme_ref,
      field: "benefits",
      value: null,
      evidence: null,
      confidence: "low",
      status: "not found",
      note: "No benefit information found in source documentation"
    };
  }

  // 2. Process Eligibility
  if (input.raw_fields.eligibility && input.raw_fields.eligibility.length > 0) {
    if (input.raw_fields.eligibility.length === 1) {
      const item = input.raw_fields.eligibility[0];
      const parsed = parseEligibilityText(input.scheme_ref, item.raw_text, item.evidence);

      fields["eligibility"] = parsed.record;
      finalEligibilityAST = parsed.record.value;
      reviewQueue.push(...parsed.reviewItems);
    } else {
      // Multiple sources for eligibility -> Check for Conflicts!
      // "A conflict means sources disagree: keep every value and its source"
      const parsedResults = input.raw_fields.eligibility.map((item) =>
        parseEligibilityText(input.scheme_ref, item.raw_text, item.evidence)
      );

      const isConflict = checkEligibilityDiscrepancy(parsedResults);

      if (isConflict) {
        // Build conflict records preserving every value and its source
        for (let i = 0; i < parsedResults.length; i++) {
          const res = parsedResults[i];
          const conflictRecord = {
            scheme_ref: input.scheme_ref,
            field: `eligibility_source_${i + 1}`,
            value: res.record.value,
            evidence: res.record.evidence,
            confidence: "low",
            status: "conflict",
            note: `Conflicting source version detected: ${input.raw_fields.eligibility[i].evidence.location} (${input.raw_fields.eligibility[i].evidence.captured_date})`
          };
          conflicts.push(conflictRecord);
        }

        fields["eligibility"] = {
          scheme_ref: input.scheme_ref,
          field: "eligibility",
          value: null,
          evidence: null,
          confidence: "low",
          status: "conflict",
          note: `Conflict detected between ${input.raw_fields.eligibility.length} sources. Preserving all versions in conflicts table for human resolution.`
        };

        reviewQueue.push({
          id: `rev_conflict_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          scheme_ref: input.scheme_ref,
          field: "eligibility",
          raw_text: input.raw_fields.eligibility.map((e) => `[${e.evidence.captured_date}] ${e.raw_text}`).join(" vs "),
          evidence: input.raw_fields.eligibility[0].evidence,
          reason: "Conflicting eligibility criteria between multiple published department sources. Human review required before publishing.",
          confidence: "low",
          flagged_at: new Date().toISOString()
        });
      } else {
        // Not a conflict, merge conditions
        const validConditions = parsedResults
          .map((r) => r.record.value)
          .filter((v) => v !== null);

        if (validConditions.length > 0) {
          finalEligibilityAST = {
            type: "compound",
            combinator: "AND",
            conditions: validConditions
          };
        }
      }
    }
  } else {
    fields["eligibility"] = {
      scheme_ref: input.scheme_ref,
      field: "eligibility",
      value: null,
      evidence: null,
      confidence: "low",
      status: "not found",
      note: "No eligibility rules provided in source"
    };
  }

  return {
    scheme_ref: input.scheme_ref,
    scheme_name: input.scheme_name,
    fields,
    benefits: finalBenefits,
    eligibility_ast: finalEligibilityAST,
    review_queue: reviewQueue,
    conflicts,
    processed_at: new Date().toISOString()
  };
}

/**
 * Checks whether multiple parsed eligibility sources disagree on threshold values.
 * @param {Array<{ record: any }>} results
 * @returns {boolean}
 */
function checkEligibilityDiscrepancy(results) {
  if (results.length <= 1) return false;

  const representations = results.map((r) => JSON.stringify(r.record.value));
  const first = representations[0];
  return representations.some((repr) => repr !== first);
}

