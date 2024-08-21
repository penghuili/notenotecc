import React from 'react';
import styled from 'styled-components';

import { parseMarkdown } from './markdownHelpers';

export const Markdown = React.memo(({ markdown, onClick }) => {
  const html = parseMarkdown(markdown);
  return <Editor dangerouslySetInnerHTML={{ __html: html }} onClick={onClick} />;
});

export const Editor = styled.div`
  line-height: var(--line-height, var(--default-line-height));
  letter-spacing: var(--letter-spacing, inherit);

  &[contenteditable='true'] {
    overflow-y: auto;
    scrollbar-width: none;

    &::before {
      content: ${props => (props.isEmpty ? 'attr(data-placeholder)' : '""')};
      color: var(--gray-7);
      position: absolute;
      left: 2px;
    }
  }

  &[contenteditable='true']:focus {
    min-height: 100px;
    outline: 0;
  }

  code {
    background-color: var(--accent-a3);
    color: var(--accent-a11);

    --code-variant-font-size-adjust: calc(var(--code-font-size-adjust) * 0.95);
    font-family: var(--code-font-family);
    font-style: var(--code-font-style);
    font-weight: var(--code-font-weight);
    letter-spacing: calc(
      var(--code-letter-spacing) + var(--letter-spacing, var(--default-letter-spacing))
    );
    border-radius: calc((0.5px + 0.2em) * var(--radius-factor));
    box-sizing: border-box;
    padding: var(--code-padding-top) var(--code-padding-right) var(--code-padding-bottom)
      var(--code-padding-left);
  }
  em,
  i {
    box-sizing: border-box;
    font-family: var(--em-font-family);
    font-style: var(--em-font-style);
    font-weight: var(--em-font-weight);
    letter-spacing: calc(
      var(--em-letter-spacing) + var(--letter-spacing, var(--default-letter-spacing))
    );
    color: inherit;
  }
  ul,
  ol {
    margin: 0.5rem 0;
    padding: 0 0 0 1.95rem;
    font-size: var(--font-size-3);
  }
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 0 0 0.25em;
  }
  p,
  div {
    margin: 0 0 0.25em;
    min-height: 1em;
    font-size: var(--font-size-3);
  }
  blockquote {
    box-sizing: border-box;
    border-left: 0.25rem solid var(--accent-a6);
    margin: 0.5rem 0 0.5rem 1rem;
    padding: 0 0 0 0.75rem;
    p {
      margin: 0;
      font-size: var(--font-size-3);
    }
  }
`;
