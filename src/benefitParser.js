/**
 * Benefit Parser: Transforms messy scheme benefit descriptions into structured BenefitRow records.
 * Unmappable or ambiguous records are flagged for human review.
 */

import { parseFrequency, parseIndianAmount, parseInstalments } from "./normalizers.js";

/**
 * @param {string} schemeRef
 * @param {string} rawText
 * @param {import('./types.js').Evidence} evidence
 * @returns {{ record: import('./types.js').FieldRecord, reviewItems: Array<import('./types.js').ReviewItem> }}
 */
export function parseBenefitText(schemeRef, rawText, evidence) {
  const reviewItems = [];
  const text = rawText.trim();

  // Check for ambiguous / discretionary statements that must not be guessed
  const ambiguousTriggers = [
    /case-by-case/i,
    /discretion\s+of/i,
    /subject\s+to\s+availability\s+of\s+funds/i,
    /as\s+decided\s+by/i,
    /determined\s+from\s+time\s+to\s+time/i,
    /to\s+be\s+notified\s+later/i
  ];

  for (const trigger of ambiguousTriggers) {
    if (trigger.test(text)) {
      reviewItems.push({
        id: `rev_benefit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        scheme_ref: schemeRef,
        field: "benefits",
        raw_text: text,
        evidence,
        reason: "Discretionary or variable benefit without fixed amount or schedule; requires policy review",
        confidence: "low",
        flagged_at: new Date().toISOString()
      });

      return {
        record: {
          scheme_ref: schemeRef,
          field: "benefits",
          value: [],
          evidence,
          confidence: "low",
          status: "found",
          note: "Discretionary benefit forwarded to human review queue"
        },
        reviewItems
      };
    }
  }

  // Detect Type & Category
  let type = "financial";
  let category = "direct_benefit_transfer";

  const lower = text.toLowerCase();

  if (
    /\b(loan|loans|subvention|working capital|mudra|line of credit)\b/i.test(lower) &&
    !lower.includes("credited into") &&
    !lower.includes("credited to")
  ) {
    type = "credit";
    category = "subsidized_loan";
  } else if (
    lower.includes("insurance") ||
    lower.includes("cover") ||
    lower.includes("cashless treatment") ||
    lower.includes("hospitalization")
  ) {
    type = "insurance";
    category = "insurance_cover";
  } else if (
    lower.includes("waiver") ||
    lower.includes("concession") ||
    lower.includes("fee exemption") ||
    lower.includes("100% free")
  ) {
    type = "waiver";
    category = "fee_waiver";
  } else if (
    lower.includes("pension") ||
    lower.includes("monthly pension") ||
    lower.includes("old age pension")
  ) {
    type = "financial";
    category = "pension";
  } else if (lower.includes("scholarship") || lower.includes("stipend")) {
    type = "financial";
    category = "scholarship";
  } else if (
    lower.includes("food grains") ||
    lower.includes("bicycle") ||
    lower.includes("laptop") ||
    lower.includes("smartphone") ||
    lower.includes("sewing machine") ||
    lower.includes("kit") ||
    lower.includes("rations")
  ) {
    type = "physical_asset";
    category = "in_kind";
  }

  // Extract Amount & Frequency & Instalments
  const parsedAmount = parseIndianAmount(text);
  const frequency = parseFrequency(text);
  const instalments = parseInstalments(text);

  // If in-kind without monetary amount, handle gracefully
  if (category === "in_kind" && !parsedAmount) {
    const row = {
      category,
      type,
      amount: null,
      currency: "INR",
      frequency,
      number_of_instalments: instalments,
      description: text
    };
    return {
      record: {
        scheme_ref: schemeRef,
        field: "benefits",
        value: [row],
        evidence,
        confidence: "medium",
        status: "found",
        note: "In-kind physical benefit identified without monetary denomination"
      },
      reviewItems: []
    };
  }

  // If we couldn't even find an amount for a financial benefit, flag for review
  if (type === "financial" && !parsedAmount) {
    reviewItems.push({
      id: `rev_benefit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      scheme_ref: schemeRef,
      field: "benefits",
      raw_text: text,
      evidence,
      reason: "Could not extract deterministic numeric amount from financial benefit description",
      confidence: "low",
      flagged_at: new Date().toISOString()
    });

    return {
      record: {
        scheme_ref: schemeRef,
        field: "benefits",
        value: null,
        evidence,
        confidence: "low",
        status: "found",
        note: "Financial benefit lacks quantifiable amount; sent to review queue"
      },
      reviewItems
    };
  }

  const benefitRow = {
    category,
    type,
    amount: parsedAmount ? parsedAmount.amount : null,
    currency: "INR",
    frequency,
    number_of_instalments: instalments,
    description: text
  };

  const confidence = parsedAmount && frequency !== "unspecified" ? "high" : "medium";

  return {
    record: {
      scheme_ref: schemeRef,
      field: "benefits",
      value: [benefitRow],
      evidence,
      confidence,
      status: "found"
    },
    reviewItems
  };
}

