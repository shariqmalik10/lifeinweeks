import { Atom, Editor, TLShapeId, atom } from 'tldraw'
import { PortIdentifier } from './Port'

/**
 * The UI state for ports. These mostly highlight ports relevant to the user's current action.
 */
export interface PortState {
  // hintingPort is the port that the user is currently dragging a connection to.
  hintingPort: PortIdentifier | null
  // eligiblePorts is the set of ports that the user can connect a new connection to.
  eligiblePorts: {
    terminal: 'start' | 'end'
    excludeNodes: TLShapeId[] | null
  } | null
}

// Create a WeakMap to store port state per editor instance
const portStateMap = new WeakMap<Editor, Atom<PortState>>()

export const portState = {
  get(editor: Editor): PortState {
    let state = portStateMap.get(editor)
    if (!state) {
      state = atom<PortState>('port state', {
        hintingPort: null,
        eligiblePorts: null,
      })
      portStateMap.set(editor, state)
    }
    // Return a deep-cloned plain object to avoid non-js data in records
    const s = state.get()
    return {
      hintingPort: s.hintingPort ? { shapeId: String(s.hintingPort.shapeId), portId: s.hintingPort.portId } : null,
      eligiblePorts: s.eligiblePorts
        ? { terminal: s.eligiblePorts.terminal, excludeNodes: s.eligiblePorts.excludeNodes ? [...s.eligiblePorts.excludeNodes] : null }
        : null,
    }
  },
  update(editor: Editor, updater: (state: PortState) => PortState) {
    let state = portStateMap.get(editor)
    if (!state) {
      state = atom<PortState>('port state', {
        hintingPort: null,
        eligiblePorts: null,
      })
      portStateMap.set(editor, state)
    }
    const next = updater(state.get())
    // Ensure plain data shapes stored in atom
    const clean: PortState = {
      hintingPort: next.hintingPort ? { shapeId: String(next.hintingPort.shapeId), portId: next.hintingPort.portId } : null,
      eligiblePorts: next.eligiblePorts
        ? { terminal: next.eligiblePorts.terminal, excludeNodes: next.eligiblePorts.excludeNodes ? [...next.eligiblePorts.excludeNodes] : null }
        : null,
    }
    state.set(clean)
  },
}

export function updatePortState(editor: Editor, update: Partial<PortState>) {
  portState.update(editor, (state) => {
    const newState = { ...state, ...update }
    return newState
  })
}
