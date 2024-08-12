import { Text } from '@radix-ui/themes';
import React, { useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';

const supportedInlineTags = ['EM', 'I', 'STRONG', 'B', 'DEL', 'CODE'];

export const MarkdownEditor = React.memo(({ defaultText, onChange, autoFocus }) => {
  const editorRef = useRef(null);

  const handleInput = useCallback(() => {
    const nearestNodeElement = getNearestNodeElement();

    if (supportedInlineTags.includes(nearestNodeElement?.tagName)) {
      escapeInlineTags(nearestNodeElement);
    } else {
      createListAndHeader();
      convertInlineTags();
    }

    onChange(convertToMarkdown(editorRef.current.innerHTML));
  }, [onChange]);

  useEffect(() => {
    editorRef.current.innerHTML = parseMarkdown(defaultText || '');
    // eslint-disable-next-line react-compiler/react-compiler
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Wrapper>
      <Editor ref={editorRef} contentEditable onInput={handleInput} autoFocus={autoFocus} />
      <Text size="1">Markdown editor, supports ~~ __ ** ` 1. - and #</Text>
    </Wrapper>
  );
});

export const Markdown = React.memo(({ markdown }) => {
  const html = parseMarkdown(markdown);
  return <Editor dangerouslySetInnerHTML={{ __html: html }} />;
});

const getNearestNodeElement = () => {
  let container = getRangeContainer();
  if (!container) {
    return null;
  }

  while (container.nodeType !== Node.ELEMENT_NODE) {
    container = container.parentNode;
  }

  return container;
};

const createListAndHeader = () => {
  const result = getTextBeforeCursor();
  if (!result) {
    return;
  }

  const { text, container } = result;

  const listType = listPattern(text);
  if (listType) {
    convertToList(container, listType);
  }

  const headerType = headerPattern(text);
  if (headerType) {
    convertToHeader(container, headerType);
  }
};

const getTextBeforeCursor = () => {
  const range = getRange();
  if (!range) {
    return null;
  }

  const container = range.startContainer;
  const textBeforeCursor = container.textContent.slice(0, range.startOffset);

  return { text: textBeforeCursor.replace(/\u00A0/g, ' '), container };
};

const listPattern = text => {
  if (text === '- ') {
    return 'ul';
  }
  if (text === '1. ') {
    return 'ol';
  }
  return null;
};

const convertToList = (container, listType) => {
  const listItem = document.createElement('li');

  const list = document.createElement(listType);
  list.appendChild(listItem);

  const parent = container.parentNode;
  parent.replaceChild(list, container);
};

const headerPattern = text => {
  if (text === '# ') {
    return 'h1';
  }
  if (text === '## ') {
    return 'h2';
  }
  if (text === '### ') {
    return 'h3';
  }
  if (text === '#### ') {
    return 'h4';
  }
  if (text === '##### ') {
    return 'h5';
  }
  if (text === '###### ') {
    return 'h6';
  }
  return null;
};

const convertToHeader = (container, headerType) => {
  const header = document.createElement(headerType);

  header.innerHTML = '&ZeroWidthSpace;';

  const parent = container.parentNode;
  parent.replaceChild(header, container);

  setCursorPosition(header, 1);
};

const convertInlineTags = () => {
  const rangeContainer = getRangeContainer();

  if (rangeContainer?.nodeType === Node.TEXT_NODE) {
    const text = rangeContainer.textContent;

    const patterns = [
      { regex: /`([^`]+)`/, tag: 'code' },
      { regex: /\*\*(.*?)\*\*/, tag: 'strong' },
      { regex: /__(.*?)__/, tag: 'em' },
      { regex: /~~(.*?)~~/, tag: 'del' },
    ];

    patterns.forEach(({ regex, tag }) => {
      let match = regex.exec(text);

      if (match !== null) {
        const inlineElement = document.createElement(tag);
        inlineElement.textContent = match[1];

        const beforeText = text.slice(0, match.index);
        const afterText = text.slice(match.index + match[0].length);

        rangeContainer.textContent = beforeText;
        rangeContainer.parentNode.insertBefore(inlineElement, rangeContainer.nextSibling);
        const afterNode = document.createTextNode(afterText);
        rangeContainer.parentNode.insertBefore(afterNode, inlineElement.nextSibling);

        const span = addEmptySpanAfter(inlineElement);

        setCursorPosition(span.firstChild, 1);
      }
    });
  }
};

const escapeInlineTags = inlineElement => {
  const textContent = inlineElement.textContent;

  if (has2TrailingSpaces(textContent)) {
    inlineElement.textContent = textContent.replace(/(\s|&nbsp;){2,}$/, '');

    const span = addEmptySpanAfter(inlineElement);
    setCursorPosition(span.firstChild, 1);
  }
};

const getRange = () => {
  const selection = window.getSelection();
  if (!selection.rangeCount) {
    return null;
  }

  return selection.getRangeAt(0);
};
const getRangeContainer = () => {
  const range = getRange();
  return range?.startContainer;
};

const addEmptySpanAfter = element => {
  const span = document.createElement('span');
  span.innerHTML = '&nbsp;';
  element.parentNode.insertBefore(span, element.nextSibling);

  return span;
};

const setCursorPosition = (targetNode, targetOffset) => {
  const range = document.createRange();
  const selection = window.getSelection();
  range.setStart(targetNode, targetOffset);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
};

const Wrapper = styled.div`
  width: 100%;
`;
const Editor = styled.div`
  line-height: var(--line-height, var(--default-line-height));
  letter-spacing: var(--letter-spacing, inherit);

  &[contenteditable='true'] {
    box-shadow: inset 0 0 0 1px var(--gray-a7);
    border-radius: var(--radius-2);
    padding: 10px;
    min-height: 80px;
  }

  &[contenteditable='true']:focus {
    outline: 2px solid var(--focus-8);
    outline-offset: -1px;
    border-radius: var(--radius-2);
  }

  code {
    background-color: var(--accent-a3);
    color: var(--accent-a11);

    --code-variant-font-size-adjust: calc(var(--code-font-size-adjust) * 0.95);
    font-family: var(--code-font-family);
    font-size: calc(var(--code-variant-font-size-adjust) * 1em);
    font-style: var(--code-font-style);
    font-weight: var(--code-font-weight);
    line-height: 1.25;
    letter-spacing: calc(
      var(--code-letter-spacing) + var(--letter-spacing, var(--default-letter-spacing))
    );
    border-radius: calc((0.5px + 0.2em) * var(--radius-factor));
    box-sizing: border-box;
    padding: var(--code-padding-top) var(--code-padding-right) var(--code-padding-bottom)
      var(--code-padding-left);
  }
  em {
    box-sizing: border-box;
    font-family: var(--em-font-family);
    font-size: calc(var(--em-font-size-adjust) * 1em);
    font-style: var(--em-font-style);
    font-weight: var(--em-font-weight);
    line-height: 1.25;
    letter-spacing: calc(
      var(--em-letter-spacing) + var(--letter-spacing, var(--default-letter-spacing))
    );
    color: inherit;
  }
  ul,
  ol {
    margin: 0.5rem 0;
  }
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 0;
  }
`;

const convertToMarkdown = html => {
  return (
    html
      // Convert headers
      .replace(/<h1>(.*?)<\/h1>/gi, '# $1\n')
      .replace(/<h2>(.*?)<\/h2>/gi, '## $1\n')
      .replace(/<h3>(.*?)<\/h3>/gi, '### $1\n')
      .replace(/<h4>(.*?)<\/h4>/gi, '#### $1\n')
      .replace(/<h5>(.*?)<\/h5>/gi, '##### $1\n')
      .replace(/<h6>(.*?)<\/h6>/gi, '###### $1\n')
      // Convert unordered lists
      .replace(/<ul>\s*((<li>.*?<\/li>\s*)+)<\/ul>/gi, (match, items) => {
        return items.replace(/<li>(.*?)<\/li>/gi, '- $1\n');
      })
      // Convert ordered lists
      .replace(/<ol>\s*((<li>.*?<\/li>\s*)+)<\/ol>/gi, (match, items) => {
        let index = 1;
        return items.replace(/<li>(.*?)<\/li>/gi, (itemMatch, itemContent) => {
          return `${index++}. ${itemContent.trim()}\n`;
        });
      })
      // Convert <div><br></div> to a single newline
      .replace(/<div>\s*<br\s*\/?>\s*<\/div>/gi, '\n')
      // Convert <div> to newline
      .replace(/<div\s*\/?>/gi, '\n')
      .replace(/<\/div>/gi, '')
      // Convert <br> to newline
      .replace(/<br\s*\/?>/gi, '\n')
      // Convert <strong> <b> to **
      .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<b>(.*?)<\/b>/gi, '**$1**')
      // Convert <em> <i> to __
      .replace(/<em>(.*?)<\/em>/gi, '__$1__')
      .replace(/<i>(.*?)<\/i>/gi, '__$1__')
      // Convert <del> to ~~
      .replace(/<del>(.*?)<\/del>/gi, '~~$1~~')
      // Convert <code> to `
      .replace(/<code>(.*?)<\/code>/gi, '`$1`')
      // Convert &nbsp; to space
      .replace(/&nbsp;/g, ' ')
      // Remove any remaining HTML tags
      .replace(/<[^>]+>/g, '')
      .trim()
  );
};

const parseMarkdown = input => {
  let parsed = parseList(input);
  parsed = parseHeader(parsed);

  return (
    parsed
      // Bold
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      // Italic
      .replace(/__(.*?)__/gim, '<em>$1</em>')
      // Strikethrough
      .replace(/~~(.*?)~~/gim, '<del>$1</del>')
      // Inline code
      .replace(/`([^`]+)`/gim, '<code>$1</code>')
      // Line breaks
      .replace(/\n/gim, '<br>')
  );
};

const parseList = markdown => {
  const lines = markdown.trim().split('\n');
  let html = '';
  let inList = false;
  let listType = '';

  function closeList() {
    if (inList) {
      html += `</${listType}>`;
      inList = false;
    }
  }

  lines.forEach(line => {
    if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList || listType !== 'ul') {
        closeList();
        html += '<ul>';
        listType = 'ul';
        inList = true;
      }
      html += `<li>${line.slice(2)}</li>`;
    } else if (line.match(/^\d+\. /)) {
      if (!inList || listType !== 'ol') {
        closeList();
        html += '<ol>';
        listType = 'ol';
        inList = true;
      }
      html += `<li>${line.replace(/^\d+\. /, '')}</li>`;
    } else {
      closeList();
      if (line) {
        html += `${line}\n`;
      }
    }
  });

  closeList();
  return html;
};

const parseHeader = input => {
  return input
    .replace(/^###### (.*)\n?/gim, '<h6>$1</h6>')
    .replace(/^##### (.*)\n?/gim, '<h5>$1</h5>')
    .replace(/^#### (.*)\n?/gim, '<h4>$1</h4>')
    .replace(/^### (.*)\n?/gim, '<h3>$1</h3>')
    .replace(/^## (.*)\n?/gim, '<h2>$1</h2>')
    .replace(/^# (.*)\n?/gim, '<h1>$1</h1>');
};

const has2TrailingSpaces = text => {
  return /\s{2,}$/.test(text) || /(&nbsp;){2,}$/.test(text);
};
