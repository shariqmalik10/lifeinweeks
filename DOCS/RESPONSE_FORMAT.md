# Node Response Format (Outline → Enrich Pipeline)

This defines the content format and generation pipeline so each child node contains a complete, useful mini-brief (with links) while remaining stream-friendly.

## Goals
- Stream steps quickly so the user sees structure immediately
- Enrich each step into a high‑signal brief with links and next actions
- Keep transport simple and tolerant of partial SSE chunks

## Pipeline
1) Outline (streamed)
   - Parent requests outline as plain bullet lines only, one step per line
   - Instruction: `Stream actionable steps, ONE PER LINE, prefixed with "- ", no extra prose.`
   - On each bullet, create a child node immediately with the step text

2) Enrich (per child, in parallel)
   - For each child, call the model again to produce a compact markdown brief:
```
# {Title}

## Summary
{2–4 sentences}

## Tasks
- {task 1}
- {task 2}

## Resources
- [{label 1}]({url1}) — {why this helps}
- [{label 2}]({url2})
```
   - Stream the text directly into the child node

## Prompts
- Outline
```
Stream actionable steps, ONE PER LINE, prefixed with "- ". No numbers, no prose. Stop when done.
Task: "{goal}"
Context: {subgraph JSON}
```
- Enrich
```
Write a concise markdown brief using this exact template shown above.
Constraints: ~120–200 words, 2–3 tasks, 2–3 credible resources (official docs, reputable articles), valid markdown links.
Step: "{step}"
Context: {subgraph JSON}
```

## Future
- Optional JSON schema for API consumers
- Per-node metadata (status, priority) stored in props
- Link deduplication across siblings
