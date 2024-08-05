import { Box, Flex, Text } from '@radix-ui/themes';
import React, { useMemo } from 'react';
import styled from 'styled-components';

import { useRerenderDetector } from '../lib/useRerenderDetector.js';
import { formatDateWeekTime, getAgo } from '../shared-private/js/date';
import { RouteLink } from '../shared-private/react/RouteLink.jsx';
import { ImageCarousel } from './ImageCarousel.jsx';
import { NoteActions } from './NoteActions.jsx';

const Description = styled.pre`
  margin: 0;
  padding: 0;
  white-space: pre-wrap;
  font-family: var(--default-font-family);
`;

export const NoteItem = React.memo(({ note, albums }) => {
  const dateTime = useMemo(() => {
    const dt = formatDateWeekTime(note.createdAt);
    const ago = getAgo(new Date(note.createdAt));
    return `${dt}, ${ago}`;
  }, [note?.createdAt]);

  useRerenderDetector(
    'NoteItem',
    {
      note,
      albums,
      dateTime,
    },
    data => data?.sortKey === 'note_20240805065109_p2nIT3yUr31'
  );

  return (
    <Box mb="8">
      <Flex justify="between" align="center" mb="2">
        <Text size="2" as="p">
          {dateTime}
        </Text>

        <NoteActions note={note} />
      </Flex>

      {!!note.images?.length && (
        <ImageCarousel
          noteId={note.sortKey}
          encryptedPassword={note.encryptedPassword}
          images={note.images}
        />
      )}

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
});
