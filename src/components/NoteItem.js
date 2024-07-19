import { Box, Flex, Text } from '@radix-ui/themes';
import React from 'react';
import styled from 'styled-components';

import { formatDateWeekTime } from '../shared-private/js/date';
import { RouteLink } from '../shared-private/react/RouteLink';
import { ImageCarousel } from './ImageCarousel';
import { NoteActions } from './NoteActions';

const Description = styled.pre`
  margin: 0;
  padding: 0;
  white-space: pre-wrap;
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
