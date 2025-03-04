import {
  RiArrowGoBackLine,
  RiArrowGoForwardLine,
  RiBold,
  RiCodeLine,
  RiDoubleQuotesL,
  RiH1,
  RiH2,
  RiIndentDecrease,
  RiIndentIncrease,
  RiItalic,
  RiListOrdered,
  RiListUnordered,
  RiMarkPenLine,
  RiStrikethrough,
} from '@remixicon/react';
import React, { useCallback, useMemo } from 'react';
import fastMemo from 'react-fast-memo';
import styled from 'styled-components';
import { createCat, useCat } from 'usecat';

import { Flex } from '../../shared/semi/Flex';
import { IconButton } from '../../shared/semi/IconButton';
import { getCursorPosition, restoreCursorPosition } from './markdownHelpers';

export const zeroWidthSpace = '&ZeroWidthSpace;';
export const hasUndoHistoryCat = createCat(false);
export const hasRedoHistoryCat = createCat(false);
export const supportedInlineTags = ['EM', 'I', 'STRONG', 'B', 'DEL', 'CODE', 'MARK'];

export const Toolbar = fastMemo(
  ({ editorRef, undoHistoryRef, redoHistoryRef, activeElements, onChange }) => {
    const hasUndoHistory = useCat(hasUndoHistoryCat);
    const hasRedoHistory = useCat(hasRedoHistoryCat);
    const isActive = useMemo(() => Object.keys(activeElements).length > 0, [activeElements]);

    const handleUndo = useCallback(() => {
      const position = getCursorPosition(editorRef.current);
      redoHistoryRef.current.push({ innerHTML: editorRef.current.innerHTML, position });
      redoHistoryRef.current = redoHistoryRef.current.slice(-30);

      const lastItem = undoHistoryRef.current.pop();
      editorRef.current.innerHTML = lastItem.innerHTML;

      restoreCursorPosition(editorRef.current, lastItem.position);
      editorRef.current.focus();

      onChange(true);

      hasUndoHistoryCat.set(undoHistoryRef.current.length > 0);
      hasRedoHistoryCat.set(redoHistoryRef.current.length > 0);
    }, [editorRef, onChange, redoHistoryRef, undoHistoryRef]);

    const handleRedo = useCallback(() => {
      const position = getCursorPosition(editorRef.current);
      undoHistoryRef.current.push({ innerHTML: editorRef.current.innerHTML, position });
      undoHistoryRef.current = undoHistoryRef.current.slice(-30);

      const lastItem = redoHistoryRef.current.pop();
      editorRef.current.innerHTML = lastItem.innerHTML;

      restoreCursorPosition(editorRef.current, lastItem.position);
      editorRef.current.focus();

      onChange(true);

      hasUndoHistoryCat.set(undoHistoryRef.current.length > 0);
      hasRedoHistoryCat.set(redoHistoryRef.current.length > 0);
    }, [editorRef, onChange, redoHistoryRef, undoHistoryRef]);

    return (
      <Flex
        direction="row"
        className="toolbar"
        style={{
          width: '100%',
          backgroundColor: 'var(--semi-color-bg-0)',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          position: 'sticky',
          top: '3rem',
        }}
      >
        <IconButton
          icon={<RiArrowGoBackLine />}
          onClick={handleUndo}
          disabled={!isActive || !hasUndoHistory}
          style={{ borderRadius: '0' }}
        />

        <IconButton
          icon={<RiArrowGoForwardLine />}
          onClick={handleRedo}
          disabled={!isActive || !hasRedoHistory}
          style={{ borderRadius: '0' }}
        />

        <IconButton
          theme={activeElements.STRONG || activeElements.B ? 'solid' : 'light'}
          icon={<RiBold />}
          onClick={() => {
            toggleInlineTag(editorRef.current, ['strong', 'b']);
            onChange();
          }}
          disabled={!isActive}
          style={{ borderRadius: '0' }}
        />

        <IconButton
          theme={activeElements.EM || activeElements.I ? 'solid' : 'light'}
          icon={<RiItalic />}
          onClick={() => {
            toggleInlineTag(editorRef.current, ['em', 'i']);
            onChange();
          }}
          disabled={!isActive}
          style={{ borderRadius: '0' }}
        />

        <IconButton
          theme={activeElements.DEL ? 'solid' : 'light'}
          icon={<RiStrikethrough />}
          onClick={() => {
            toggleInlineTag(editorRef.current, ['del']);
            onChange();
          }}
          disabled={!isActive}
          style={{ borderRadius: '0' }}
        />

        <IconButton
          theme={activeElements.CODE ? 'solid' : 'light'}
          icon={<RiCodeLine />}
          onClick={() => {
            toggleInlineTag(editorRef.current, ['code']);
            onChange();
          }}
          disabled={!isActive}
          style={{ borderRadius: '0' }}
        />

        <IconButton
          theme={activeElements.MARK ? 'solid' : 'light'}
          icon={<RiMarkPenLine />}
          onClick={() => {
            toggleInlineTag(editorRef.current, ['mark']);
            onChange();
          }}
          disabled={!isActive}
          style={{ borderRadius: '0' }}
        />

        <IconButton
          theme={activeElements.H1 ? 'solid' : 'light'}
          icon={<RiH1 />}
          onClick={() => {
            if (activeElements.H1) {
              removeBlockElement(editorRef.current);
            } else {
              convertToHeader(editorRef.current, 'h1');
            }

            onChange();
          }}
          disabled={!isActive || activeElements.LI || activeElements.BLOCKQUOTE}
          style={{ borderRadius: '0' }}
        />

        <IconButton
          theme={activeElements.H2 ? 'solid' : 'light'}
          icon={<RiH2 />}
          onClick={() => {
            if (activeElements.H2) {
              removeBlockElement(editorRef.current);
            } else {
              convertToHeader(editorRef.current, 'h2');
            }

            onChange();
          }}
          disabled={!isActive || activeElements.LI || activeElements.BLOCKQUOTE}
          style={{ borderRadius: '0' }}
        />

        <IconButton
          theme={activeElements.UL ? 'solid' : 'light'}
          icon={<RiListUnordered />}
          onClick={() => {
            if (activeElements.UL) {
              removeListElement(editorRef.current);
            } else {
              convertToList(editorRef.current, 'ul');
            }

            onChange();
          }}
          disabled={
            !isActive ||
            activeElements.H1 ||
            activeElements.H2 ||
            activeElements.OL ||
            activeElements.BLOCKQUOTE
          }
          style={{ borderRadius: '0' }}
        />

        <IconButton
          theme={activeElements.OL ? 'solid' : 'light'}
          icon={<RiListOrdered />}
          onClick={() => {
            if (activeElements.OL) {
              removeListElement(editorRef.current);
            } else {
              convertToList(editorRef.current, 'ol');
            }

            onChange();
          }}
          disabled={
            !isActive ||
            activeElements.H1 ||
            activeElements.H2 ||
            activeElements.UL ||
            activeElements.BLOCKQUOTE
          }
          style={{ borderRadius: '0' }}
        />

        <IconButton
          icon={<RiIndentIncrease />}
          onClick={() => {
            indent(editorRef.current);

            onChange();
          }}
          disabled={!isActive || !activeElements.LI}
          style={{ borderRadius: '0' }}
        />

        <IconButton
          icon={<RiIndentDecrease />}
          onClick={() => {
            outdent(editorRef.current);

            onChange();
          }}
          disabled={!isActive || !activeElements.LI}
          style={{ borderRadius: '0' }}
        />

        <IconButton
          theme={activeElements.BLOCKQUOTE ? 'solid' : 'light'}
          icon={<RiDoubleQuotesL />}
          onClick={() => {
            if (activeElements.BLOCKQUOTE) {
              removeBlockquoteElement(editorRef.current);
            } else {
              convertToBlockquote(editorRef.current);
            }

            onChange();
          }}
          disabled={
            !isActive ||
            activeElements.H1 ||
            activeElements.H2 ||
            activeElements.UL ||
            activeElements.UL ||
            activeElements.OL
          }
          style={{ borderRadius: '0' }}
        />

        <Placeholder width={`calc(100% - ${5 * 32}px)`} />
      </Flex>
    );
  }
);

function toggleInlineTag(wrapperElement, tagNames) {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);

  // Function to check if a node is or is within the specified tag
  const isOrWithinTag = node => {
    while (node && node !== wrapperElement) {
      if (tagNames.includes(node.nodeName.toLowerCase())) return node;
      node = node.parentNode;
    }
    return null;
  };

  // Check if the selection is already within the specified tag
  const existingTag = isOrWithinTag(range.startContainer);

  // If there's no selection, create or move cursor into/out of the tag
  if (range.collapsed) {
    if (existingTag) {
      if (existingTag.textContent) {
        const emptyNode = addEmptyTextNodeAfter(existingTag);
        setCursorPosition(emptyNode, 1);
      } else {
        const emptyText = document.createTextNode('\u200B');
        existingTag.parentNode.replaceChild(emptyText, existingTag);
        setCursorPosition(emptyText, 1);
      }
    } else {
      // Create a new tag and place cursor inside
      const newElement = document.createElement(tagNames[0]);
      newElement.appendChild(document.createTextNode('\u200B')); // Zero-width space
      range.insertNode(newElement);
      range.selectNodeContents(newElement);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  } else {
    // Split start and end containers if they're text nodes
    if (range.startContainer.nodeType === Node.TEXT_NODE) {
      range.startContainer.splitText(range.startOffset);
      range.setStart(range.startContainer.nextSibling, 0);
    }
    if (range.endContainer.nodeType === Node.TEXT_NODE) {
      range.endContainer.splitText(range.endOffset);
    }

    let parentElement = range.commonAncestorContainer;
    if (parentElement.nodeType === Node.TEXT_NODE) {
      parentElement = parentElement.parentElement;
    }

    // Extract the contents of the range
    const fragment = range.extractContents();

    if (supportedInlineTags.includes(parentElement.nodeName)) {
      // Create a new text node with the extracted text content
      const newTextNode = document.createTextNode(fragment.textContent);

      const before = parentElement.cloneNode(false);
      const after = parentElement.cloneNode(false);

      // Move content before the selection to 'before'
      while (parentElement.firstChild && parentElement.firstChild !== range.startContainer) {
        before.appendChild(parentElement.firstChild);
      }

      // Move content after the selection to 'after'
      while (parentElement.lastChild && parentElement.lastChild !== range.endContainer) {
        after.insertBefore(parentElement.lastChild, after.firstChild);
      }

      // Insert the parts
      parentElement.parentNode.insertBefore(before, parentElement);
      parentElement.parentNode.insertBefore(newTextNode, parentElement);
      parentElement.parentNode.insertBefore(after, parentElement);

      // Remove the original parent if it's now empty
      if (!parentElement.hasChildNodes()) {
        parentElement.parentNode.removeChild(parentElement);
      }

      range.selectNode(newTextNode);
    } else {
      // Create a new element with the desired tag and set its text content
      const wrapper = document.createElement(tagNames[0]);
      wrapper.textContent = fragment.textContent;

      // Insert the wrapper
      range.insertNode(wrapper);

      // Clear the selection
      selection.removeAllRanges();
      const newRange = document.createRange();
      newRange.setStartAfter(wrapper);
      newRange.setEndAfter(wrapper);
      selection.addRange(newRange);
    }
  }

  range.collapse(false);
  wrapperElement.focus();
}

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

export function moveListItem(wrapperElement, shiftKey) {
  if (shiftKey) {
    outdent(wrapperElement);
  } else {
    indent(wrapperElement);
  }
}

function outdent(wrapperElement) {
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  let node = range.commonAncestorContainer;
  let listItem = null;

  while (node && node !== wrapperElement && !listItem) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      listItem = node.closest('li');
    }
    node = node.parentNode;
  }

  if (listItem) {
    // Save the current cursor position
    const textNode = range.startContainer;
    const offset = range.startOffset;

    // Outdent
    const parentList = listItem.parentElement;
    const grandParentListItem = parentList.parentElement;

    if (grandParentListItem) {
      if (grandParentListItem.tagName !== 'LI') {
        const p = document.createElement('p');
        p.innerHTML = listItem.innerHTML;
        listItem.replaceWith(p);
        listItem = p;

        // Move the current list item after its grandparent list item
        grandParentListItem.insertBefore(listItem, parentList.nextElementSibling);
      } else {
        const greatGrandParentList = grandParentListItem.parentElement;
        // Move the current list item after its grandparent list item
        greatGrandParentList.insertBefore(listItem, grandParentListItem.nextElementSibling);
      }

      // If the parent list becomes empty, remove it
      if (parentList.children.length === 0) {
        parentList.remove();
      }
    }

    // Restore the cursor position
    const newRange = document.createRange();
    newRange.setStart(textNode, offset);
    newRange.setEnd(textNode, offset);
    selection.removeAllRanges();
    selection.addRange(newRange);
  }
}

function indent(wrapperElement) {
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  let node = range.commonAncestorContainer;
  let listItem = null;

  while (node && node !== wrapperElement && !listItem) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      listItem = node.closest('li');
    }
    node = node.parentNode;
  }

  if (listItem) {
    // Save the current cursor position
    const textNode = range.startContainer;
    const offset = range.startOffset;

    // Indent
    const previousListItem = listItem.previousElementSibling;
    if (previousListItem) {
      let subList = previousListItem.querySelector('ul, ol');
      if (!subList) {
        subList = document.createElement(listItem.parentElement.tagName);
        previousListItem.appendChild(subList);
      }
      subList.appendChild(listItem);
    }

    // Restore the cursor position
    const newRange = document.createRange();
    newRange.setStart(textNode, offset);
    newRange.setEnd(textNode, offset);
    selection.removeAllRanges();
    selection.addRange(newRange);
  }
}

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

export const addEmptyTextNodeAfter = element => {
  const emptyText = document.createTextNode('\u00A0');
  element.parentNode.insertBefore(emptyText, element.nextSibling);

  return emptyText;
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

const Placeholder = styled.div`
  width: ${props => props.width};
  min-width: 0;
  height: 2rem;
  background-color: var(--semi-brand-3);
`;
