/**
 * Eligibility Parser: Transforms messy scheme eligibility criteria into an AST
 * of conditions (concept, operator, value) combined with boolean AND/OR logic.
 *
 * Adheres strictly to Haqdarshak's core principle:
 * "Send anything you cannot map confidently to a review list, with the reason. Do not guess."
 */

import { parseIndianAmount, parseLandArea } from "./normalizers.js";

/**
 * @param {string} schemeRef
 * @param {string} rawText
 * @param {import('./types.js').Evidence} evidence
 * @returns {{ record: import('./types.js').FieldRecord, reviewItems: Array<import('./types.js').ReviewItem> }}
 */
export function parseEligibilityText(schemeRef, rawText, evidence) {
  const reviewItems = [];
  const text = rawText.trim();

  // 1. Check for subjective or unstandardized rules that cannot be automated
  const subjectivePatterns = [
    { regex: /good\s+moral\s+character/i, reason: "Subjective moral character criterion cannot be evaluated automatically" },
    { regex: /recommendation\s+(?:of|by)\s+(?:sarpanch|gram\s+sabha|mla|mp)/i, reason: "Subjective political/administrative recommendation requirement" },
    { regex: /ancestral\s+lineage/i, reason: "Ancestral lineage requirement lacks objective validation data" },
    { regex: /at\s+the\s+discretion\s+of/i, reason: "Discretionary authority approval required" },
    { regex: /reputed\s+institution/i, reason: "Unclear standard for 'reputed institution'" }
  ];

  for (const item of subjectivePatterns) {
    if (item.regex.test(text)) {
      reviewItems.push({
        id: `rev_elig_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        scheme_ref: schemeRef,
        field: "eligibility",
        raw_text: text,
        evidence,
        reason: item.reason,
        confidence: "low",
        flagged_at: new Date().toISOString()
      });

      return {
        record: {
          scheme_ref: schemeRef,
          field: "eligibility",
          value: null,
          evidence,
          confidence: "low",
          status: "found",
          note: `Flagged for human review: ${item.reason}`
        },
        reviewItems
      };
    }
  }

  // Check for explicit top-level OR combinator
  // e.g. "Farmers with land less than 2 hectares OR annual income below 1.5 lakh"
  const orSplit = text.split(/\s+\bOR\b\s+|\s+either\s+/i);
  if (orSplit.length > 1) {
    const subConditions = [];
    for (const part of orSplit) {
      const subResult = parseSingleEligibilityClause(part, schemeRef, evidence);
      if (subResult.condition) {
        subConditions.push(subResult.condition);
      }
      reviewItems.push(...subResult.reviewItems);
    }

    if (subConditions.length > 1) {
      const compoundOr = {
        type: "compound",
        combinator: "OR",
        conditions: subConditions
      };
      return {
        record: {
          scheme_ref: schemeRef,
          field: "eligibility",
          value: compoundOr,
          evidence,
          confidence: reviewItems.length === 0 ? "high" : "medium",
          status: "found"
        },
        reviewItems
      };
    }
  }

  // Parse clause (may return multiple simple conditions combined via AND)
  const clauseResult = parseSingleEligibilityClause(text, schemeRef, evidence);
  reviewItems.push(...clauseResult.reviewItems);

  if (!clauseResult.condition) {
    reviewItems.push({
      id: `rev_elig_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      scheme_ref: schemeRef,
      field: "eligibility",
      raw_text: text,
      evidence,
      reason: "Text does not match any recognized eligibility concept in taxonomy",
      confidence: "low",
      flagged_at: new Date().toISOString()
    });

    return {
      record: {
        scheme_ref: schemeRef,
        field: "eligibility",
        value: null,
        evidence,
        confidence: "low",
        status: "found",
        note: "No recognized eligibility rules matched; sent to review queue"
      },
      reviewItems
    };
  }

  return {
    record: {
      scheme_ref: schemeRef,
      field: "eligibility",
      value: clauseResult.condition,
      evidence,
      confidence: reviewItems.length === 0 ? "high" : "medium",
      status: "found"
    },
    reviewItems
  };
}

/**
 * @param {string} clauseText
 * @param {string} schemeRef
 * @param {import('./types.js').Evidence} evidence
 */
function parseSingleEligibilityClause(clauseText, schemeRef, evidence) {
  const extractedConditions = [];
  const reviewItems = [];
  const lower = clauseText.toLowerCase();

  // 1. Social Category (SC, ST, OBC, General, EWS)
  const scMatch = lower.match(/\b(sc\s*\/\s*st|sc\s+and\s+st|sc|st|obc|ews|general)\b/i);
  if (scMatch) {
    const rawMatch = scMatch[1].toUpperCase();
    let categories = [];
    if (rawMatch.includes("SC") && rawMatch.includes("ST")) {
      categories = ["SC", "ST"];
    } else if (rawMatch.includes("SC")) {
      categories = ["SC"];
    } else if (rawMatch.includes("ST")) {
      categories = ["ST"];
    } else if (rawMatch.includes("OBC")) {
      categories = ["OBC"];
    } else if (rawMatch.includes("EWS")) {
      categories = ["EWS"];
    } else if (rawMatch.includes("GENERAL")) {
      categories = ["General"];
    }

    if (categories.length > 0) {
      extractedConditions.push({
        type: "simple",
        concept: "social_category",
        operator: categories.length > 1 ? "in" : "==",
        value: categories.length > 1 ? categories : categories[0],
        raw_text: scMatch[0]
      });
    }
  }

  // 2. Annual Family Income
  const incomePos = clauseText.search(/\b(income|earning|household income)\b/i);
  if (incomePos !== -1) {
    const incomeSubstr = clauseText.slice(incomePos, incomePos + 50);
    const parsedAmt = parseIndianAmount(incomeSubstr);
    if (parsedAmt) {
      let op = "<=";
      const subLower = incomeSubstr.toLowerCase();
      if (subLower.includes("under") || subLower.includes("below") || subLower.includes("less than") || subLower.includes("up to")) {
        op = "<=";
      } else if (subLower.includes("above") || subLower.includes("more than") || subLower.includes("exceeding")) {
        op = ">=";
      }
      extractedConditions.push({
        type: "simple",
        concept: "annual_family_income",
        operator: op,
        value: parsedAmt.amount,
        unit: "INR",
        raw_text: incomeSubstr.trim()
      });
    }
  }

  // 3. Age conditions
  const ageRangeMatch = lower.match(/age\s*(?:between|from)?\s*(\d+)\s*(?:and|to|-)\s*(\d+)\s*(?:years|yrs)?/i);
  if (ageRangeMatch) {
    const minAge = parseInt(ageRangeMatch[1], 10);
    const maxAge = parseInt(ageRangeMatch[2], 10);
    extractedConditions.push({
      type: "simple",
      concept: "age",
      operator: ">=",
      value: minAge,
      unit: "years",
      raw_text: `age >= ${minAge}`
    });
    extractedConditions.push({
      type: "simple",
      concept: "age",
      operator: "<=",
      value: maxAge,
      unit: "years",
      raw_text: `age <= ${maxAge}`
    });
  } else {
    const singleAgeMatch = lower.match(/(?:age|aged)\s*(?:of)?\s*(above|>|>=|under|<|<=|at least)?\s*(\d+)\s*(?:years|yrs)?\s*(and above|or more|or older)?/i);
    if (singleAgeMatch) {
      const ageVal = parseInt(singleAgeMatch[2], 10);
      let op = ">=";
      if (
        singleAgeMatch[1]?.includes("under") ||
        singleAgeMatch[1]?.includes("<") ||
        lower.includes("below")
      ) {
        op = "<=";
      }
      extractedConditions.push({
        type: "simple",
        concept: "age",
        operator: op,
        value: ageVal,
        unit: "years",
        raw_text: singleAgeMatch[0].trim()
      });
    }
  }

  // 4. Gender
  if (/\b(women|woman|female|girl|widow)\b/i.test(clauseText)) {
    extractedConditions.push({
      type: "simple",
      concept: "gender",
      operator: "==",
      value: "female",
      raw_text: "female"
    });
  } else if (/\b(men|man|male|boy)\b/i.test(clauseText) && !/women|female/i.test(clauseText)) {
    extractedConditions.push({
      type: "simple",
      concept: "gender",
      operator: "==",
      value: "male",
      raw_text: "male"
    });
  }

  // 5. Marital status
  if (/\bwidows?\b/i.test(clauseText)) {
    extractedConditions.push({
      type: "simple",
      concept: "marital_status",
      operator: "==",
      value: "widow",
      raw_text: "widow"
    });
  } else if (/\b(divorced|abandoned|destitute)\b/i.test(clauseText)) {
    extractedConditions.push({
      type: "simple",
      concept: "marital_status",
      operator: "in",
      value: ["divorced", "abandoned", "destitute"],
      raw_text: "divorced/abandoned/destitute"
    });
  }

  // 6. Disability percentage
  const disMatch = clauseText.match(/disability\s*(?:of)?\s*(\d+)%\s*(?:and above|or more|\+)?/i);
  if (disMatch) {
    extractedConditions.push({
      type: "simple",
      concept: "disability_percentage",
      operator: ">=",
      value: parseInt(disMatch[1], 10),
      unit: "percent",
      raw_text: disMatch[0]
    });
  }

  // 7. Land ownership
  const landArea = parseLandArea(clauseText);
  if (landArea) {
    let op = "<=";
    if (lower.includes("more than") || lower.includes("above") || lower.includes(">")) {
      op = ">=";
    }
    extractedConditions.push({
      type: "simple",
      concept: "land_ownership_acres",
      operator: op,
      value: landArea.acres,
      unit: "acres",
      raw_text: landArea.raw
    });
  }

  // 8. Occupation
  if (/\b(small and marginal farmers?|farmers?|cultivator)\b/i.test(clauseText)) {
    extractedConditions.push({
      type: "simple",
      concept: "occupation",
      operator: "in",
      value: ["farmer", "small_farmer", "marginal_farmer"],
      raw_text: "farmer"
    });
  } else if (/\b(construction workers?|bocw)\b/i.test(clauseText)) {
    extractedConditions.push({
      type: "simple",
      concept: "occupation",
      operator: "==",
      value: "construction_worker",
      raw_text: "construction_worker"
    });
  } else if (/\b(street vendors?)\b/i.test(clauseText)) {
    extractedConditions.push({
      type: "simple",
      concept: "occupation",
      operator: "==",
      value: "street_vendor",
      raw_text: "street_vendor"
    });
  }

  // 9. State / Domicile
  const stateMatch = clauseText.match(
    /(?:resident of|domicile of|native of)\s+([A-Z][a-zA-Z\s]+?)(?:\s+only|\.|\,|$)/i
  );
  if (stateMatch) {
    const stateName = stateMatch[1].trim();
    extractedConditions.push({
      type: "simple",
      concept: "state",
      operator: "==",
      value: stateName,
      raw_text: stateMatch[0].trim()
    });
  }

  if (extractedConditions.length === 0) {
    return { condition: null, reviewItems };
  }

  if (extractedConditions.length === 1) {
    return { condition: extractedConditions[0], reviewItems };
  }

  return {
    condition: {
      type: "compound",
      combinator: "AND",
      conditions: extractedConditions
    },
    reviewItems
  };
}

