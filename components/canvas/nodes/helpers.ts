// components/canvas/nodes/helpers.ts
import { Editor, TLShapeId, createShapeId } from 'tldraw'
import { NODE_HEIGHT_PX, NODE_WIDTH_PX, DEFAULT_NODE_SPACING_PX } from '../constants'
import { ConnectionShape } from '../connection/ConnectionShapeUtil'
import { createOrUpdateConnectionBinding } from '../connection/ConnectionBindingUtil'
import { getAllConnectedNodes, getNodePortConnections, getNodePorts } from './nodePorts'
import { getNodeHeightPx, getNodeWidthPx } from './nodeTypes'

export function createMessageNode(
  editor: Editor,
  opts: { x: number; y: number; role?: 'user' | 'assistant'; text?: string }
): TLShapeId {
  const id = createShapeId()
  editor.createShape({
    id,
    type: 'node',
    x: opts.x,
    y: opts.y,
    props: { node: { type: 'message', role: opts.role ?? 'assistant', text: opts.text ?? '' } },
  })
  return id
}

export function connectNodes(editor: Editor, fromId: TLShapeId, toId: TLShapeId): TLShapeId {
  const fromPorts = getNodePorts(editor, fromId)
  const toPorts = getNodePorts(editor, toId)
  const fromPort = fromPorts.output
  const toPort = toPorts.input
  if (!fromPort || !toPort) return createShapeId()

  const fromPage = editor.getShapePageTransform(fromId)!.applyToPoint(fromPort)
  const toPage = editor.getShapePageTransform(toId)!.applyToPoint(toPort)

  const x = Math.min(fromPage.x, toPage.x)
  const y = Math.min(fromPage.y, toPage.y)
  const id = createShapeId()

  editor.createShape<ConnectionShape>({
    id,
    type: 'connection',
    x,
    y,
    props: {
      start: { x: fromPage.x - x, y: fromPage.y - y },
      end: { x: toPage.x - x, y: toPage.y - y },
    },
  })

  createOrUpdateConnectionBinding(editor, id, fromId, { portId: 'output', terminal: 'start' })
  createOrUpdateConnectionBinding(editor, id, toId, { portId: 'input', terminal: 'end' })
  return id
}

export function layoutSpawnBelow(editor: Editor, parentId: TLShapeId, count: number) {
  const b = editor.getShapePageBounds(parentId)!
  const startY = b.maxY + DEFAULT_NODE_SPACING_PX
  const x = b.x
  const positions = []
  for (let i = 0; i < count; i++) {
    positions.push({ x, y: startY + i * (NODE_HEIGHT_PX + DEFAULT_NODE_SPACING_PX) })
  }
  return positions
}

export function layoutSpawnRight(editor: Editor, parentId: TLShapeId, count: number) {
  const b = editor.getShapePageBounds(parentId)!
  const startX = b.maxX + DEFAULT_NODE_SPACING_PX
  const y = b.y
  const positions = []
  for (let i = 0; i < count; i++) {
    positions.push({ x: startX, y: y + i * (NODE_HEIGHT_PX + DEFAULT_NODE_SPACING_PX) })
  }
  return positions
}

// ---- Subgraph & context helpers ----

export interface SubgraphNode {
  id: TLShapeId
  role: 'user' | 'assistant'
  text: string
  x: number
  y: number
  w: number
  h: number
}

export interface SubgraphEdge {
  from: TLShapeId
  to: TLShapeId
}

export interface ConnectedSubgraph {
  nodes: SubgraphNode[]
  edges: SubgraphEdge[]
}

export function getConnectedSubgraph(editor: Editor, rootId: TLShapeId): ConnectedSubgraph {
  const nodeIds = Array.from(getAllConnectedNodes(editor, rootId))

  const nodes: SubgraphNode[] = []
  const seenEdges = new Set<string>()
  const edges: SubgraphEdge[] = []

  for (const id of nodeIds) {
    const shape = editor.getShape(id)
    if (!shape) continue
    // Only include our custom node shapes that carry message data
    if (!editor.isShapeOfType<any>(shape, 'node')) continue
    const node = (shape as any).props?.node
    if (!node || node.type !== 'message') continue

    const b = editor.getShapePageBounds(id)!
    nodes.push({
      id,
      role: node.role ?? 'assistant',
      text: node.text ?? '',
      x: b.x,
      y: b.y,
      w: getNodeWidthPx(editor, shape as any),
      h: getNodeHeightPx(editor, shape as any),
    })

    // Gather directed edges using port connections
    for (const c of getNodePortConnections(editor, id)) {
      const key = `${c.connectionId}`
      if (seenEdges.has(key)) continue
      seenEdges.add(key)
      if (c.terminal === 'start') {
        edges.push({ from: id, to: c.connectedShapeId })
      } else {
        edges.push({ from: c.connectedShapeId, to: id })
      }
    }
  }

  // Order nodes: topologically by edges if possible, else by Y then X
  const ordered = orderNodes(nodes, edges)
  const filteredEdges = edges.filter((e) => ordered.some((n) => n.id === e.from) && ordered.some((n) => n.id === e.to))

  return { nodes: ordered, edges: filteredEdges }
}

function orderNodes(nodes: SubgraphNode[], edges: SubgraphEdge[]): SubgraphNode[] {
  // Simple Kahn's algorithm; if cycles, fallback to spatial order
  const inDeg = new Map<TLShapeId, number>()
  const adj = new Map<TLShapeId, TLShapeId[]>()
  for (const n of nodes) {
    inDeg.set(n.id, 0)
    adj.set(n.id, [])
  }
  for (const e of edges) {
    if (!inDeg.has(e.to) || !adj.has(e.from)) continue
    inDeg.set(e.to, (inDeg.get(e.to) ?? 0) + 1)
    adj.get(e.from)!.push(e.to)
  }
  const q: TLShapeId[] = []
  for (const [id, deg] of inDeg) if (deg === 0) q.push(id)
  const order: TLShapeId[] = []
  while (q.length) {
    const id = q.shift()!
    order.push(id)
    for (const v of adj.get(id)!) {
      inDeg.set(v, (inDeg.get(v) ?? 0) - 1)
      if ((inDeg.get(v) ?? 0) === 0) q.push(v)
    }
  }
  if (order.length !== nodes.length) {
    // cycle or disconnected; fallback to spatial order
    return [...nodes].sort((a, b) => (a.y - b.y) || (a.x - b.x))
  }
  const map = new Map(nodes.map((n) => [n.id, n]))
  return order.map((id) => map.get(id)!).filter(Boolean)
}

export function serializeSubgraph(subgraph: ConnectedSubgraph, maxBytes = 16000): string {
  let json = JSON.stringify(subgraph)
  if (json.length <= maxBytes) return json

  // Reduce nodes while maintaining recent ones
  let lo = 0
  let hi = subgraph.nodes.length
  let nodes = subgraph.nodes
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    nodes = subgraph.nodes.slice(-mid)
    const nodeIds = new Set(nodes.map((n) => n.id))
    const edges = subgraph.edges.filter((e) => nodeIds.has(e.from) && nodeIds.has(e.to))
    json = JSON.stringify({ nodes, edges, truncated: true })
    if (json.length > maxBytes) hi = mid - 1
    else lo = mid + 1
  }
  const nodeIds = new Set(nodes.map((n) => n.id))
  const edges = subgraph.edges.filter((e) => nodeIds.has(e.from) && nodeIds.has(e.to))
  return JSON.stringify({ nodes, edges, truncated: true })
}