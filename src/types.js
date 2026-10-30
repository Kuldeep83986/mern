/**
 * Core type definitions for Haqdarshak Scheme Knowledge Base (JSDoc format).
 * Follows the standard Field Format specified in the assignment brief.
 *
 * @typedef {Object} Evidence
 * @property {string} source_text - The exact raw text snippet from the document
 * @property {string} location - Location within source (e.g. "Page 3, Section 4.1")
 * @property {string} source_ref - Source link or synthetic document name
 * @property {string} captured_date - ISO date string when captured
 *
 * @typedef {'high' | 'medium' | 'low' | number} Confidence
 *
 * @typedef {'found' | 'not found' | 'conflict'} FieldStatus
 *
 * @typedef {Object} FieldRecord
 * @property {string} scheme_ref - Which scheme this belongs to
 * @property {string} field - Field name (e.g. "benefits", "eligibility")
 * @property {any} value - Value, or null if not found
 * @property {Evidence | null} evidence - Source evidence
 * @property {Confidence} confidence - How sure we are
 * @property {FieldStatus} status - found, not found, or conflict
 * @property {string} [note] - Optional reason or conflict note
 *
 * @typedef {Object} BenefitRow
 * @property {string} category - e.g. direct_benefit_transfer, subsidized_loan
 * @property {'financial' | 'credit' | 'insurance' | 'physical_asset' | 'service' | 'waiver'} type
 * @property {number | null} amount - Numeric amount in INR
 * @property {string} currency - Standard currency code (INR)
 * @property {'one_time' | 'monthly' | 'quarterly' | 'annual' | 'per_instalment' | 'unspecified'} frequency
 * @property {number | null} number_of_instalments - Count of instalments
 * @property {string} [description] - Raw or synthesized description
 *
 * @typedef {Object} SimpleCondition
 * @property {'simple'} type
 * @property {string} concept - Standardized concept name
 * @property {'==' | '!=' | '>' | '>=' | '<' | '<=' | 'in' | 'not_in'} operator
 * @property {string | number | boolean | Array<string | number>} value
 * @property {string} [unit]
 * @property {string} [raw_text]
 *
 * @typedef {Object} CompoundCondition
 * @property {'compound'} type
 * @property {'AND' | 'OR'} combinator
 * @property {Array<SimpleCondition | CompoundCondition>} conditions
 *
 * @typedef {SimpleCondition | CompoundCondition} EligibilityCondition
 *
 * @typedef {Object} ReviewItem
 * @property {string} id
 * @property {string} scheme_ref
 * @property {string} field
 * @property {string} raw_text
 * @property {Evidence} evidence
 * @property {string} reason
 * @property {Confidence} confidence
 * @property {any} [suggested_draft]
 * @property {string} flagged_at
 */

export const FIELD_STATUSES = ["found", "not found", "conflict"];

