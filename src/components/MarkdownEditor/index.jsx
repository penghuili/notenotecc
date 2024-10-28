import { Typography } from '@douyinfe/semi-ui';
import { RiArrowDropDownLine, RiArrowDropUpLine } from '@remixicon/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import fastMemo from 'react-fast-memo';
import styled from 'styled-components';

import { compareObjects } from '../../shared/js/object.js';
import { AnimatedBox } from '../../shared/semi/AnimatedBox.jsx';
import { Flex } from '../../shared/semi/Flex.jsx';
import { Editor, Markdown } from './Markdown.jsx';
import {
  convertToMarkdown,
  getCursorPosition,
  isValidUrl,
  parseMarkdown,
} from './markdownHelpers.js';
import {
  addEmptyTextNodeAfter,
  convertToBlockquote,
  convertToHeader,
  convertToList,
  getRange,
  getRangeContainer,
  hasRedoHistoryCat,
  hasUndoHistoryCat,
  moveListItem,
  setCursorPosition,
  supportedInlineTags,
  Toolbar,
  zeroWidthSpace,
} from './Toolbar.jsx';

export const MarkdownEditor = fastMemo(({ defaultText, onChange, autoFocus }) => {
  const editorRef = useRef(null);
  const [activeElements, setActiveElements] = useState({});
  const prevActiveElements = useRef({});
  const [isEmpty, setIsEmpty] = useState(true);
  const undoHistoryRef = useRef([]);
  const redoHistoryRef = useRef([]);
  const historyTimerIdRef = useRef(null);

  const handleCheckActiveElements = useCallback(() => {
    const elements = checkActiveElements(editorRef.current, prevActiveElements.current);
    if (elements !== prevActiveElements.current) {
      setActiveElements(elements);
      prevActiveElements.current = elements;
    }

    const newEmpty = editorRef.current.innerHTML.trim() === '<p></p>';
    setIsEmpty(newEmpty);
  }, []);

  const handleChange = useCallback(
    isUndoRedo => {
      let innerHTML = editorRef.current.innerHTML;
      if (innerHTML.trim() === '') {
        innerHTML = '<p></p>';
        editorRef.current.innerHTML = innerHTML;
      }
      const markdown = convertToMarkdown(innerHTML);
      onChange(markdown);

      handleCheckActiveElements();

      if (historyTimerIdRef.current) {
        return;
      }
      if (!isUndoRedo) {
        redoHistoryRef.current = [];
        hasRedoHistoryCat.set(false);

        const position = getCursorPosition(editorRef.current);
        historyTimerIdRef.current = setTimeout(() => {
          if (
            undoHistoryRef.current[undoHistoryRef.current.length - 1]?.innerHTML !== innerHTML &&
            innerHTML !== editorRef.current.innerHTML
          ) {
            undoHistoryRef.current.push({ innerHTML, position });
            undoHistoryRef.current = undoHistoryRef.current.slice(-30);
            hasUndoHistoryCat.set(undoHistoryRef.current.length > 0);
          }

          clearTimeout(historyTimerIdRef.current);
          historyTimerIdRef.current = null;
        }, 1000);
      }
    },
    [handleCheckActiveElements, onChange]
  );

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

  const handleKeyDown = useCallback(
    event => {
      // check if it's tab
      if (event.key === 'Tab') {
        event.preventDefault();

        moveListItem(editorRef.current, event.shiftKey);

        handleChange();
      }
    },
    [handleChange]
  );

  const handlePaste = useCallback(
    event => {
      event.preventDefault();

      const text =
        event.clipboardData?.getData('text/html') || event.clipboardData?.getData('text/plain');
      if (!text) {
        return;
      }

      const markdown = convertToMarkdown(text).trim();
      const isUrl = isValidUrl(markdown);
      const pastedHtml = isUrl
        ? `<a href=${markdown} target="_blank" rel="noreferrer">${markdown}</a>`
        : parseMarkdown(markdown);

      // Insert the cleaned HTML at the cursor position
      const selection = window.getSelection();
      if (!selection.rangeCount) return;
      const range = selection.getRangeAt(0);

      range.deleteContents(); // Remove any selected text
      // Create a temporary div to hold the HTML content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = pastedHtml;

      // Insert each child of the temporary div
      while (tempDiv.firstChild) {
        range.insertNode(tempDiv.firstChild);
        range.collapse(false); // Move to the end of the inserted content
      }

      // Move the cursor to the end of the inserted content
      selection.collapseToEnd();
      handleChange();
    },
    [handleChange]
  );

  useEffect(() => {
    editorRef.current.innerHTML = defaultText ? parseMarkdown(defaultText) : '<p></p>';

    const newEmpty = editorRef.current.innerHTML.trim() === '<p></p>';
    setIsEmpty(newEmpty);

    return () => {
      if (historyTimerIdRef.current) {
        clearTimeout(historyTimerIdRef.current);
        historyTimerIdRef.current = null;
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (autoFocus) {
      editorRef.current.focus();
      handleCheckActiveElements();
    }
  }, [autoFocus, handleCheckActiveElements]);

  return (
    <Wrapper>
      <Toolbar
        editorRef={editorRef}
        undoHistoryRef={undoHistoryRef}
        redoHistoryRef={redoHistoryRef}
        activeElements={activeElements}
        onChange={handleChange}
      />
      <Editor
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onMouseUp={handleCheckActiveElements}
        onTouchEnd={handleCheckActiveElements}
        onKeyDown={handleKeyDown}
        onKeyUp={handleCheckActiveElements}
        onPaste={handlePaste}
        data-placeholder="Start typing here..."
        isEmpty={isEmpty}
      />

      <HelperText />
    </Wrapper>
  );
});

const getActiveElements = wrapperElement => {
  let container = getRangeContainer();
  if (!container || !wrapperElement.contains(container)) {
    return {};
  }

  const elements = {};
  if (container?.nodeType === Node.ELEMENT_NODE) {
    elements[container.tagName] = true;
  }
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
  if (!compareObjects(elements, currentActiveElements)) {
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

  const { text } = result;

  const listType = listPattern(text);
  if (listType) {
    convertToList(wrapperElement, listType);
  }

  const headerType = headerPattern(text);
  if (headerType) {
    convertToHeader(wrapperElement, headerType);
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

  return {
    text: textBeforeCursor
      // nbsp
      .replace(/\u00A0/g, ' ')
      // zero width space
      .replace(/\u200B/g, ''),
    container,
  };
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

    const div = addEmptyPAfter(currentElement);
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
      { regex: /\[([^\]]+)\]\(((?:https?:\/\/)?(?:[^()\s]+|\([^)]*\))+)\)/, tag: 'a' },
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

        const empty = addEmptyTextNodeAfter(inlineElement);
        setCursorPosition(empty, 1);
      }
    });
  }
};

const escapeInlineTags = inlineElement => {
  const textContent = inlineElement.textContent;

  if (has2TrailingSpaces(textContent)) {
    inlineElement.textContent = textContent.replace(/(\s|&nbsp;){2,}$/, '');

    const empty = addEmptyTextNodeAfter(inlineElement);
    setCursorPosition(empty, 1);
  }
};

const addEmptyPAfter = element => {
  const p = document.createElement('p');
  p.innerHTML = zeroWidthSpace;
  element.parentNode.insertBefore(p, element.nextSibling);

  return p;
};

const Wrapper = styled.div`
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;

const has2TrailingSpaces = text => {
  return /\s{2,}$/.test(text) || /(&nbsp;){2,}$/.test(text);
};

const helperText = `&#42;&#42;bold&#42;&#42;: becomes **bold**;
&#95;&#95;italic&#95;&#95;: becomes __italic__ (2 underscores);
&#126;&#126;strikethrough&#126;&#126;: becomes ~~strikethrough~~;
&#61;&#61;highlight&#61;&#61;: becomes ==highlight==;
&#96;code&#96;: becomes \`code\`;
&#91;notenote.cc&#93;(https://app.notenote.cc/): becomes [notenote.cc](https://app.notenote.cc/);
Start with # you get a header (supports up to 6 levels);
Start with > you get a blockquote;
Start with - you get an unordered list;
Start with 1. you get an ordered list.`;

export const HelperText = fastMemo(() => {
  const [open, setOpen] = useState(false);

  const handleToggle = useCallback(() => {
    setOpen(!open);
  }, [open]);

  return (
    <>
      <Flex
        direction="row"
        align="center"
        style={{
          marginTop: '0.5rem',
          userSelect: 'none',
        }}
      >
        <Typography.Text size="small" onClick={handleToggle}>
          Supports markdown, click to learn more{' '}
        </Typography.Text>
        {open ? (
          <RiArrowDropUpLine onClick={handleToggle} />
        ) : (
          <RiArrowDropDownLine onClick={handleToggle} />
        )}
      </Flex>
      <AnimatedBox visible={open}>
        <Markdown markdown={helperText} />
      </AnimatedBox>
    </>
  );
});
