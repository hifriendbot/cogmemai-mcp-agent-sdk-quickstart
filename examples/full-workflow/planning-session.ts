/**
 * Full-workflow example #2: Planning session → memory graph.
 *
 * Scenario:
 *   A long planning discussion just wrapped: scope, constraints, decisions,
 *   tasks. Instead of copy-pasting into a Notion page, the agent distills
 *   the conversation into a structured memory graph that surfaces at the
 *   right moment in future sessions.
 *
 *   The output is not just notes. It is: linked decisions, scoped to the
 *   project, with tasks queued and a reminder set for the next session.
 *
 * Tools exercised:
 *   - mcp__cogmemai__extract_memories      (multi-fact batch save)
 *   - mcp__cogmemai__link_memories         (connect related decisions)
 *   - mcp__cogmemai__consolidate_memories  (merge duplicate or related facts)
 *   - mcp__cogmemai__save_task             (queue follow-up work)
 *   - mcp__cogmemai__set_reminder          (auto-surface at next session)
 *   - mcp__cogmemai__save_session_summary  (wrap-up for continuity)
 *
 * Run:
 *   npx tsx examples/full-workflow/planning-session.ts
 */

import { query } from "@anthropic-ai/claude-agent-sdk";

const planningTranscript = `
We just finished planning the new payments service. Here is the full discussion.
Please process it: extract every meaningful fact as a memory, link related ones,
consolidate any duplicates, queue concrete tasks, set a reminder for the next
session, and save a session summary.

DISCUSSION:

Decision 1: The payments service will use GraphQL only, no REST endpoints.
  Why: the mobile team needs nested resource fetching in a single request to
  keep mobile latency under 200 ms per checkout flow. REST would require 3-4
  round trips per checkout, breaking the budget.

Decision 2: PostgreSQL for the transactional read store, Redis for hot keys.
  Why: PG gives us ACID guarantees we need for refunds and disputes. Redis
  caches the active-cart lookup with a 60-second TTL. We considered DynamoDB
  but the team's PG ops experience makes it the safer bet.

Decision 3: We're using Stripe Connect, not raw Stripe Charges.
  Why: marketplace model means each merchant gets their own connected account.
  Compliance with Reg E falls on Stripe instead of us.

Constraint 1: Mobile latency budget is 200 ms per checkout, end to end.

Constraint 2: PCI scope must stay out of our infrastructure. All card data
  goes through Stripe Elements. We never touch raw PAN.

Constraint 3: We have 6 weeks until the launch milestone (June 26, 2026).

Architecture: GraphQL gateway in front of three microservices (payments-api,
ledger-api, dispute-api). Internal communication via gRPC. Auth via JWT
issued by the existing identity service.

File paths to remember:
  - /apps/payments-api/src/checkout/ (main checkout flow)
  - /packages/stripe-client/ (shared Stripe wrapper)
  - /apps/ledger-api/src/double-entry/ (the bookkeeping engine)

Tasks for the next session:
  - Stand up the payments-api skeleton with GraphQL gateway
  - Wire Stripe Connect onboarding flow
  - Spike the double-entry ledger schema

Personal preference: I always use Bun, never npm. This is a global preference,
applies to every project I work on.

Reminder: at the start of the next session, surface the three tasks above so
we don't lose momentum.

Save all of this. Link the decisions to their related constraints. Consolidate
any near-duplicates. Save a session summary at the end.
`;

async function main() {
  console.log("=== planning-session ===\n");

  const result = await query({
    prompt: planningTranscript,
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

  console.log("\n\nDone. Run analytics-review.ts next.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
