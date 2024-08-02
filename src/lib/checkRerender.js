export function checkRerender(componentName) {
  if (import.meta.env.DEV && import.meta.env.VITE_RERENDER_LOGS) {
    console.log(`rerender: ${componentName}`);
  }
}
