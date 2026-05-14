/**
 * Full-workflow example #3: Weekly memory hygiene.
 *
 * Scenario:
 *   It's Friday afternoon. The memory store has been accumulating for two
 *   weeks. Without periodic review, low-value memories pile up and degrade
 *   recall ranking. The agent runs a weekly maintenance pass:
 *
 *     1. Pull the analytics dashboard
 *     2. Identify stale memories (no recall in 14+ days)
 *     3. Bulk-update the obviously-obsolete ones (e.g., closed bugs)
 *     4. Mark the still-useful-but-rarely-recalled ones with feedback
 *        so the ranker gives them appropriate weight
 *     5. List tag usage to spot drift (typos, near-duplicates)
 *
 *   This is the pattern that keeps a long-running memory store sharp.
 *
 * Tools exercised:
 *   - mcp__cogmemai__get_analytics         (overall usage + health metrics)
 *   - mcp__cogmemai__get_stale_memories    (candidates for cleanup)
 *   - mcp__cogmemai__bulk_update           (mass importance/category fixes)
 *   - mcp__cogmemai__feedback_memory       (tune ranker on useful/not)
 *   - mcp__cogmemai__list_tags             (spot tag drift)
 *
 * Run:
 *   npx tsx examples/full-workflow/analytics-review.ts
 */

import { query } from "@anthropic-ai/claude-agent-sdk";

const hygienePrompt = `
Run the weekly memory hygiene pass for the full-workflow-demo project.

Step 1: Pull the analytics dashboard. Summarize: total memories, recall
frequency, top categories, top tags, health score if available.

Step 2: List stale memories (not recalled in 14+ days). For each, decide:
  - Is it still relevant? (architecture, decisions, identity, preferences
    are usually keepers even if not recalled often)
  - Is it obsolete? (closed bugs, outdated dependencies, replaced patterns
    are candidates for deletion or importance demotion)
  - Is it useful-but-quiet? (mark with feedback so the ranker knows it's
    worth surfacing when relevant)

Step 3: Bulk-update any memory_type:"bug" memories that look like closed
incidents to importance 3 (so they stay searchable but don't crowd recall).

Step 4: List tags in use. Flag any that look like near-duplicates (e.g.
"stripe" vs "Stripe" vs "stripe-sdk"). Recommend consolidation.

Step 5: Print a one-paragraph summary of the maintenance pass: what was
reviewed, what was changed, what to revisit next week.

Be conservative. Demote rather than delete. We can always recover importance,
we can't recover deleted facts.
`;

async function main() {
  console.log("=== analytics-review ===\n");

  const result = await query({
    prompt: hygienePrompt,
    mcpServers: {
      cogmemai: { command: "cogmemai-mcp" },
    },
    settings: {
      env: { COGMEMAI_PROJECT: "full-workflow-demo" },
    },
  });

  for await (const message of result) {
    if (message.type === "text") {
      process.stdout.write(message.text);
    }
    if (message.type === "tool_use" && message.name.startsWith("mcp__cogmemai__")) {
      const inputPreview = JSON.stringify(message.input).slice(0, 140);
      console.log(`\n  [tool] ${message.name}  ${inputPreview}...`);
    }
  }

  console.log("\n\nDone. You've now run the full lifecycle: debug, plan, maintain.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
