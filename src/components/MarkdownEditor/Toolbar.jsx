import { Flex, IconButton } from '@radix-ui/themes';
import {
  RiBold,
  RiCodeLine,
  RiDoubleQuotesL,
  RiH1,
  RiH2,
  RiItalic,
  RiListOrdered,
  RiListUnordered,
  RiMarkPenLine,
  RiStrikethrough,
} from '@remixicon/react';
import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';

export const zeroWidthSpace = '&ZeroWidthSpace;';

export const Toolbar = React.memo(({ editorRef, activeElements, onChange }) => {
  const isActive = useMemo(() => Object.keys(activeElements).length > 0, [activeElements]);

  const handleToggleBold = useCallback(() => {
    if (activeElements.STRONG || activeElements.B) {
      removeInlineTag(editorRef.current, ['strong', 'b']);
    } else {
      addInlineTag(editorRef.current, 'strong');
    }

    onChange();
  }, [activeElements.B, activeElements.STRONG, editorRef, onChange]);

  const handleToggleItalic = useCallback(() => {
    if (activeElements.EM || activeElements.I) {
      removeInlineTag(editorRef.current, ['em', 'i']);
    } else {
      addInlineTag(editorRef.current, 'em');
    }

    onChange();
  }, [activeElements.EM, activeElements.I, editorRef, onChange]);

  const handleToggleStrikethrough = useCallback(() => {
    if (activeElements.DEL) {
      removeInlineTag(editorRef.current, ['del']);
    } else {
      addInlineTag(editorRef.current, 'del');
    }

    onChange();
  }, [activeElements.DEL, editorRef, onChange]);

  const handleToggleCode = useCallback(() => {
    if (activeElements.CODE) {
      removeInlineTag(editorRef.current, ['code']);
    } else {
      addInlineTag(editorRef.current, 'code');
    }

    onChange();
  }, [activeElements.CODE, editorRef, onChange]);

  const handleToggleMark = useCallback(() => {
    if (activeElements.MARK) {
      removeInlineTag(editorRef.current, ['mark']);
    } else {
      addInlineTag(editorRef.current, 'mark');
    }

    onChange();
  }, [activeElements.MARK, editorRef, onChange]);

  const handleToggleH1 = useCallback(() => {
    if (activeElements.H1) {
      removeBlockElement(editorRef.current);
    } else {
      convertToHeader(editorRef.current, 'h1');
    }

    onChange();
  }, [activeElements.H1, editorRef, onChange]);

  const handleToggleH2 = useCallback(() => {
    if (activeElements.H2) {
      removeBlockElement(editorRef.current);
    } else {
      convertToHeader(editorRef.current, 'h2');
    }

    onChange();
  }, [activeElements.H2, editorRef, onChange]);

  const handleToggleUL = useCallback(() => {
    if (activeElements.UL) {
      removeListElement(editorRef.current);
    } else {
      convertToList(editorRef.current, 'ul');
    }

    onChange();
  }, [activeElements.UL, editorRef, onChange]);

  const handleToggleOL = useCallback(() => {
    if (activeElements.OL) {
      removeListElement(editorRef.current);
    } else {
      convertToList(editorRef.current, 'ol');
    }

    onChange();
  }, [activeElements.OL, editorRef, onChange]);

  const handleToggleBlockquote = useCallback(() => {
    if (activeElements.BLOCKQUOTE) {
      removeBlockquoteElement(editorRef.current);
    } else {
      convertToBlockquote(editorRef.current);
    }

    onChange();
  }, [activeElements.BLOCKQUOTE, editorRef, onChange]);

  return (
    <Wrapper>
      <IconButton
        variant={activeElements.STRONG || activeElements.B ? 'solid' : 'soft'}
        onClick={handleToggleBold}
        radius="none"
        disabled={!isActive}
      >
        <RiBold />
      </IconButton>
      <IconButton
        variant={activeElements.EM || activeElements.I ? 'solid' : 'soft'}
        onClick={handleToggleItalic}
        radius="none"
        disabled={!isActive}
      >
        <RiItalic />
      </IconButton>
      <IconButton
        variant={activeElements.DEL ? 'solid' : 'soft'}
        onClick={handleToggleStrikethrough}
        radius="none"
        disabled={!isActive}
      >
        <RiStrikethrough />
      </IconButton>
      <IconButton
        variant={activeElements.CODE ? 'solid' : 'soft'}
        onClick={handleToggleCode}
        radius="none"
        disabled={!isActive}
      >
        <RiCodeLine />
      </IconButton>
      <IconButton
        variant={activeElements.MARK ? 'solid' : 'soft'}
        onClick={handleToggleMark}
        radius="none"
        disabled={!isActive}
      >
        <RiMarkPenLine />
      </IconButton>

      <IconButton
        variant={activeElements.H1 ? 'solid' : 'soft'}
        onClick={handleToggleH1}
        radius="none"
        disabled={!isActive || activeElements.LI || activeElements.BLOCKQUOTE}
      >
        <RiH1 />
      </IconButton>
      <IconButton
        variant={activeElements.H2 ? 'solid' : 'soft'}
        onClick={handleToggleH2}
        radius="none"
        disabled={!isActive || activeElements.LI || activeElements.BLOCKQUOTE}
      >
        <RiH2 />
      </IconButton>
      <IconButton
        variant={activeElements.UL ? 'solid' : 'soft'}
        onClick={handleToggleUL}
        radius="none"
        disabled={
          !isActive ||
          activeElements.H1 ||
          activeElements.H2 ||
          activeElements.OL ||
          activeElements.BLOCKQUOTE
        }
      >
        <RiListUnordered />
      </IconButton>
      <IconButton
        variant={activeElements.OL ? 'solid' : 'soft'}
        onClick={handleToggleOL}
        radius="none"
        disabled={
          !isActive ||
          activeElements.H1 ||
          activeElements.H2 ||
          activeElements.UL ||
          activeElements.BLOCKQUOTE
        }
      >
        <RiListOrdered />
      </IconButton>

      <IconButton
        variant={activeElements.BLOCKQUOTE ? 'solid' : 'soft'}
        onClick={handleToggleBlockquote}
        radius="none"
        disabled={
          !isActive ||
          activeElements.H1 ||
          activeElements.H2 ||
          activeElements.UL ||
          activeElements.UL ||
          activeElements.OL
        }
      >
        <RiDoubleQuotesL />
      </IconButton>

      <Placeholder width={`calc(100% - ${5 * 32}px)`} />
    </Wrapper>
  );
});

const addInlineTag = (wrapperElement, inlineTag) => {
  const selection = window.getSelection();
  if (!selection.rangeCount) {
    return;
  }

  const range = selection.getRangeAt(0);
  const selectedText = range.toString();

  if (selectedText.trim() === '') {
    return;
  }

  const inlineElement = document.createElement(inlineTag);
  inlineElement.textContent = selectedText;

  range.deleteContents();
  range.insertNode(inlineElement);

  const newRange = document.createRange();
  newRange.setStart(inlineElement, 0);
  newRange.collapse(true);
  selection.removeAllRanges();
  selection.addRange(newRange);

  wrapperElement.focus();
};

const removeInlineTag = (wrapperElement, inlineTags) => {
  const selection = window.getSelection();
  if (!selection.rangeCount) {
    return;
  }

  const range = selection.getRangeAt(0);

  const startContainer = range.startContainer;
  const position = range.startOffset;

  let element = startContainer;
  if (!element) {
    return;
  }

  while (element !== wrapperElement && !includeElement(inlineTags, element)) {
    element = element.parentNode;
  }

  if (!includeElement(inlineTags, element)) {
    return;
  }

  element.replaceWith(...element.childNodes);

  const newRange = document.createRange();
  newRange.setStart(startContainer, position);
  newRange.collapse(true);
  selection.removeAllRanges();
  selection.addRange(newRange);
  wrapperElement.focus();
};

const includeElement = (tags, element) => {
  return tags.includes(element.tagName?.toLowerCase());
};

export const convertToHeader = (wrapperElement, headerType) => {
  const elements = getElementsForBlock(wrapperElement);
  if (!elements) {
    return;
  }

  const { element, parent, content } = elements;

  const header = document.createElement(headerType);
  header.innerHTML = content.replace(/^#{1,6} /, '').trim() || zeroWidthSpace;

  parent.replaceChild(header, element);

  setCursorPosition(header, 1);
};

const removeBlockElement = wrapperElement => {
  const elements = getElementsForBlock(wrapperElement);
  if (!elements) {
    return;
  }

  const { element, parent, content } = elements;

  const pElement = document.createElement('p');
  pElement.innerHTML = content.trim() || zeroWidthSpace;

  parent.replaceChild(pElement, element);

  setCursorPosition(pElement, 1);
};

export const convertToList = (wrapperElement, listType) => {
  const { parent, element, content } = getElementsForBlock(wrapperElement);

  const listItem = document.createElement('li');
  listItem.innerHTML = content.replace(/^- /, '').replace(/^1. /, '').trim();

  const list = document.createElement(listType);
  list.appendChild(listItem);

  parent.replaceChild(list, element);

  setCursorPosition(listItem, 0);
};

const removeListElement = wrapperElement => {
  const elements = getElementsForBlock(wrapperElement);
  if (!elements) {
    return;
  }

  const { element } = elements;

  const ps = Array.from(element.querySelectorAll('li')).map(li => {
    const pElement = document.createElement('p');
    pElement.innerHTML = li.innerHTML;
    return pElement;
  });

  element.replaceWith(...ps);

  setCursorPosition(ps[0], 1);
};

export const convertToBlockquote = wrapperElement => {
  const { parent, element, content } = getElementsForBlock(wrapperElement);

  const blockquote = document.createElement('blockquote');
  const pElement = document.createElement('p');
  pElement.innerHTML = content.replace('&gt;', '').trim() || zeroWidthSpace;
  blockquote.appendChild(pElement);

  parent.replaceChild(blockquote, element);

  setCursorPosition(pElement, 1);
};

const removeBlockquoteElement = wrapperElement => {
  const elements = getElementsForBlock(wrapperElement);
  if (!elements) {
    return;
  }

  const { element } = elements;

  const ps = Array.from(element.querySelectorAll('p'));

  element.replaceWith(...ps);

  setCursorPosition(ps[0], 1);
};

export const getElementsForBlock = wrapperElement => {
  let container = getRangeContainer();
  if (!container) {
    return null;
  }

  let element = container;
  let parent = container.parentNode;
  while (parent !== wrapperElement) {
    element = parent;
    parent = parent.parentNode;
  }

  return {
    element,
    parent,
    content: (element.innerHTML || element.textContent).replace('&nbsp;', ' '),
  };
};

export const setCursorPosition = (targetNode, targetOffset) => {
  const range = document.createRange();
  const selection = window.getSelection();
  range.setStart(targetNode, targetOffset);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
};

export const getRangeContainer = () => {
  const range = getRange();
  return range?.startContainer;
};

export const getRange = () => {
  const selection = window.getSelection();
  if (!selection.rangeCount) {
    return null;
  }

  return selection.getRangeAt(0);
};

const Wrapper = styled(Flex)`
  width: 100%;
  background-color: white;
  overflow-x: auto;
  scrollbar-width: none;
`;
const Placeholder = styled.div`
  width: ${props => props.width};
  min-width: 0;
  height: 32px;
  background-color: var(--accent-a3);
`;
