import { Box, Flex, Text } from '@radix-ui/themes';
import React, { useCallback, useMemo } from 'react';

import { formatDateWeekTime, getAgo } from '../shared/js/date';
import { navigate } from '../shared/react/my-router.jsx';
import { actionTypes, dispatchAction } from '../store/allActions.js';
import { AlbumItem } from './AlbumItem.jsx';
import { ImageCarousel } from './ImageCarousel.jsx';
import { Markdown } from './MarkdownEditor/Markdown.jsx';
import { NoteActions } from './NoteActions.jsx';
import { TextTruncate } from './TextTruncate.jsx';

export const NoteItem = React.memo(({ note, albums }) => {
  const dateTime = useMemo(() => {
    return formatDateWeekTime(note.createdAt);
  }, [note?.createdAt]);
  const ago = useMemo(() => {
    return getAgo(new Date(note.createdAt));
  }, [note?.createdAt]);

  const handleNavigate = useCallback(() => {
    navigate(`/notes/${note.sortKey}`);
  }, [note.sortKey]);

  const handleDeleteImage = useCallback(
    imagePath => {
      dispatchAction({
        type: actionTypes.DELETE_IMAGE,
        payload: { ...note, imagePath },
      });
    },
    [note]
  );

  const albumsElement = useMemo(() => {
    if (!albums?.length) {
      return null;
    }

    return (
      <Flex wrap="wrap">
        {albums?.map(album => (
          <AlbumItem key={album.sortKey} album={album} to={`/albums/${album.sortKey}`} />
        ))}
      </Flex>
    );
  }, [albums]);

  const agoElement = useMemo(() => {
    return (
      <Text size="1" as="p" color="gray" style={{ userSelect: 'none' }}>
        {ago}
      </Text>
    );
  }, [ago]);

  return (
    <Box mb="8">
      <Flex justify="between" align="center" mb="2">
        <Text size="2" as="p" style={{ userSelect: 'none' }}>
          {dateTime}
        </Text>

        <NoteActions note={note} />
      </Flex>
      {!!note.images?.length && (
        <ImageCarousel
          noteId={note.sortKey}
          encryptedPassword={note.encryptedPassword}
          images={note.images}
          onDelete={handleDeleteImage}
        />
      )}
      {!!note.note && (
        <TextTruncate showFullText={false} onClick={handleNavigate}>
          <Markdown markdown={note.note} />
        </TextTruncate>
      )}

      {albumsElement}

      {agoElement}
    </Box>
  );
});
