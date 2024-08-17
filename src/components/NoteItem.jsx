import { Box, Flex, Text } from '@radix-ui/themes';
import React, { useCallback, useMemo } from 'react';

import { useRerenderDetector } from '../lib/useRerenderDetector.js';
import { formatDateWeekTime, getAgo } from '../shared/js/date';
import { RouteLink } from '../shared/react/my-router.jsx';
import { navigateEffect } from '../shared/react/store/sharedEffects.js';
import { ImageCarousel } from './ImageCarousel.jsx';
import { Markdown } from './MarkdownEditor/index.jsx';
import { NoteActions } from './NoteActions.jsx';
import { TextTruncate } from './TextTruncate.jsx';

export const NoteItem = React.memo(({ note, albums, showEdit = true, showFullText }) => {
  const dateTime = useMemo(() => {
    return formatDateWeekTime(note.createdAt);
  }, [note?.createdAt]);
  const ago = useMemo(() => {
    return getAgo(new Date(note.createdAt));
  }, [note?.createdAt]);

  const handleNavigate = useCallback(() => {
    navigateEffect(`/notes/${note.sortKey}?view=1`);
  }, [note.sortKey]);

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
        <Text size="2" as="p" style={{ userSelect: 'none' }}>
          {dateTime}
        </Text>

        <NoteActions note={note} showEdit={showEdit} />
      </Flex>

      {!!note.images?.length && (
        <ImageCarousel
          noteId={note.sortKey}
          encryptedPassword={note.encryptedPassword}
          images={note.images}
        />
      )}

      {!!note.note && (
        <TextTruncate showFullText={showFullText} onShowMore={handleNavigate}>
          <Markdown markdown={note.note} />
        </TextTruncate>
      )}

      {!!albums?.length && (
        <Flex wrap="wrap">
          {albums?.map(album => (
            <RouteLink key={album.sortKey} to={`/albums/${album.sortKey}`} mr="2">
              #{album.title}
            </RouteLink>
          ))}
        </Flex>
      )}

      <Text size="1" as="p" color="gray" style={{ userSelect: 'none' }}>
        {ago}
      </Text>
    </Box>
  );
});
