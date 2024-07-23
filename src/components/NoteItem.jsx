import { Box, Flex, Text } from '@radix-ui/themes';
import React from 'react';
import styled from 'styled-components';

import { formatDateWeekTime } from '../shared-private/js/date';
import { RouteLink } from '../shared-private/react/RouteLink.jsx';
import { ImageCarousel } from './ImageCarousel.jsx';
import { NoteActions } from './NoteActions.jsx';

const Description = styled.pre`
  margin: 0;
  padding: 0;
  white-space: pre-wrap;
  font-family: var(--default-font-family);
`;

export function NoteItem({ note, albums }) {
  return (
    <Box mb="8">
      <Flex justify="between" align="center" mb="2">
        <Text size="1" as="p">
          {formatDateWeekTime(note.createdAt)}
        </Text>

        <NoteActions note={note} />
      </Flex>

      <ImageCarousel noteId={note.sortKey} images={note.images} />

      {!!note.note && <Description>{note.note}</Description>}

      {!!albums?.length && (
        <Flex wrap="wrap">
          {albums?.map(album => (
            <RouteLink key={album.sortKey} to={`/albums/${album.sortKey}`} mr="3">
              #{album.title}
            </RouteLink>
          ))}
        </Flex>
      )}
    </Box>
  );
}
