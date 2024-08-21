import { Flex, Text } from '@radix-ui/themes';
import { RiArrowDropDownLine, RiArrowDropUpLine } from '@remixicon/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { compareObjects } from '../../shared/js/object.js';
import { AnimatedBox } from '../../shared/react/AnimatedBox.jsx';
import { Editor, Markdown } from './Markdown.jsx';
import { convertToMarkdown, getCursorPosition, parseMarkdown } from './markdownHelpers.js';
import {
  convertToBlockquote,
  convertToHeader,
  convertToList,
  getRange,
  getRangeContainer,
  hasRedoHistoryCat,
  hasUndoHistoryCat,
  setCursorPosition,
  Toolbar,
  zeroWidthSpace,
} from './Toolbar.jsx';

const supportedInlineTags = ['EM', 'I', 'STRONG', 'B', 'DEL', 'CODE', 'MARK'];

export const MarkdownEditor = React.memo(({ defaultText, onChange, autoFocus }) => {
  const editorRef = useRef(null);
  const [activeElements, setActiveElements] = useState({});
  const prevActiveElements = useRef({});
  const [isEmpty, setIsEmpty] = useState(true);
  const undoHistoryRef = useRef([]);
  const redoHistoryRef = useRef([]);
  const historyTimerIdRef = useRef(null);
  const [isFocusing, setIsFocusing] = useState(false);

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
      const innerHTML = editorRef.current.innerHTML;
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

  const handleFocus = useCallback(() => {
    setIsFocusing(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocusing(false);
  }, []);

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

    // eslint-disable-next-line react-compiler/react-compiler
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (autoFocus) {
      editorRef.current.focus();
      handleCheckActiveElements();
    }
    // eslint-disable-next-line react-compiler/react-compiler
  }, [autoFocus, handleCheckActiveElements]);

  return (
    <Wrapper>
      <Editor
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onMouseUp={handleCheckActiveElements}
        onTouchEnd={handleCheckActiveElements}
        onKeyUp={handleCheckActiveElements}
        onFocus={handleFocus}
        onBlur={handleBlur}
        data-placeholder="Start typing here..."
        isEmpty={isEmpty}
      />
      {isFocusing && (
        <Toolbar
          editorRef={editorRef}
          undoHistoryRef={undoHistoryRef}
          redoHistoryRef={redoHistoryRef}
          activeElements={activeElements}
          onChange={handleChange}
        />
      )}
    </Wrapper>
  );
});

const getActiveElements = wrapperElement => {
  let container = getRangeContainer();
  if (!container || !wrapperElement.contains(container)) {
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
`;

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
