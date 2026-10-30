/**
 * AI Model Adapter & Cost Estimator for Haqdarshak Scheme Knowledge Base.
 *
 * Implements a hybrid approach:
 * 1. Fast, deterministic, free rule engines run first.
 * 2. Unmapped / complex natural language inputs can be passed to an LLM
 *    to propose a draft schema mapping.
 * 3. Crucially: Any AI-generated structure remains in "draft" status and
 *    MUST be reviewed by a human prior to publication.
 */

export const SUPPORTED_MODELS = {
  "gemini-1.5-flash": {
    modelName: "Google Gemini 1.5 Flash",
    version: "v1.5-flash-002",
    costPer1MInputTokensUSD: 0.075,
    costPer1MOutputTokensUSD: 0.30
  },
  "gpt-4o-mini": {
    modelName: "OpenAI GPT-4o-mini",
    version: "2024-07-18",
    costPer1MInputTokensUSD: 0.15,
    costPer1MOutputTokensUSD: 0.60
  },
  "claude-3-5-haiku": {
    modelName: "Anthropic Claude 3.5 Haiku",
    version: "2024-10-22",
    costPer1MInputTokensUSD: 0.80,
    costPer1MOutputTokensUSD: 4.00
  }
};

/**
 * Calculates accurate pricing per scheme and for the entire Haqdarshak catalogue of 5,000 schemes.
 * @param {'gemini-1.5-flash' | 'gpt-4o-mini' | 'claude-3-5-haiku'} [modelKey]
 * @param {number} [avgInputTokens]
 * @param {number} [avgOutputTokens]
 * @param {number} [usdToInrRate]
 */
export function calculateAICost(
  modelKey = "gemini-1.5-flash",
  avgInputTokens = 650,
  avgOutputTokens = 180,
  usdToInrRate = 84.0
) {
  const model = SUPPORTED_MODELS[modelKey];
  const inputCost = (avgInputTokens / 1_000_000) * model.costPer1MInputTokensUSD;
  const outputCost = (avgOutputTokens / 1_000_000) * model.costPer1MOutputTokensUSD;
  const costPerSchemeUSD = inputCost + outputCost;
  const costPerSchemeINR = costPerSchemeUSD * usdToInrRate;

  return {
    model: model.modelName,
    version: model.version,
    estimatedInputTokens: avgInputTokens,
    estimatedOutputTokens: avgOutputTokens,
    costPerSchemeUSD: parseFloat(costPerSchemeUSD.toFixed(6)),
    costPerSchemeINR: parseFloat(costPerSchemeINR.toFixed(4)),
    costFor5000SchemesUSD: parseFloat((costPerSchemeUSD * 5000).toFixed(2)),
    costFor5000SchemesINR: parseFloat((costPerSchemeINR * 5000).toFixed(2))
  };
}

/**
 * Mockable AI Draft Generator
 * In production, this calls the LLM endpoint with structured schema outputs (JSON Schema / Zod).
 * @param {string} rawSnippet
 * @param {'benefits' | 'eligibility'} fieldType
 * @param {'gemini-1.5-flash' | 'gpt-4o-mini' | 'claude-3-5-haiku'} [modelKey]
 */
export function generateAIDraftProposal(
  rawSnippet,
  fieldType,
  modelKey = "gemini-1.5-flash"
) {
  return {
    suggestedDraft: {
      type: "ai_draft_candidate",
      parsed_from: rawSnippet,
      suggested_concept: fieldType === "eligibility" ? "candidate_unstandardized_concept" : "candidate_benefit",
      requires_reviewer_confirmation: true
    },
    confidence: "medium",
    reasoning: `Model (${SUPPORTED_MODELS[modelKey].modelName}) extracted candidate mapping. Human sign-off mandatory.`,
    sourceAttribution: rawSnippet
  };
}

