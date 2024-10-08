import { useEffect, useState } from 'react';

export function useDelay(delay) {
  const [delayed, setDelayed] = useState(false);

  useEffect(() => {
    const timerId = setTimeout(() => setDelayed(true), delay);

    return () => clearTimeout(timerId);
  }, [delay]);

  return delayed;
}
