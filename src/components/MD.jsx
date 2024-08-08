import './MD.css';

import React, { useEffect, useRef, useState } from 'react';

export const MarkdownEditor = ({ defaultText, onChange }) => {
  const [text, setText] = useState(defaultText || '');
  const editorRef = useRef(null);
  const cursorPositionRef = useRef(null);

  const handleInput = e => {
    const newHtml = e.target.innerHTML;
    saveCursorPosition();
    setText(newHtml);

    onChange(convertToMarkdown(newHtml));
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      document.execCommand('insertHTML', false, '<br><br>');
    } else if (e.key === ' ') {
      e.preventDefault();
      insertSpaceAfterFormatting();
    }
  };

  const insertSpaceAfterFormatting = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const startContainer = range.startContainer;
      let currentNode =
        startContainer.nodeType === Node.TEXT_NODE ? startContainer.parentNode : startContainer;

      if (['EM', 'STRONG', 'DEL', 'CODE'].includes(currentNode.nodeName)) {
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
        document.execCommand('insertHTML', false, '&nbsp;');
      }
    }
  };

  const saveCursorPosition = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const preSelectionRange = range.cloneRange();
      preSelectionRange.selectNodeContents(editorRef.current);
      preSelectionRange.setEnd(range.startContainer, range.startOffset);
      const fullText = preSelectionRange.toString();
      const visibleText = fullText.replace(/[*_~`]/g, '');
      cursorPositionRef.current = visibleText.length;
    }
  };

  const restoreCursorPosition = () => {
    if (cursorPositionRef.current === null) return;

    const selection = window.getSelection();
    const range = document.createRange();

    let currentLength = 0;
    let targetNode = null;
    let targetOffset = 0;

    const traverseNodes = node => {
      if (targetNode) return;

      if (node.nodeType === Node.TEXT_NODE) {
        const visibleLength = node.textContent.length;
        if (currentLength + visibleLength >= cursorPositionRef.current) {
          targetNode = node;
          targetOffset = cursorPositionRef.current - currentLength;
        } else {
          currentLength += visibleLength;
        }
      } else {
        for (let child of node.childNodes) {
          traverseNodes(child);
        }
      }
    };

    traverseNodes(editorRef.current);

    if (targetNode) {
      // Check if the target node is inside a formatted element
      let currentNode = targetNode;
      while (currentNode !== editorRef.current) {
        if (['EM', 'STRONG', 'DEL', 'CODE'].includes(currentNode.nodeName)) {
          // If it is, move to the next sibling or create a new text node
          if (currentNode.nextSibling) {
            targetNode = currentNode.nextSibling;
            targetOffset = 0;
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

  useEffect(() => {
    if (editorRef.current) {
      const parsed = parseMarkdown(text);
      if (parsed !== editorRef.current.innerHTML) {
        editorRef.current.innerHTML = parsed;
        restoreCursorPosition();
        editorRef.current.focus();
      }
    }
  }, [text]);

  return (
    <div className="markdown-editor">
      <div
        ref={editorRef}
        className="editor"
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

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

export const parseMarkdown = input => {
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

export function renderMarkdown(markdown) {
  const html = parseMarkdown(markdown);
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
