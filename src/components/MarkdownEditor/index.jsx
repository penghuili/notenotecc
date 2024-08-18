import { Flex, Text } from '@radix-ui/themes';
import { RiArrowDropDownLine, RiArrowDropUpLine } from '@remixicon/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { useWindowHeight } from '../../lib/useWindowHeight.js';
import { AnimatedBox } from '../../shared/react/AnimatedBox.jsx';
import {
  convertToBlockquote,
  convertToHeader,
  convertToList,
  getRange,
  getRangeContainer,
  setCursorPosition,
  Toolbar,
  zeroWidthSpace,
} from './Toolbar.jsx';

const supportedInlineTags = ['EM', 'I', 'STRONG', 'B', 'DEL', 'CODE', 'MARK'];

export const MarkdownEditor = React.memo(({ defaultText, onChange, autoFocus }) => {
  const editorRef = useRef(null);
  const [activeElements, setActiveElements] = useState({});
  const [isEmpty, setIsEmpty] = useState(true);
  const windowHeight = useWindowHeight();

  const handleCheckEmpty = useCallback(() => {
    const isEmpty = editorRef.current.textContent.trim() === '';
    setIsEmpty(isEmpty);
  }, []);

  const handleCheckActiveElements = useCallback(() => {
    const elements = checkActiveElements(editorRef.current, activeElements);
    setActiveElements(elements);

    handleCheckEmpty();
  }, [activeElements, handleCheckEmpty]);

  const handleChange = useCallback(() => {
    const markdown = convertToMarkdown(editorRef.current.innerHTML);
    onChange(markdown);

    const elements = checkActiveElements(editorRef.current, activeElements);
    setActiveElements(elements);
  }, [activeElements, onChange]);

  const handleInput = useCallback(() => {
    const nearestNodeElement = getNearestNodeElement();

    if (supportedInlineTags.includes(nearestNodeElement?.tagName)) {
      escapeInlineTags(nearestNodeElement);
    } else {
      createBlockElement(editorRef.current);
      escapeBlockquote(editorRef.current);
      convertInlineTags();
    }

    handleChange();
  }, [handleChange]);

  useEffect(() => {
    editorRef.current.innerHTML = defaultText ? parseMarkdown(defaultText) : '<p></p>';

    // eslint-disable-next-line react-compiler/react-compiler
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (autoFocus) {
      editorRef.current.focus();
      handleCheckActiveElements();
    }
  }, [autoFocus, handleCheckActiveElements]);

  return (
    <Wrapper height={windowHeight - 48}>
      <Editor
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onMouseUp={handleCheckActiveElements}
        onTouchEnd={handleCheckActiveElements}
        onKeyUp={handleCheckActiveElements}
        data-placeholder="Start typing here..."
        isEmpty={isEmpty}
        height={windowHeight - 48 - 32}
      />
      <div>
        <Toolbar editorRef={editorRef} activeElements={activeElements} onChange={handleChange} />
      </div>
    </Wrapper>
  );
});

export const Markdown = React.memo(({ markdown, onClick }) => {
  const html = parseMarkdown(markdown);
  return <Editor dangerouslySetInnerHTML={{ __html: html }} onClick={onClick} />;
});

const getActiveElements = wrapperElement => {
  let container = getRangeContainer();
  if (!container) {
    return {};
  }

  const elements = {};
  while (container !== wrapperElement) {
    container = container?.parentNode;
    if (container?.nodeType === Node.ELEMENT_NODE) {
      elements[container.tagName] = true;
    }
  }

  return elements;
};

const checkActiveElements = (wrapperElement, currentActiveElements) => {
  const elements = getActiveElements(wrapperElement);
  if (
    Object.keys(elements).sort().join(',') !== Object.keys(currentActiveElements).sort().join(',')
  ) {
    return elements;
  }
  return currentActiveElements;
};

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

const createBlockElement = wrapperElement => {
  const result = getTextBeforeCursor();
  if (!result) {
    return;
  }

  const { text, container } = result;

  const listType = listPattern(text);
  if (listType) {
    convertToList(wrapperElement, listType);
  }

  const headerType = headerPattern(text);
  if (headerType) {
    convertToHeader(wrapperElement, container, headerType);
  }

  const blockquote = blockquotePattern(text);
  if (blockquote) {
    convertToBlockquote(wrapperElement);
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

const blockquotePattern = text => {
  if (text === '>') {
    return 'blockquote';
  }

  return null;
};

const escapeBlockquote = wrapperElement => {
  let currentElement = getRangeContainer();
  if (!currentElement) {
    return;
  }

  while (currentElement.tagName !== 'BLOCKQUOTE' && currentElement !== wrapperElement) {
    currentElement = currentElement.parentNode;
  }

  if (currentElement.tagName !== 'BLOCKQUOTE') {
    return;
  }

  const innerHTML = currentElement.innerHTML;

  if (innerHTML.endsWith('<p><br></p><p><br></p>')) {
    currentElement.innerHTML = innerHTML.replace(/<p><br><\/p><p><br><\/p>/, '');

    const div = addEmptyDivAfter(currentElement);
    setCursorPosition(div.firstChild, 1);
  }
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
      { regex: /==(.*?)==/, tag: 'mark' },
      { regex: /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/, tag: 'a' },
    ];

    patterns.forEach(({ regex, tag }) => {
      let match = regex.exec(text);

      if (match !== null) {
        let inlineElement;
        if (tag === 'a') {
          inlineElement = document.createElement('a');
          inlineElement.href = match[2];
          inlineElement.textContent = match[1];
          inlineElement.target = '_blank';
        } else {
          inlineElement = document.createElement(tag);
          inlineElement.textContent = match[1];
        }

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

const addEmptySpanAfter = element => {
  const span = document.createElement('span');
  span.innerHTML = '&nbsp;';
  element.parentNode.insertBefore(span, element.nextSibling);

  return span;
};

const addEmptyDivAfter = element => {
  const div = document.createElement('div');
  div.innerHTML = zeroWidthSpace;
  element.parentNode.insertBefore(div, element.nextSibling);

  return div;
};

const Wrapper = styled.div`
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  height: ${props => `${props.height}px`};
`;

const Editor = styled.div`
  line-height: var(--line-height, var(--default-line-height));
  letter-spacing: var(--letter-spacing, inherit);

  &[contenteditable='true'] {
    padding: 10px 0;
    height: ${props => `${props.height}px`};
    overflow-y: auto;
    scrollbar-width: none;

    &::before {
      content: ${props => (props.isEmpty ? 'attr(data-placeholder)' : '""')};
      color: var(--gray-5);
      position: absolute;
      left: 2px;
    }
  }

  &[contenteditable='true']:focus {
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
        return items.replace(/<li>(.*?)<\/li>/gi, '- $1\n').replace(/<br\s*\/?>/gi, '');
      })
      // Convert ordered lists
      .replace(/<ol>\s*((<li>.*?<\/li>\s*)+)<\/ol>/gi, (match, items) => {
        let index = 1;
        return items.replace(/<li>(.*?)<\/li>/gi, (itemMatch, itemContent) => {
          return `${index++}. ${itemContent.replace(/<br\s*\/?>/gi, '')}\n`;
        });
      })
      // Convert blockquotes
      .replace(/<blockquote>(.*?)<\/blockquote>/gis, (match, content) => {
        return content.replace(/<p>(.*?)<\/p>/gi, '> $1\n').replace(/<br\s*\/?>/gi, '');
      })
      // Convert <div><br></div> to a single newline
      .replace(/<div>\s*<br\s*\/?>\s*<\/div>/gi, '\n')
      .replace(/<p>\s*<br\s*\/?>\s*<\/p>/gi, '\n')
      // Convert <div> to newline
      .replace(/<div>(.*?)<\/div>/gi, '$1\n')
      .replace(/<p>(.*?)<\/p>/gi, '$1\n')
      // Convert <br> to newline
      .replace(/<br\s*\/?>/gi, '\n')
      // Convert <a> to links
      .replace(/<a\s+href="([^"]+)"[^>]*>(.*?)<\/a>/gi, (match, href, text) => {
        return `[${text}](${href})`;
      })
      // Convert <strong> <b> to **
      .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<b>(.*?)<\/b>/gi, '**$1**')
      // Convert <em> <i> to __
      .replace(/<em>(.*?)<\/em>/gi, '__$1__')
      .replace(/<i>(.*?)<\/i>/gi, '__$1__')
      // Convert <del> to ~~
      .replace(/<del>(.*?)<\/del>/gi, '~~$1~~')
      // Convert <mark> to ==
      .replace(/<mark>(.*?)<\/mark>/gi, '==$1==')
      // Convert <code> to `
      .replace(/<code>(.*?)<\/code>/gi, '`$1`')
      // Convert &nbsp; to space
      .replace(/&nbsp;/g, ' ')
      // Remove zero width spaces
      // eslint-disable-next-line no-misleading-character-class
      .replace(/[\u200B\u200C\u200D\uFEFF]/g, '')
      // replace starting and ending newlines
      .replace(/^\n+|\n+$/g, '')
      // Remove any remaining HTML tags
      .replace(/<[^>]+>/g, '')
  );
};

function parseMarkdown(markdown) {
  // Split the input into lines
  const lines = markdown.split('\n');
  let html = '';
  let lineType = null;

  const closeTag = () => {
    if (['ul', 'ol', 'blockquote'].includes(lineType)) {
      html += `</${lineType}>`;
      lineType = null;
    }
  };

  lines.forEach(line => {
    // Remove leading and trailing whitespace
    line = parseInlineMarkdown(line);

    // Handle headers
    if (/^#{1,6} /.test(line)) {
      const headerLevel = line.match(/^#+/)[0].length;
      const headerText = line.slice(headerLevel + 1).trim();
      html += `<h${headerLevel}>${headerText}</h${headerLevel}>`;
      lineType = 'header';
    }
    // Handle unordered lists
    else if (/^- /.test(line) || /^\* /.test(line)) {
      if (lineType !== 'ul') {
        closeTag();
        html += '<ul>';
        lineType = 'ul';
      }
      const listItem = line.slice(2).trim();
      html += `<li>${listItem}</li>`;
    }
    // Handle ordered lists
    else if (/^\d+\. /.test(line)) {
      if (lineType !== 'ol') {
        closeTag();
        html += '<ol>';
        lineType = 'ol';
      }
      const listItem = line.replace(/^\d+\.\s*/, '').trim();
      html += `<li>${listItem}</li>`;
    }
    // Handle blockquotes
    else if (/^> /.test(line)) {
      if (lineType !== 'blockquote') {
        closeTag();
        html += '<blockquote>';
        lineType = 'blockquote';
      }
      const blockquoteText = line.slice(2).trim();
      html += `<p>${blockquoteText}</p>`;
    }
    // Handle paragraphs
    else {
      if (lineType !== 'p') {
        closeTag();
      }
      lineType = 'p';
      html += `<p>${line || '<br>'}</p>`;
    }
  });

  closeTag();

  return html;
}

const parseInlineMarkdown = markdown => {
  return (
    markdown
      // Link
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/gim, '<a href="$2" target="_blank">$1</a>')
      // Bold
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      // Italic
      .replace(/__(.*?)__/gim, '<em>$1</em>')
      // Strikethrough
      .replace(/~~(.*?)~~/gim, '<del>$1</del>')
      // Inline code
      .replace(/`([^`]+)`/gim, '<code>$1</code>')
      // Highlight
      .replace(/==(.*?)==/gim, '<mark>$1</mark>')
  );
};

const has2TrailingSpaces = text => {
  return /\s{2,}$/.test(text) || /(&nbsp;){2,}$/.test(text);
};

const helperText = `&#42;&#42;bold&#42;&#42;: becomes **bold**;
&#95;&#95;italic&#95;&#95;: becomes __italic__ (2 underscores);
&#126;&#126;strikethrough&#126;&#126;: becomes ~~strikethrough~~;
&#61;&#61;highlight&#61;&#61;: becomes ==highlight==;
&#91;notenote.cc&#93;(https://app.notenote.cc/): becomes [notenote.cc](https://app.notenote.cc/);
Start with # you get a header (supports up to 6 levels);
Start with > you get a blockquote;
Start with - you get an unordered list;
Start with 1. you get an ordered list.`;

export const HelperText = React.memo(() => {
  const [open, setOpen] = useState(false);

  const handleToggle = useCallback(() => {
    setOpen(!open);
  }, [open]);

  return (
    <>
      <HelperTitleWrapper align="center" mt="1">
        <Text size="1" onClick={handleToggle}>
          Supports markdown, click to learn more{' '}
        </Text>
        {open ? (
          <RiArrowDropUpLine onClick={handleToggle} />
        ) : (
          <RiArrowDropDownLine onClick={handleToggle} />
        )}
      </HelperTitleWrapper>
      <AnimatedBox visible={open}>
        <HelperContentWrapper>
          <Markdown markdown={helperText} />
        </HelperContentWrapper>
      </AnimatedBox>
    </>
  );
});

const HelperTitleWrapper = styled(Flex)`
  user-select: none;
`;
const HelperContentWrapper = styled.div`
  & * {
    font-size: var(--font-size-1);
  }
`;
