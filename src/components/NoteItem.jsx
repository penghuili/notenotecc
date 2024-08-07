import { Box, Flex, Text } from '@radix-ui/themes';
import React, { useMemo } from 'react';

import { useRerenderDetector } from '../lib/useRerenderDetector.js';
import { formatDateWeekTime, getAgo } from '../shared-private/js/date';
import { RouteLink } from '../shared-private/react/my-router.jsx';
import { ImageCarousel } from './ImageCarousel.jsx';
import { MarkdownEditor } from './MarkdownEditor/index.jsx';
import { NoteActions } from './NoteActions.jsx';

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

      {!!note.note && <MarkdownEditor defaultValue={note.note} readOnly />}

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
