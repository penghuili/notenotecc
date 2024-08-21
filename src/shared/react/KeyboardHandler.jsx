import './KeyboardHandler.css';

import { useEffect } from 'react';

import { useVisualViewportHeight } from './hooks/useVisualViewportHeight.js';

export function KeyboardHandler() {
  const visualHeight = useVisualViewportHeight();

  useEffect(() => {
    document.body.style.height = `${visualHeight}px`;
  }, [visualHeight]);

  return null;
}
