/**
 * Normalization utilities for parsing messy Indian government scheme text.
 */

const NUMBER_WORDS = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  twelve: 12
};

/**
 * Normalizes Indian currency expressions (e.g. "₹2.5 lakh", "Rs. 6,000", "5 crore", "Rs 50,000/-")
 * into a standard numeric amount.
 * @param {string} text
 * @returns {{ amount: number, raw: string } | null}
 */
export function parseIndianAmount(text) {
  if (!text) return null;

  // Pattern 1: Lakhs / Lacs (e.g. "₹2.5 lakh", "2.5 Lakhs", "Rs. 2.5 lac", "2.5L")
  const lakhMatch = text.match(
    /(?:₹|rs\.?|inr)?\s*([0-9]+(?:\.[0-9]+)?)\s*(?:lakh|lakhs|lac|lacs|l)\b/i
  );
  if (lakhMatch) {
    const val = parseFloat(lakhMatch[1]);
    return { amount: Math.round(val * 100000), raw: lakhMatch[0].trim() };
  }

  // Pattern 2: Crores (e.g. "₹5 crore", "5 cr")
  const croreMatch = text.match(
    /(?:₹|rs\.?|inr)?\s*([0-9]+(?:\.[0-9]+)?)\s*(?:crore|crores|cr)\b/i
  );
  if (croreMatch) {
    const val = parseFloat(croreMatch[1]);
    return { amount: Math.round(val * 10000000), raw: croreMatch[0].trim() };
  }

  // Pattern 3: Standard currency with ₹, Rs, INR or comma-separated numbers (e.g. "₹50,000", "Rs. 6,000")
  const standardMatch = text.match(
    /(?:₹|rs\.?|inr)\s*([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]+)?|[0-9]+)(?:\s*\/-)?/i
  );
  if (standardMatch) {
    const cleanStr = standardMatch[1].replace(/,/g, "");
    const val = parseFloat(cleanStr);
    return { amount: val, raw: standardMatch[0].trim() };
  }

  // Pattern 4: Comma-separated numbers without explicit currency symbol (e.g. "50,000", "1,50,000")
  const commaNumberMatch = text.match(/([0-9]{1,3}(?:,[0-9]{2,3})+)/);
  if (commaNumberMatch) {
    const cleanStr = commaNumberMatch[1].replace(/,/g, "");
    return { amount: parseFloat(cleanStr), raw: commaNumberMatch[0].trim() };
  }

  // Pattern 5: Bare numbers preceded/followed by words like "amount of 6000" or "grant of 50000"
  const contextMatch = text.match(
    /(?:grant|assistance|pension|benefit|amount|loan|cover|subsidy|sum)\s*(?:of)?\s*(?:rs\.?|₹|inr)?\s*([0-9]{1,3}(?:,[0-9]{2,3})+|[0-9]{3,8})/i
  );
  if (contextMatch) {
    const cleanStr = contextMatch[1].replace(/,/g, "");
    return { amount: parseFloat(cleanStr), raw: contextMatch[0].trim() };
  }

  return null;
}

/**
 * Parses payment frequency from raw text.
 * @param {string} text
 * @returns {'one_time' | 'monthly' | 'quarterly' | 'annual' | 'per_instalment' | 'unspecified'}
 */
export function parseFrequency(text) {
  const lower = text.toLowerCase();

  if (
    lower.includes("one-time") ||
    lower.includes("one time") ||
    lower.includes("lump sum") ||
    lower.includes("lumpsum") ||
    lower.includes("single instalment")
  ) {
    return "one_time";
  }

  if (
    lower.includes("per month") ||
    lower.includes("a month") ||
    lower.includes("monthly") ||
    lower.includes("p.m.") ||
    lower.includes("/month")
  ) {
    return "monthly";
  }

  if (
    lower.includes("quarterly") ||
    lower.includes("every 4 months") ||
    lower.includes("per quarter")
  ) {
    return "quarterly";
  }

  if (
    lower.includes("per year") ||
    lower.includes("a year") ||
    lower.includes("annually") ||
    lower.includes("per annum") ||
    lower.includes("p.a.") ||
    lower.includes("/year") ||
    lower.includes("annual")
  ) {
    return "annual";
  }

  if (lower.includes("per instalment") || lower.includes("each instalment")) {
    return "per_instalment";
  }

  return "unspecified";
}

/**
 * Extracts number of instalments (e.g. "three instalments", "in 3 equal instalments", "4 instalments")
 * @param {string} text
 * @returns {number | null}
 */
export function parseInstalments(text) {
  const lower = text.toLowerCase();

  // Pattern: "three instalments" or "3 instalments"
  const match = lower.match(
    /(?:in\s+)?(\d+|one|two|three|four|five|six|seven|eight|nine|ten|twelve)\s*(?:equal\s+)?(?:instalments?|installments?|tranches?)/i
  );
  if (match) {
    const token = match[1].toLowerCase();
    if (NUMBER_WORDS[token]) return NUMBER_WORDS[token];
    const n = parseInt(token, 10);
    return isNaN(n) ? null : n;
  }

  // Pattern: "3 times a year"
  const timesMatch = lower.match(
    /(\d+|one|two|three|four)\s+times\s+(?:a|per)\s+(?:year|annum)/i
  );
  if (timesMatch) {
    const token = timesMatch[1].toLowerCase();
    return NUMBER_WORDS[token] || parseInt(token, 10) || null;
  }

  return null;
}

/**
 * Normalizes land area into acres (e.g. "2 hectares", "5 acres")
 * @param {string} text
 * @returns {{ acres: number, raw: string } | null}
 */
export function parseLandArea(text) {
  const hectareMatch = text.match(/([0-9]+(?:\.[0-9]+)?)\s*(?:hectares?|ha)\b/i);
  if (hectareMatch) {
    const ha = parseFloat(hectareMatch[1]);
    return { acres: parseFloat((ha * 2.47105).toFixed(2)), raw: hectareMatch[0] };
  }

  const acreMatch = text.match(/([0-9]+(?:\.[0-9]+)?)\s*(?:acres?)\b/i);
  if (acreMatch) {
    return { acres: parseFloat(acreMatch[1]), raw: acreMatch[0] };
  }

  return null;
}

