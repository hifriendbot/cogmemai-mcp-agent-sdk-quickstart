/**
 * Session 1: Save
 *
 * Tells the agent some facts about a fictional project and asks it to remember.
 * The agent uses CogmemAi MCP tools (save_memory, extract_memories) under the hood.
 *
 * Run: npx tsx src/session-1-save.ts
 */

import { query } from "@anthropic-ai/claude-agent-sdk";

const planningTranscript = `
We just finished planning the new orders service. Three constraints:

1. GraphQL only. No REST endpoints. The mobile team needs nested resource fetching
   in one request to keep latency under 200 ms.
2. Mobile latency budget is 200 ms per request, end to end.
3. PostgreSQL for the read store. Redis for hot keys with a 60-second TTL.

Also: I always use Bun, never npm. That's a global preference, applies to every
project I work on.

Please save these so the next session picks them up.
`;

async function main() {
  console.log("Session 1: handing the agent a planning transcript...");

  const result = await query({
    prompt: planningTranscript,
    mcpServers: {
      cogmemai: { command: "cogmemai-mcp" },
    },
    // Optional: project ID makes scoped recall reliable across sessions
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

  console.log("\n\nSession 1 complete. Now run: npx tsx src/session-2-recall.ts");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
