import { useEffect, useReducer } from 'react';

const cats = [];

export function createCat(initialValue) {
  let value = initialValue;
  const listeners = new Set();

  const get = () => value;

  const set = newValue => {
    if (newValue !== value) {
      value = newValue;
      listeners.forEach(listener => listener());
    }
  };

  const reset = () => set(initialValue);

  const subscribe = listener => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const cat = { get, set, reset, subscribe };
  cats.push(cat);

  return cat;
}

export function useCat(cat) {
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  useEffect(() => {
    const unsubscribe = cat.subscribe(forceUpdate);
    return () => unsubscribe();
  }, [cat]);

  return cat.get();
}

export function resetAllCats() {
  cats.forEach(cat => cat.reset());
}
