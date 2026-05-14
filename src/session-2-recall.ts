/**
 * Session 2: Recall
 *
 * Fresh process. Fresh context. The agent has no in-memory state from session 1.
 * Yet it answers a "what were the constraints?" question correctly because
 * CogmemAi reloaded the saved memories on session start.
 *
 * Run: npx tsx src/session-2-recall.ts
 */

import { query } from "@anthropic-ai/claude-agent-sdk";

const recallPrompt = `
Pick up where we left off on the orders service.

Briefly: what three constraints did we settle on, what's the latency budget,
and is there a global preference of mine you should keep in mind?

Pull from CogmemAi memory before answering.
`;

async function main() {
  console.log("Session 2: fresh process. Asking the agent to recall...\n");

  const result = await query({
    prompt: recallPrompt,
    mcpServers: {
      cogmemai: { command: "cogmemai-mcp" },
    },
    settings: {
      env: { COGMEMAI_PROJECT: "orders-service-quickstart" },
    },
  });

  for await (const message of result) {
    if (message.type === "text") {
      process.stdout.write(message.text);
    }
    if (message.type === "tool_use" && message.name.startsWith("mcp__cogmemai__")) {
      console.log(`\n  [tool] ${message.name} ${JSON.stringify(message.input).slice(0, 120)}...`);
    }
  }

  console.log("\n\nSession 2 complete. The continuity came from CogmemAi, not from this process.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
