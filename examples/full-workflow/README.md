# Full-workflow examples

The two-script demo in `../src/` proves CogmemAi persists across processes. These three scripts show **what to actually do with that persistence** once it's wired in.

Each script is a realistic narrative scenario that exercises 5-8 of the 35 tools the CogmemAi MCP server ships with. Read them top-to-bottom, run them in order, and you'll see the full memory-driven workflow that makes the difference between an agent that remembers and an agent that thinks.

## The three scenarios

| Script | Scenario | Tools demonstrated |
|---|---|---|
| [`debug-loop.ts`](./debug-loop.ts) | Bug appears, agent searches memory for an existing fix, fails to find one, debugs from scratch, then saves the fix so it's findable next time | `recall_memories`, `save_memory`, `link_memories`, `save_task`, `get_project_context` |
| [`planning-session.ts`](./planning-session.ts) | Long planning discussion gets distilled into a clean memory graph: decisions, constraints, file paths, tasks for the next session | `extract_memories`, `link_memories`, `consolidate_memories`, `save_task`, `set_reminder`, `save_session_summary` |
| [`analytics-review.ts`](./analytics-review.ts) | Weekly memory hygiene: review health score, find stale memories, bulk-update obsolete ones, feedback the recall ranker | `get_analytics`, `get_stale_memories`, `bulk_update`, `feedback_memory`, `list_tags` |

## Run order

```bash
# from the repo root
npx tsx examples/full-workflow/debug-loop.ts
npx tsx examples/full-workflow/planning-session.ts
npx tsx examples/full-workflow/analytics-review.ts
```

They share the same project ID (`full-workflow-demo`) so memories accumulate across runs. After all three, your CogmemAi dashboard will show a small but realistic project memory graph.

## Why these three

The three scripts together cover the lifecycle that makes persistent memory operational, not just demoable:

- **debug-loop**: the "we fixed this before" loop. The single highest-leverage pattern for teams. Every fix becomes the next dev's instant-lookup.
- **planning-session**: the "don't repeat yesterday's decisions" pattern. Long discussions get distilled, linked, and surfaced at the right moment.
- **analytics-review**: the "memory hygiene" pattern. Without periodic review, memory stores accumulate noise and recall quality degrades. The analytics + stale + feedback loop keeps the store sharp.

## What you'll have when you're done

A working mental model of how the 35 tools compose into actual workflows, plus a real project memory you can browse, query, and build on. The investment is about 5-10 minutes of run time + reading.

## Beyond these examples

The MCP server has the full toolkit available the moment you install it. See the [main repo's skill directory](https://github.com/hifriendbot/cogmemai-mcp/tree/main/skill) for ready-made SKILL.md files that wire these workflows into Claude Code automatically, no scripts required.
