/**
 * Interactive / CLI runner for Scheme Knowledge Base Ingestion Engine.
 * Run with: npm start
 */

import { SAMPLE_SCHEMES } from "./data/sampleSchemes.js";
import { processScheme } from "./pipeline.js";
import { calculateAICost } from "./aiFallback.js";

console.log("=".repeat(80));
console.log("  HAQDARSHAK · SCHEME KNOWLEDGE BASE");
console.log("  S2: Field Inputs to Schema Ingestion Engine");
console.log("=".repeat(80));
console.log(`\nIngesting ${SAMPLE_SCHEMES.length} synthetic government welfare schemes...\n`);

const processed = SAMPLE_SCHEMES.map(processScheme);

let totalBenefits = 0;
let totalConditions = 0;
let totalReviewItems = 0;
let totalConflicts = 0;

for (const p of processed) {
  totalBenefits += p.benefits.length;
  if (p.eligibility_ast) totalConditions++;
  totalReviewItems += p.review_queue.length;
  totalConflicts += p.conflicts.length;
}

console.log("┌" + "─".repeat(78) + "┐");
console.log(`│ INGESTION SUMMARY:                                                           │`);
console.log(`│ • Total Schemes Processed:       ${processed.length.toString().padEnd(43)} │`);
console.log(`│ • Structured Benefit Rows:       ${totalBenefits.toString().padEnd(43)} │`);
console.log(`│ • Structured Eligibility ASTs:   ${totalConditions.toString().padEnd(43)} │`);
console.log(`│ • Sent to Human Review Queue:    ${totalReviewItems.toString().padEnd(43)} │`);
console.log(`│ • Discrepancies / Conflicts:     ${totalConflicts.toString().padEnd(43)} │`);
console.log("└" + "─".repeat(78) + "┘\n");

console.log("─".repeat(80));
console.log("DETAIL PER SCHEME:");
console.log("─".repeat(80));

for (const s of processed) {
  console.log(`\n▶ [${s.scheme_ref}] ${s.scheme_name}`);

  // Benefits
  console.log("  BENEFITS ROW(S):");
  if (s.benefits.length === 0) {
    console.log("    (None structured / forwarded to review queue)");
  } else {
    for (const b of s.benefits) {
      console.log(
        `    • Category: ${b.category.padEnd(24)} | Type: ${b.type.padEnd(10)} | Amount: ${b.currency} ${(b.amount ?? "N/A").toString().padEnd(8)} | Freq: ${b.frequency.padEnd(10)} | Instalments: ${b.number_of_instalments ?? "N/A"}`
      );
    }
  }

  // Eligibility AST
  console.log("  ELIGIBILITY AST:");
  if (!s.eligibility_ast) {
    console.log("    (None structured / flagged for human review or conflict)");
  } else {
    console.log("    " + JSON.stringify(s.eligibility_ast, null, 2).replace(/\n/g, "\n    "));
  }

  // Review Queue Items
  if (s.review_queue.length > 0) {
    console.log("  ⚠️  DISPATCHED TO REVIEW QUEUE (Do not guess principle):");
    for (const r of s.review_queue) {
      console.log(`    - Field: [${r.field}]`);
      console.log(`      Reason: "${r.reason}"`);
      console.log(`      Raw Text: "${r.raw_text}"`);
      console.log(`      Evidence: ${r.evidence.location} (${r.evidence.source_ref})`);
    }
  }

  // Conflicts
  if (s.conflicts.length > 0) {
    console.log("  ⚡ CONFLICT DETECTED (Preserving all source versions):");
    for (const c of s.conflicts) {
      console.log(`    - Source: ${c.evidence?.location} [${c.evidence?.captured_date}]`);
      console.log(`      Value: ${JSON.stringify(c.value)}`);
    }
  }
}

// AI Cost Estimates
console.log("\n" + "=".repeat(80));
console.log("AI MODEL COST ANALYSIS (For Fallback / Assistance on Complex Inputs)");
console.log("=".repeat(80));

const geminiCost = calculateAICost("gemini-1.5-flash");
const gptCost = calculateAICost("gpt-4o-mini");
const claudeCost = calculateAICost("claude-3-5-haiku");

console.log("\nReference: 650 input tokens (prompt + taxonomy) + 180 output tokens (AST JSON)\n");
console.log(
  `| Model                         | Cost / Scheme (USD) | Cost / Scheme (INR) | 5,000 Schemes Total |`
);
console.log(
  `|-------------------------------|---------------------|---------------------|---------------------|`
);
console.log(
  `| ${geminiCost.model.padEnd(29)} | $${geminiCost.costPerSchemeUSD.toFixed(6).padEnd(17)} | ₹${geminiCost.costPerSchemeINR.toFixed(4).padEnd(17)} | ₹${geminiCost.costFor5000SchemesINR.toFixed(2).padEnd(17)} |`
);
console.log(
  `| ${gptCost.model.padEnd(29)} | $${gptCost.costPerSchemeUSD.toFixed(6).padEnd(17)} | ₹${gptCost.costPerSchemeINR.toFixed(4).padEnd(17)} | ₹${gptCost.costFor5000SchemesINR.toFixed(2).padEnd(17)} |`
);
console.log(
  `| ${claudeCost.model.padEnd(29)} | $${claudeCost.costPerSchemeUSD.toFixed(6).padEnd(17)} | ₹${claudeCost.costPerSchemeINR.toFixed(4).padEnd(17)} | ₹${claudeCost.costFor5000SchemesINR.toFixed(2).padEnd(17)} |`
);

console.log(
  "\nKey Takeaway: With Gemini 1.5 Flash, the entire 5,000 schemes catalogue costs less than ₹45 total to parse drafts with AI!"
);
console.log("=".repeat(80) + "\n");

