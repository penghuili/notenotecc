import { Text } from '@radix-ui/themes';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

const supportedTags = ['EM', 'STRONG', 'B', 'DEL', 'CODE', 'I'];

export const MarkdownEditor = React.memo(({ defaultText, onChange, autoFocus }) => {
  const [text, setText] = useState(defaultText || '');

  const editorRef = useRef(null);
  const cursorPositionRef = useRef(null);

  const handleKeyDown = useCallback(e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleEnterKey();
    }
  }, []);

  const handleInput = useCallback(
    e => {
      cursorPositionRef.current = getCursorPosition(editorRef.current);

      const newHtml = e.target.innerHTML;
      setText(newHtml);

      onChange(convertToMarkdown(newHtml));
    },
    [onChange]
  );

  useEffect(() => {
    if (editorRef.current) {
      const parsed = parseMarkdown(text);
      const noTrailingSpaces = removeTrailingSpacesFromMarkdownTags(parsed);
      if (noTrailingSpaces !== editorRef.current.innerHTML) {
        editorRef.current.innerHTML = parsed;
        restoreCursorPosition(editorRef.current, cursorPositionRef.current);
        editorRef.current.focus();
      }
    }
  }, [text]);

  return (
    <Wrapper>
      <Editor
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        autoFocus={autoFocus}
      />
      <Text size="1">Markdown editor, support ~~ __ ** and `</Text>
    </Wrapper>
  );
});

export const convertToMarkdown = html => {
  return (
    html
      // Convert <br> to newline
      .replace(/<br\s*\/?>/gi, '\n')
      // Convert <strong> to **
      .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<b>(.*?)<\/b>/gi, '**$1**')
      // Convert <em> to __
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
  );
};

export function renderMarkdown(markdown) {
  const html = parseMarkdown(markdown);
  return <Editor dangerouslySetInnerHTML={{ __html: html }} />;
}

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
`;

const parseMarkdown = input => {
  return (
    input
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

const removeTrailingSpacesFromMarkdownTags = input => {
  // Remove trailing spaces and non-breaking spaces within HTML tags only if there are two or more
  return input.replace(/(<(strong|b|em|del|code|i)>)(.*?)(\s|&nbsp;){2,}(<\/\2>)/gi, '$1$3$5');
};

const handleEnterKey = () => {
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    range.deleteContents();

    const br = document.createElement('br');
    range.insertNode(br);

    // Move the cursor after the second <br>
    range.setStartAfter(br);
    selection.removeAllRanges();
    selection.addRange(range);
  }
};

const getCursorPosition = element => {
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(element);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const fullText = preSelectionRange.toString();
    const visibleText = fullText.replace(/[*_~`]/g, '');
    return visibleText.length;
  }

  return null;
};

const restoreCursorPosition = (element, position) => {
  if (position === null) return;

  const selection = window.getSelection();
  const range = document.createRange();

  let currentLength = 0;
  let targetNode = null;
  let targetOffset = 0;

  const traverseNodes = node => {
    if (targetNode) return;

    if (node.nodeType === Node.TEXT_NODE) {
      const visibleLength = node.textContent.length;
      if (currentLength + visibleLength >= position) {
        targetNode = node;
        targetOffset = position - currentLength;
      } else {
        currentLength += visibleLength;
      }
    } else {
      for (let child of node.childNodes) {
        traverseNodes(child);
      }
    }
  };

  traverseNodes(element);

  if (targetNode) {
    let currentNode = targetNode;
    while (currentNode !== element) {
      if (supportedTags.includes(currentNode.nodeName)) {
        const textContent = targetNode.textContent;

        // Check for two or more spaces (including non-breaking spaces) at the end
        if (has2TrailingSpaces(textContent)) {
          // Remove the trailing spaces
          targetNode.textContent = textContent.replace(/(\s|&nbsp;){2,}$/, '');
        }
        // Move the cursor outside the formatted element
        if (currentNode.nextSibling) {
          targetNode = currentNode.nextSibling;
          targetOffset = 1;
        } else {
          const span = document.createElement('span');
          span.innerHTML = '&nbsp;'; // Non-breaking space inside a span
          currentNode.parentNode.insertBefore(span, currentNode.nextSibling);
          targetNode = span.firstChild;
          targetOffset = 1;
        }
        break;
      }
      currentNode = currentNode.parentNode;
    }

    range.setStart(targetNode, targetOffset);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }
};

const has2TrailingSpaces = text => {
  return /\s{2,}$/.test(text) || /(&nbsp;){2,}$/.test(text);
};
