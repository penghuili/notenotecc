import { Flex, IconButton } from '@radix-ui/themes';
import { RiBold, RiCodeLine, RiItalic, RiMarkPenLine, RiStrikethrough } from '@remixicon/react';
import React, { useCallback } from 'react';
import styled from 'styled-components';

export const Toolbar = React.memo(({ editorRef, activeElements }) => {
  const handleToggleBold = useCallback(() => {
    if (activeElements.STRONG || activeElements.B) {
      removeInlineTag(editorRef.current, ['strong', 'b']);
    } else {
      addInlineTag(editorRef.current, 'strong');
    }
  }, [activeElements.B, activeElements.STRONG, editorRef]);

  const handleToggleItalic = useCallback(() => {
    if (activeElements.EM || activeElements.I) {
      removeInlineTag(editorRef.current, ['em', 'i']);
    } else {
      addInlineTag(editorRef.current, 'em');
    }
  }, [activeElements.EM, activeElements.I, editorRef]);

  const handleToggleStrikethrough = useCallback(() => {
    if (activeElements.DEL) {
      removeInlineTag(editorRef.current, ['del']);
    } else {
      addInlineTag(editorRef.current, 'del');
    }
  }, [activeElements.DEL, editorRef]);

  const handleToggleCode = useCallback(() => {
    if (activeElements.CODE) {
      removeInlineTag(editorRef.current, ['code']);
    } else {
      addInlineTag(editorRef.current, 'code');
    }
  }, [activeElements.CODE, editorRef]);

  const handleToggleMark = useCallback(() => {
    if (activeElements.MARK) {
      removeInlineTag(editorRef.current, ['mark']);
    } else {
      addInlineTag(editorRef.current, 'mark');
    }
  }, [activeElements.MARK, editorRef]);

  return (
    <Wrapper position="absolute" bottom="0">
      <IconButton
        variant={activeElements.STRONG || activeElements.B ? 'solid' : 'soft'}
        onClick={handleToggleBold}
        radius="none"
      >
        <RiBold />
      </IconButton>
      <IconButton
        variant={activeElements.EM || activeElements.I ? 'solid' : 'soft'}
        onClick={handleToggleItalic}
        radius="none"
      >
        <RiItalic />
      </IconButton>
      <IconButton
        variant={activeElements.DEL ? 'solid' : 'soft'}
        onClick={handleToggleStrikethrough}
        radius="none"
      >
        <RiStrikethrough />
      </IconButton>
      <IconButton
        variant={activeElements.CODE ? 'solid' : 'soft'}
        onClick={handleToggleCode}
        radius="none"
      >
        <RiCodeLine />
      </IconButton>
      <IconButton
        variant={activeElements.MARK ? 'solid' : 'soft'}
        onClick={handleToggleMark}
        radius="none"
      >
        <RiMarkPenLine />
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

  const strong = document.createElement(inlineTag);
  strong.textContent = selectedText;

  range.deleteContents(); // Remove the selected text
  range.insertNode(strong); // Insert the <strong> element

  const newRange = document.createRange();
  newRange.setStartAfter(strong);
  newRange.collapse(true);

  // Clear the selection and set the new range
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

const Wrapper = styled(Flex)`
  width: 100%;
`;
const Placeholder = styled.div`
  width: ${props => props.width};
  height: 32px;
  background-color: var(--accent-a3);
`;
