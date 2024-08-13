import { RiDraggable } from '@remixicon/react';
import React from 'react';
import { arrayMove, List } from 'react-movable';
import styled from 'styled-components';

import { calculateItemPosition } from '../shared-private/js/position';

export const Reorder = React.memo(({ items, onReorder, reverse }) => {
  return (
    <List
      values={items}
      onChange={({ oldIndex, newIndex }) => {
        const newItems = arrayMove(items, oldIndex, newIndex);
        onReorder(newItems);

        const newPosition = calculateItemPosition(newItems, newIndex - 1, newIndex + 1, reverse);
        onReorder({
          itemId: items[oldIndex]?.sortKey,
          newPosition,
          newItems,
        });
      }}
      renderList={({ children, props, isDragged }) => (
        <ListWrapper {...props} isDragged={isDragged}>
          {children}
        </ListWrapper>
      )}
      renderItem={({ value, props, isDragged, isSelected }) => (
        <ItemWrapper
          {...props}
          key={value.sortKey}
          style={props.style}
          isDragged={isDragged}
          isSelected={isSelected}
        >
          <IconWrapper data-movable-handle isdragged={isDragged ? '1' : ''} />
          <TextWrapper>{value.title}</TextWrapper>
        </ItemWrapper>
      )}
      lockVertically
    />
  );
});

const ListWrapper = styled.ul`
  padding: 0;
  cursor: ${props => (props.isDragged ? 'grabbing' : 'inherit')};
`;
const ItemWrapper = styled.li`
  padding: 0.5rem;
  margin: 0 0 0.5em 0;
  list-style-type: none;

  border: 2px solid #ccc;
  color: #333;
  border-radius: 5px;
  background-color: ${props => (props.isDragged || props.isSelected ? '#EEE' : '#FFF')};
  display: flex;
  align-items: center;
`;
const IconWrapper = styled(RiDraggable)`
  cursor: ${props => (props.isdragged ? 'grabbing' : 'grab')};
`;
const TextWrapper = styled.span`
  margin-left: 8px;
  display: inline-flex;
  align-items: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI (Custom)', Roboto, 'Helvetica Neue',
    'Open Sans (Custom)', system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji';
  line-height: 24px;
`;
