// eslint-disable-next-line import/no-unresolved
import '@mdxeditor/editor/style.css';

import {
  headingsPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  MDXEditor,
  quotePlugin,
  thematicBreakPlugin,
} from '@mdxeditor/editor';
import React from 'react';
import styled from 'styled-components';

const StyledEditor = styled(MDXEditor)`
  .mdxeditor-root-contenteditable > div[contenteditable='false'] {
    padding: 0;
  }
  .mdxeditor-root-contenteditable > div[contenteditable='true'] {
    box-shadow: inset 0 0 0 1px var(--gray-a7);
    border-radius: var(--radius-2);
  }
  .mdxeditor-root-contenteditable > div[contenteditable='true']:focus {
    outline: 2px solid var(--focus-8);
    outline-offset: -1px;
    border-radius: var(--radius-2);
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 0 0 0.5rem 0;
  }
  p {
    margin: 0;
  }
  ul,
  ol {
    margin: 0.5rem 0;
  }
  li {
    margin: 0;
  }
`;

const plugins = [
  headingsPlugin(),
  linkPlugin(),
  listsPlugin(),
  quotePlugin(),
  thematicBreakPlugin(),
  markdownShortcutPlugin(),
];
const MarkdownEditor = React.memo(({ ref, defaultValue = '', onChange, readOnly, autoFocus }) => {
  return (
    <StyledEditor
      ref={ref}
      markdown={defaultValue}
      onChange={onChange}
      plugins={plugins}
      autoFocus={autoFocus}
      readOnly={readOnly}
    />
  );
});

export default MarkdownEditor;
