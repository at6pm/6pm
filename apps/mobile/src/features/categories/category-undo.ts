import { useEffect, useRef } from 'react';

import type { DeletedCategory } from '../../data/category-actions';

type Listener = (deleted: DeletedCategory) => void;

const listeners = new Set<Listener>();

/**
 * A category deleted from its editor, which is a sheet of its own: the Categories sheet under it
 * offers the undo once the editor has gone.
 */
export function announceDeleted(deleted: DeletedCategory): void {
  for (const listener of listeners) listener(deleted);
}

export function useDeletedCategories(listener: Listener): void {
  const current = useRef(listener);
  current.current = listener;
  useEffect(() => {
    const relay: Listener = (deleted) => current.current(deleted);
    listeners.add(relay);
    return () => {
      listeners.delete(relay);
    };
  }, []);
}
