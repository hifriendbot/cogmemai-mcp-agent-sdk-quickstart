/**
 * Full-workflow example #1: The bugfix loop.
 *
 * Scenario:
 *   A Stripe webhook handler started returning 500 after a recent deploy.
 *   Before debugging from scratch, the agent searches CogmemAi for any
 *   existing fix. If nothing relevant comes back, it debugs the bug,
 *   verifies the fix, and SAVES it so the next teammate (or the next
 *   you) finds it in 30 seconds.
 *
 *   This is the loop that eliminates duplicate debugging across a team.
 *
 * Tools exercised:
 *   - mcp__cogmemai__get_project_context  (load prior context on entry)
 *   - mcp__cogmemai__recall_memories       (search before debugging)
 *   - mcp__cogmemai__save_memory           (capture the fix)
 *   - mcp__cogmemai__link_memories         (connect to related memories)
 *   - mcp__cogmemai__save_task             (queue a follow-up task)
 *
 * Run:
 *   npx tsx examples/full-workflow/debug-loop.ts
 */

import { query } from "@anthropic-ai/claude-agent-sdk";

const bugReport = `
Production alert: every Stripe webhook event is returning 500 since the deploy 30 minutes ago.

Error in the logs:
  TypeError: Cannot read properties of undefined (reading 'id')
    at webhook-handler.ts:42
    at processEvent (webhook-handler.ts:18)

Recent context: we upgraded the Stripe SDK from 14.x to 17.x yesterday as part
of routine maintenance.

Before debugging from scratch, search CogmemAi for any prior memory that
matches this symptom (look for "Stripe webhook", "SDK upgrade", or the literal
error string). If you find a relevant fix, apply it. If you don't, debug
methodically and SAVE the fix so we never debug this again.

When you save:
  - memory_type: "bug"
  - importance: 8 (production-down)
  - scope: "project"
  - tags: ["stripe", "webhooks", "sdk-upgrade"]
  - content should include symptom, root cause, fix, and why it works

Also: link the new bug memory to any related architecture memories you find
about the Stripe integration. And queue a task to review other SDK call sites
for the same breaking change.
`;

async function main() {
  console.log("=== debug-loop ===\n");

  const result = await query({
    prompt: bugReport,
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

  console.log("\n\nDone. Run planning-session.ts next.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
