import { useEffect } from 'react';

import { scrollToTop } from './scrollToTop';

export function useScrollToTop() {
  useEffect(() => {
    scrollToTop();
  }, []);
}
