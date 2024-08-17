import { useEffect, useRef } from 'react';

export function useDebounce(value, callback, delay = 2000) {
  const timerRef = useRef();
  const previousValue = useRef(value);

  useEffect(() => {
    if (value === previousValue.current) {
      return;
    }

    timerRef.current = setTimeout(() => {
      callback(value);
    }, delay);

    previousValue.current = value;

    return () => {
      clearTimeout(timerRef.current);
    };
  }, [value, delay, callback]);

  return timerRef;
}
