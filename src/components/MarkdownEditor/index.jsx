import { Spinner } from '@radix-ui/themes';
import React, { Suspense } from 'react';

const Editor = React.lazy(() => import('./MarkdownEditor.jsx'));

export const MarkdownEditor = React.memo(({ ref, defaultValue, onChange, readOnly, autoFocus }) => {
  return (
    <Suspense fallback={<Spinner size="1" />}>
      <Editor
        ref={ref}
        defaultValue={defaultValue}
        onChange={onChange}
        readOnly={readOnly}
        autoFocus={autoFocus}
      />
    </Suspense>
  );
});
