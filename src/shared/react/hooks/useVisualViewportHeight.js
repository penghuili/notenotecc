import { useEffect, useState } from 'react';

export function useVisualViewportHeight() {
  const [height, setHeight] = useState(window.visualViewport.height);

  useEffect(() => {
    const handleResize = () => {
      const viewportHeight = window.visualViewport.height;
      setHeight(viewportHeight);
    };

    window.visualViewport.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return height;
}
