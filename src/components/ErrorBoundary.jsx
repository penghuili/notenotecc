import React from 'react';
import { ErrorBoundary as Boundary } from 'react-error-boundary';

function fallbackRender({ error }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre style={{ color: 'red' }}>{error.message}</pre>
    </div>
  );
}

export function ErrorBoundary({ children }) {
  return <Boundary fallbackRender={fallbackRender}>{children}</Boundary>;
}
