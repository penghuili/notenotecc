import { useEffect } from 'react';

export function useWindowBlur(callback) {
  useEffect(() => {
    function handleBlur() {
      callback();
    }

    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('blur', handleBlur);
    };
  }, [callback]);
}
