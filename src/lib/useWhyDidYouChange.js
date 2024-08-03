import { useRef } from 'react';

export function useWhyDidYouUpdate(componentName, props) {
  const renderCount = useRef(0);
  const previousProps = useRef(props);

  if (!import.meta.env.DEV || !import.meta.env.VITE_RERENDER_LOGS) {
    return;
  }

  // Increment render count
  renderCount.current += 1;

  // Skip logging for the first render
  if (renderCount.current === 1) {
    previousProps.current = props;
    return;
  }

  const changes = {};

  // Detect prop changes
  Object.keys({ ...previousProps.current, ...props }).forEach(key => {
    if (previousProps.current[key] !== props[key]) {
      changes[key] = {
        from: previousProps.current[key],
        to: props[key],
      };
    }
  });

  // Log changes if any
  if (Object.keys(changes).length > 0) {
    console.log(`[${componentName}] Render #${renderCount.current} due to changes:`, changes);
  } else {
    console.log(`[${componentName}] Render #${renderCount.current} (no changes detected)`);
  }

  // Update previous props
  previousProps.current = props;
}
