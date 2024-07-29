import { getDefaultStore, useAtomValue as useAtomValueJo } from 'jotai';

const defaultStore = getDefaultStore();

export const updateAtomValue = defaultStore.set;

export function getAtomValue(aAtom) {
  return defaultStore.get(aAtom);
}

export const useAtomValue = useAtomValueJo;
