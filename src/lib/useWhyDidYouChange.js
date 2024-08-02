import { useEffect, useRef } from 'react';

export function useWhyDidYouUpdate(valueName, value) {
  const previousProps = useRef(value);

  useEffect(() => {
    if (import.meta.env.DEV && import.meta.env.VITE_RERENDER_LOGS) {
      if (value !== previousProps.current) {
        console.log(`[${valueName}] changed from`, previousProps.current, 'to', value);
      }

      previousProps.current = value;
    }
  }, [value, valueName]);
}
