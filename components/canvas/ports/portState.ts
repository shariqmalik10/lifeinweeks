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
    excludeNodes: Set<TLShapeId> | null
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
    return state.get()
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
    state.set(updater(state.get()))
  },
}

export function updatePortState(editor: Editor, update: Partial<PortState>) {
  portState.update(editor, (state) => {
    const newState = { ...state, ...update }
    return newState
  })
}
