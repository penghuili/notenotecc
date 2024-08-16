import { useEffect, useRef } from 'react';

export function useDebounce(value, callback, delay = 2000) {
  const timerRef = useRef();

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      callback(value);
    }, delay);

    return () => {
      clearTimeout(timerRef.current);
    };
  }, [value, delay, callback]);
}
