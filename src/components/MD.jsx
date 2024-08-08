import { Text } from '@radix-ui/themes';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

const supportedTags = ['EM', 'STRONG', 'DEL', 'CODE'];

export const MarkdownEditor = React.memo(({ defaultText, onChange }) => {
  const [text, setText] = useState(defaultText || '');
  const editorRef = useRef(null);
  const cursorPositionRef = useRef(null);

  const handleInput = useCallback(
    e => {
      cursorPositionRef.current = getCursorPosition(editorRef.current);

      const newHtml = e.target.innerHTML;
      setText(newHtml);

      onChange(convertToMarkdown(newHtml));
    },
    [onChange]
  );

  const handleKeyDown = useCallback(e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleEnterKey();
    } else if (e.key === ' ') {
      e.preventDefault();
      handleSpaceKey();
    } else if (e.key === 'ArrowRight') {
      handleRightArrowKey();
    }
  }, []);

  useEffect(() => {
    if (editorRef.current) {
      const parsed = parseMarkdown(text);
      if (parsed !== editorRef.current.innerHTML) {
        editorRef.current.innerHTML = parsed;
        restoreCursorPosition(editorRef.current, cursorPositionRef.current);
        editorRef.current.focus();
      }
    }
  }, [text]);

  return (
    <Wrapper>
      <Editor ref={editorRef} contentEditable onInput={handleInput} onKeyDown={handleKeyDown} />
      <Text size="1">Markdown editor, support ~~ __ ** and `</Text>
    </Wrapper>
  );
});

export const convertToMarkdown = html => {
  let markdown = html
    // Convert <br> to newline
    .replace(/<br\s*\/?>/gi, '\n')
    // Convert <strong> to **
    .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
    // Convert <em> to __
    .replace(/<em>(.*?)<\/em>/gi, '__$1__')
    // Convert <del> to ~~
    .replace(/<del>(.*?)<\/del>/gi, '~~$1~~')
    // Convert <code> to `
    .replace(/<code>(.*?)<\/code>/gi, '`$1`')
    // Convert &nbsp; to space
    .replace(/&nbsp;/g, ' ')
    // Remove any remaining HTML tags
    .replace(/<[^>]+>/g, '');

  return markdown;
};

export function renderMarkdown(markdown) {
  const html = parseMarkdown(markdown);
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
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
    min-height: 200px;
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
  let parsed = input
    // Bold
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    // Italic
    .replace(/__(.*?)__/gim, '<em>$1</em>')
    // Strikethrough
    .replace(/~~(.*?)~~/gim, '<del>$1</del>')
    // Inline code
    .replace(/`([^`]+)`/gim, '<code>$1</code>')
    // Line breaks
    .replace(/\n/gim, '<br>');

  return parsed;
};

const handleEnterKey = () => {
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    range.deleteContents();

    // Create two <br> elements
    const br1 = document.createElement('br');
    const br2 = document.createElement('br');

    // Insert the <br> elements
    range.insertNode(br2);
    range.insertNode(br1);

    // Move the cursor after the second <br>
    range.setStartAfter(br2);
    range.setEndAfter(br2);
    selection.removeAllRanges();
    selection.addRange(range);
  }
};

const handleSpaceKey = () => {
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const startContainer = range.startContainer;
    let currentNode =
      startContainer.nodeType === Node.TEXT_NODE ? startContainer.parentNode : startContainer;

    if (supportedTags.includes(currentNode.nodeName)) {
      const span = document.createElement('span');
      span.innerHTML = '&nbsp;';
      span.setAttribute('data-markdown-space', 'true');
      currentNode.parentNode.insertBefore(span, currentNode.nextSibling);

      const newRange = document.createRange();
      newRange.setStartAfter(span);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);
    } else {
      const spaceNode = document.createTextNode('\u00A0');
      range.insertNode(spaceNode);

      range.setStartAfter(spaceNode);
      range.setEndAfter(spaceNode);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
};

const handleRightArrowKey = () => {
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const startContainer = range.startContainer;
    const offset = range.startOffset;

    // Check if the cursor is at the end of a text node within a formatted element
    if (
      startContainer.nodeType === Node.TEXT_NODE &&
      offset === startContainer.textContent.length
    ) {
      let currentNode = startContainer.parentNode;

      // Check if the current node is a formatted element
      if (supportedTags.includes(currentNode.nodeName)) {
        // Move the cursor outside the formatted element
        const newRange = document.createRange();

        // If there is a next sibling, set the cursor at the start of that sibling
        if (currentNode.nextSibling) {
          newRange.setStart(currentNode.nextSibling, 0);
        } else {
          // If there's no next sibling, create a span with a non-breaking space
          const span = document.createElement('span');
          span.innerHTML = '&nbsp;'; // Add a non-breaking space
          currentNode.parentNode.appendChild(span);
          newRange.setStart(span, 1); // Position cursor after the non-breaking space
        }
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    }
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
    range.setStart(targetNode, targetOffset);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }
};
