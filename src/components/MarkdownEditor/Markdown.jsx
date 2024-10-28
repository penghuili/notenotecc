import React from 'react';
import fastMemo from 'react-fast-memo';
import styled from 'styled-components';

import { parseMarkdown } from './markdownHelpers';

export const Markdown = fastMemo(({ markdown, onClick }) => {
  const html = parseMarkdown(markdown);
  return <Editor dangerouslySetInnerHTML={{ __html: html }} onClick={onClick} />;
});

export const Editor = styled.div`
  line-height: 1.4;
  letter-spacing: normal;

  &[contenteditable='true'] {
    overflow-y: auto;
    padding: 0.75rem 0 0;

    &::before {
      content: ${props => (props.isEmpty ? 'attr(data-placeholder)' : '""')};
      color: var(--semi-color-text-3);
      position: absolute;
      left: 2px;
    }
  }

  &[contenteditable='true']:focus {
    outline: 0;
  }

  code {
    background-color: var(--semi-brand-3);
    color: var(--semi-color-primary);

    font-family: 'Söhne Mono', 'Menlo', monospace, 'Apple Color Emoji', 'Segoe UI Emoji';
    font-style: normal;
    font-weight: inherit;
    letter-spacing: -0.088445px;
    border-radius: 3.027px;
    box-sizing: border-box;
    padding: 0px 3.15875px 0.947625px 3.15875px;
  }
  em,
  i {
    box-sizing: border-box;
    font-family: 'Times New Roman', 'Times', serif;
    font-style: italic;
    font-weight: inherit;
    letter-spacing: -0.472px;
    color: inherit;
  }
  ul,
  ol {
    margin: 0.5rem 0;
    padding: 0 0 0 1.25rem;
    font-size: 1rem;
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
    min-height: 1.5rem;
    font-size: 1rem;
  }
  blockquote {
    box-sizing: border-box;
    border-left: 0.25rem solid var(--semi-brand-3);
    margin: 0.5rem 0 0.5rem 1rem;
    padding: 0 0 0 0.75rem;
    p {
      margin: 0;
      font-size: 1rem;
    }
  }
`;
