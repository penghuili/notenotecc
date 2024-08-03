import { useEffect } from 'react';

export function useWindowFocus(callback) {
  useEffect(() => {
    async function handleFocus() {
      callback();
    }

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [callback]);
}
