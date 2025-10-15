## TLDraw Canvas-Aware Chat and Branching Nodes - Step-by-Step Plan

This document outlines the implementation roadmap for two major features:

1) Canvas Awareness: Every message node has full context of the infinite canvas
2) Branching Node Spawner: Nodes can create contextual child nodes and interconnecting branches

The plan is incremental so you can test at each step.

---

### Current Status (what's done)

- Custom node system based on TLDraw demo architecture
  - `NodeShapeUtil`, `NodeDefinition`, ports, basic connection shape & binding utils
- Tailwind message node UI with streaming updates
- Canvas awareness (Phase 1): message nodes send a serialized view of the entire canvas (message nodes + TL text/note shapes) along with the prompt

---

## Feature 1: Canvas Awareness

Goal: Each node uses full canvas context when generating responses.

Phases:

1. Basic context (DONE)
   - Collect all shapes on current page
   - Include all `message` nodes (role, text) and TLDraw `text` / `note` shapes
   - Serialize and send with the prompt

2. Structured context (NEXT)
   - Add spatial info: shape ids, positions (x,y), sizes (w,h)
   - Include connection graph: for each node, list connected node ids (incoming/outgoing)
   - Order context by topological order of connections, or by Y-position as a fallback
   - Apply size cap and summarization for very large canvases

3. Selective scoping (LATER)
   - If a node is part of a subgraph, prefer its connected component context over the entire canvas
   - Provide a toggle or heuristic to switch between local subgraph vs. global canvas

4. Rich content ingestion (OPTIONAL)
   - Include images or external references with captions/descriptions (future)

Implementation notes:
   - Context builder lives alongside node code (already added as `buildCanvasContext`)
   - Keep payload size under safe limits (8–32KB); chunk or summarize as needed

---

## Feature 2: Branching Node Spawner

Goal: From a node, automatically split a plan into multiple child nodes with connections. Clicking any node can spawn a new branch that continues the conversation with inherited context.

Phases:

1. Minimal spawner (NEXT)
   - Add an action button to each message node: "Split into steps"
   - Prompt the model: "Break the above message into N actionable steps"
   - Parse the response into bullet points
   - Create new `message` nodes for each bullet under the parent, vertically spaced
   - Create `connection` shapes from parent → each child

2. Expand branch on click (NEXT)
   - Add a small "Expand" button on each node
   - On click: use the node text + canvas/subgraph context to generate a deeper breakdown
   - Spawn a new vertical column to the right (horizontal offset) with linked nodes, connecting from the clicked node

3. Smart layout (NEXT)
   - Compute layout to avoid overlaps
   - Use constants for spacing; shift neighboring columns if needed
   - Optionally group related branches for drag/move together

4. Tooling and UX (LATER)
   - Keyboard shortcuts to spawn nodes (e.g., Enter to expand, Cmd+Enter to split)
   - Context menu entries
   - Undo/redo integration is automatic via TLDraw editor.run

5. Persistence (OPTIONAL)
   - Save/restore via TLDraw persistence
   - Export/import plan as JSON

Implementation plan details:

API/Model prompts:
   - Split prompt: "Given the user goal/content, produce a concise list of 3–7 steps. Return as JSON array of strings."
   - Expand prompt: "Given this node, expand it into sub-steps. Return JSON array of strings."

Editor utilities to add:
   - `createMessageNode(editor, { x, y, role, text })`
   - `connectNodes(editor, fromId, toId)` (uses `ConnectionShapeUtil` + `ConnectionBindingUtil`)
   - `layoutSpawnBelow(editor, parentId, items)` – returns positions for vertical children under the parent
   - `layoutSpawnRight(editor, parentId, items)` – returns positions for column to the right

UI work in node component:
   - Add two small buttons (icons): "Split" and "Expand"
   - While streaming, disable buttons

Testing checkpoints:
   - After Split: nodes appear below, connected from parent; content matches bullets
   - After Expand: branch appears to the right, connected from clicked node
   - Canvas context still flows into requests

---

### Rollout order for you to implement next

1) Add connection helpers: `connectNodes` and small layout helpers
2) Add Split button in `MessageNodeComponent`; wire to API with JSON-array response parsing
3) Implement spawn-below layout and create nodes + connections from parsed steps
4) Add Expand button; reuse layout-right; include subgraph context of the clicked node
5) Improve context builder with spatial + graph info and scoping rules

Each step is testable independently.


