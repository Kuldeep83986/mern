# Haqdarshak Scheme Knowledge Base · S2 (Field Inputs to Schema)

An automated ingestion engine that transforms messy, unstructured Indian government scheme texts into standardized, queryable schema records (Benefit rows and Eligibility ASTs) while upholding Haqdarshak's two core principles:
1. **A person always checks before anything goes live.**
2. **Every fact points back to its source.** ("Do not guess").

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v18+ (tested on Node v20/v24).
- Built using **pure modern standard JavaScript (ESM)**. No build tools, babel, or external npm packages required.

### Run Ingestion Engine
```bash
npm start
```
*Parses the synthetic dataset of central & state welfare schemes, displays structured benefit rows, boolean eligibility ASTs, the human review queue, conflict detections, and the AI cost analysis.*

### Run Automated Test Suite
```bash
npm test
```
*Executes all 17 unit tests verifying parsing logic, Indian number/currency normalizers, compound boolean expressions, provenance tracking, and edge-case handling.*

---

## 🏛️ Architecture & System Design

```
                     ┌──────────────────────────────────────────────┐
                     │ Raw Government Scheme Documents / Circulars  │
                     └──────────────────────┬───────────────────────┘
                                            │
                                            ▼
                     ┌──────────────────────────────────────────────┐
                     │          Provenance Capture & Parser         │
                     │  (Extracts raw_text, location, source, date) │
                     └──────────────────────┬───────────────────────┘
                                            │
                                            ▼
              ┌───────────────────────────────────────────────────────────┐
              │           Deterministic Rule-Based Parser                 │
              │  • Indian currency (Lakhs, Crores, ₹, Rs)                │
              │  • Benefit categories (DBT, Loan, Insurance, In-kind)     │
              │  • Eligibility conditions (Age, Income, Caste, Land)      │
              │  • Boolean AST Builder (AND / OR)                         │
              └─────────────────────────────┬─────────────────────────────┘
                                            │
                     ┌──────────────────────┴──────────────────────┐
                     ▼                                             ▼
       [High/Medium Confidence]                      [Low Confidence / Ambiguous]
                     │                                             │
                     ▼                                             ▼
      ┌─────────────────────────────┐               ┌─────────────────────────────┐
      │  Structured Scheme Records  │               │      Human Review Queue     │
      │  • Benefit Rows             │               │  (Flagged with exact reason │
      │  • Eligibility AST          │               │   + raw source evidence)    │
      └─────────────────────────────┘               └──────────────┬──────────────┘
                                                                   │
                                                                   ▼
                                                    ┌─────────────────────────────┐
                                                    │ Optional LLM Draft Proposal │
                                                    │ (Gemini 1.5 Flash Fallback) │
                                                    └─────────────────────────────┘
```

---

## 📋 Data Formats & Schemas

### 1. Standard Field Format
Every extracted scheme attribute adheres to Haqdarshak's standard field representation:
```typescript
interface FieldRecord<T> {
  scheme_ref: string;       // Scheme ID or source document identifier
  field: string;            // Field name (e.g. "benefits", "eligibility")
  value: T | null;          // Structured value or null if unmappable
  evidence: Evidence | null;// Exact source text, page/section, source link, capture date
  confidence: "high" | "medium" | "low";
  status: "found" | "not found" | "conflict";
  note?: string;            // Reason for review or conflict details
}
```

### 2. Benefit Row Format
Converts text like *"₹6,000 per year in three equal instalments"* into:
```json
{
  "category": "direct_benefit_transfer",
  "type": "financial",
  "amount": 6000,
  "currency": "INR",
  "frequency": "annual",
  "number_of_instalments": 3,
  "description": "Financial benefit of ₹6,000 per year..."
}
```

### 3. Eligibility Condition AST Format
Converts compound text like *"SC/ST families with income under ₹2.5 lakh"* into:
```json
{
  "type": "compound",
  "combinator": "AND",
  "conditions": [
    {
      "type": "simple",
      "concept": "social_category",
      "operator": "in",
      "value": ["SC", "ST"]
    },
    {
      "type": "simple",
      "concept": "annual_family_income",
      "operator": "<=",
      "value": 250000,
      "unit": "INR"
    }
  ]
}
```

---

## 💡 AI Model Integration & Cost Analysis

If an LLM is used to propose drafts for unmapped natural language rules:

| Model | Model Version | Cost / 1M Input | Cost / 1M Output | Cost / Scheme (USD) | Cost / Scheme (INR) | 5,000 Schemes Total |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Google Gemini 1.5 Flash** (Recommended) | `v1.5-flash-002` | $0.075 | $0.30 | **$0.000103** | **₹0.0086** (less than 1 paisa) | **₹43.16** |
| **OpenAI GPT-4o-mini** | `2024-07-18` | $0.15 | $0.60 | $0.000206 | ₹0.0173 | ₹86.31 |
| **Anthropic Claude 3.5 Haiku** | `2024-10-22` | $0.80 | $4.00 | $0.001240 | ₹0.1042 | ₹520.80 |

*Token Assumptions:* Prompt context (schema + taxonomy) ~650 input tokens; JSON response ~180 output tokens. USD/INR = ₹84.0.

---

## ⚖️ Key Engineering Decisions

### 1. Decision Made vs Option Decided Against
* **Decision Made:** A **Deterministic Rule-First Hybrid Architecture**. Regular expressions, unit normalizers (Lakh/Crore/Hectare), and an Abstract Syntax Tree (AST) evaluator process 80%+ of standard government patterns deterministically. Low-confidence or unmapped texts fall through to a human review queue with optional LLM draft proposals.
* **Option Decided Against:** Relying exclusively on an end-to-end LLM prompt (`prompt -> JSON`). While tempting, pure LLM extraction can suffer from subtle hallucinations (e.g. converting "₹6,000 in 3 instalments" to 18,000, or assuming criteria not in the text). It also introduces network latency, rate limits, and non-zero recurring costs.

### 2. Main Assumptions Made & Why
1. **Currency & Unit Assumptions**: All un-denominated monetary amounts in Indian welfare documents are assumed to be INR. 1 Hectare is normalized to 2.47105 Acres for standardized land holding eligibility checks.
2. **Instalments vs Frequency**: If a scheme states *"₹6,000 a year in three instalments"*, the annual benefit is recorded as ₹6,000 and `number_of_instalments` is recorded as 3 (rather than 3 separate rows of ₹2,000).
3. **Conflicts Between Department Circulars**: When older guidelines and newly published gazettes disagree (e.g. income threshold raised from ₹2L to ₹2.5L), the engine does not attempt automated reconciliation. It flags `status: "conflict"`, preserves all source versions with timestamps, and blocks publication until a human researcher signs off.

### 3. What Was Deliberately Left Out
- **Full Database & ORM Layer**: Left out in favor of clean in-memory models and pure functional pipelines to keep the code lightweight, easily testable, and dependency-free.
- **Complex AST Boolean Minimization**: Expressions like `(A AND B) OR (A AND C)` are stored as parsed without applying Boolean algebra simplifications (e.g. Karnaugh maps), prioritizing human auditability over AST compactness.

### 4. Where This Falls Short & How Someone Would Notice
- **Complex nested parentheses with mixed operator precedence**: E.g. *"((Widow AND age > 45) OR disabled) AND (income < 1.5L OR BPL card holder)"*. While the current AST supports nested compound conditions, deeply interleaved natural language syntax with multiple subordinating conjunctions requires either human breakdown or LLM-assisted tree generation. A reviewer would notice this when an unusual phrasing is routed to the Review Queue.

---

## 🎤 Walkthrough & Discussion Points

### S2 "Also Explain": Where you used plain rules, where you would use a model, and why
- **Plain Rules (Deterministic Parsers):** Used for currency parsing (`₹`, `lakh`, `crore`), frequencies (`monthly`, `quarterly`, `annual`), age thresholds, land conversions, and standard social categories (`SC`, `ST`, `OBC`, `EWS`).
  - *Why:* Zero latency, zero cost, 100% reproducible, zero risk of hallucination.
- **Model (LLM like Gemini 1.5 Flash):** Used when natural language criteria are descriptive or unstandardized (e.g., *"Single women living alone in rural pucca-less homes"*).
  - *Why:* Semantic reasoning can propose a draft mapping to existing taxonomy concepts.
  - *Guardrail:* The model's output is strictly treated as a **draft candidate** (`requires_reviewer_confirmation: true`) and never published automatically.

### S2 "Question about how you work": You notice the concept list is missing something obvious. Do you add it yourself? What do you do?
> *"I do not add it directly to production code or change the taxonomy schema unilaterally.*
>
> *In a welfare scheme database, arbitrarily adding concepts without standardization breaks downstream eligibility checks for field agents and chatbot queries.*
>
> *What I would do:*
> 1. *Route the scheme to the **Human Review Queue** with a tag: `unmapped_concept: <candidate_name>`.*
> 2. *Log and track frequency of this missing concept across other incoming schemes.*
> 3. *Bring the proposal to the weekly taxonomy/policy sync with the field research team, presenting the data type, allowed operators, and unit.*
> 4. *Once agreed upon, add the standardized concept, write unit tests for it, and version the taxonomy schema."*

---

## 📂 Project Structure

```
haqdarshak-scheme-knowledge-base/
├── package.json              # Zero-dependency npm configuration
├── src/
│   ├── types.js              # JSDoc definitions: FieldRecord, BenefitRow, AST, Evidence
│   ├── taxonomy.js           # Standardized concepts, allowed operators, types
│   ├── normalizers.js        # Indian currency, lakh/crore, land, frequency
│   ├── benefitParser.js      # Benefit text to BenefitRow parser + review triggers
│   ├── eligibilityParser.js  # Eligibility text to boolean Condition AST
│   ├── pipeline.js           # End-to-end ingestion, conflict & provenance handler
│   ├── aiFallback.js         # LLM fallback adapter and cost calculator
│   ├── data/
│   │   └── sampleSchemes.js  # Authentic Central & State scheme dataset
│   └── cli.js                # Terminal runner with summary tables & metrics
├── tests/
│   ├── benefitParser.test.js # Tests for benefits extraction & review triggers
│   ├── eligibilityParser.test.js # Tests for conditions, AST, AND/OR logic
│   ├── pipeline.test.js      # Tests for provenance, conflict preservation
│   └── edgeCases.test.js     # Tests for Lakhs, Crores, hectares, unmapped text
├── README.md                 # Project documentation & assignment brief mapping
└── WALKTHROUGH.md            # Step-by-step 10-minute presentation guide
```
