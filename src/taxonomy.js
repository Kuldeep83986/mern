/**
 * Standard Taxonomy for Haqdarshak Scheme Knowledge Base
 * Defines standardized concepts, data types, valid operators, and benefit classifications.
 */

export const ELIGIBILITY_CONCEPTS = {
  age: {
    name: "age",
    description: "Applicant age in completed years",
    dataType: "number",
    allowedOperators: ["==", ">=", "<=", ">", "<", "!="],
    unit: "years",
    aliases: ["age", "years of age", "years old", "aged", "age group"]
  },
  annual_family_income: {
    name: "annual_family_income",
    description: "Total annual household or family income in INR",
    dataType: "number",
    allowedOperators: ["<=", "<", "==", ">=", ">"],
    unit: "INR",
    aliases: [
      "income",
      "annual income",
      "family income",
      "annual family income",
      "household income",
      "total income"
    ]
  },
  social_category: {
    name: "social_category",
    description: "Caste or social category of the beneficiary",
    dataType: "list",
    allowedOperators: ["in", "==", "!=", "not_in"],
    allowedValues: ["SC", "ST", "OBC", "General", "EWS", "Minority", "PVTG"],
    aliases: [
      "caste",
      "social category",
      "category",
      "community",
      "sc",
      "st",
      "obc",
      "scheduled caste",
      "scheduled tribe"
    ]
  },
  gender: {
    name: "gender",
    description: "Target beneficiary gender",
    dataType: "string",
    allowedOperators: ["==", "!=", "in"],
    allowedValues: ["female", "male", "transgender", "all"],
    aliases: ["gender", "sex", "women", "men", "female", "male", "girl", "transgender"]
  },
  marital_status: {
    name: "marital_status",
    description: "Beneficiary marital status",
    dataType: "list",
    allowedOperators: ["in", "==", "!="],
    allowedValues: ["single", "married", "widow", "divorced", "abandoned", "destitute"],
    aliases: ["marital status", "widow", "divorced", "separated", "destitute woman", "unmarried"]
  },
  state: {
    name: "state",
    description: "State or UT residency requirement",
    dataType: "string",
    allowedOperators: ["==", "in", "!="],
    aliases: ["state", "domicile", "resident of", "union territory", "native of"]
  },
  disability_percentage: {
    name: "disability_percentage",
    description: "Certified benchmark disability percentage",
    dataType: "number",
    allowedOperators: [">=", ">", "=="],
    unit: "percent",
    aliases: ["disability", "disabled", "benchmark disability", "divyang", "handicapped"]
  },
  land_ownership_acres: {
    name: "land_ownership_acres",
    description: "Agricultural land holding in acres",
    dataType: "number",
    allowedOperators: ["<=", "<", "==", ">=", ">"],
    unit: "acres",
    aliases: ["land holding", "land", "agricultural land", "cultivable land", "acres", "hectares"]
  },
  occupation: {
    name: "occupation",
    description: "Beneficiary occupation sector",
    dataType: "list",
    allowedOperators: ["in", "==", "!="],
    allowedValues: [
      "farmer",
      "small_farmer",
      "marginal_farmer",
      "construction_worker",
      "artisan",
      "weaver",
      "street_vendor",
      "domestic_worker",
      "fisherfolk",
      "student"
    ],
    aliases: [
      "farmer",
      "cultivator",
      "construction worker",
      "unorganized worker",
      "street vendor",
      "artisan",
      "bocw"
    ]
  }
};

export const BENEFIT_CATEGORIES = [
  "direct_benefit_transfer",
  "subsidized_loan",
  "insurance_cover",
  "in_kind",
  "fee_waiver",
  "pension",
  "scholarship",
  "other"
];

export const BENEFIT_TYPES = [
  "financial",
  "credit",
  "insurance",
  "physical_asset",
  "service",
  "waiver"
];

