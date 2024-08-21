import { Box, Flex, Text } from '@radix-ui/themes';
import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { useCat } from 'usecat';

import { formatDateWeekTime, getAgo } from '../shared/js/date';
import { currentPathCat, navigate } from '../shared/react/my-router.jsx';
import { noteCat } from '../store/note/noteCats.js';
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
  const currentPath = useCat(currentPathCat);
  const isDetailsPage = useMemo(() => {
    return currentPath === `/notes/${note.sortKey}`;
  }, [currentPath, note.sortKey]);

  const handleNavigate = useCallback(() => {
    navigate(`/notes/${note.sortKey}`);
  }, [note.sortKey]);

  const handleEidt = useCallback(
    e => {
      e.stopPropagation();

      const currentPath = currentPathCat.get();
      if (currentPath !== `/notes/${note.sortKey}`) {
        noteCat.set(note);
        navigate(`/notes/${note.sortKey}`);
      }

      navigate(`/notes/${note.sortKey}?editor=1`);
    },
    [note]
  );

  const albumsElement = useMemo(() => {
    if (isDetailsPage || !albums?.length) {
      return null;
    }

    return (
      <Flex wrap="wrap">
        {albums?.map(album => (
          <AlbumItem key={album.sortKey} album={album} to={`/albums/${album.sortKey}`} />
        ))}
      </Flex>
    );
  }, [albums, isDetailsPage]);

  const agoElement = useMemo(() => {
    if (isDetailsPage) {
      return null;
    }

    return (
      <Text size="1" as="p" color="gray" style={{ userSelect: 'none' }}>
        {ago}
      </Text>
    );
  }, [ago, isDetailsPage]);

  return (
    <Box mb="8">
      <Flex justify="between" align="center" mb="2">
        <Text size="2" as="p" style={{ userSelect: 'none' }}>
          {dateTime}
        </Text>

        <NoteActions note={note} goBackAfterDelete={isDetailsPage} onEdit={handleEidt} />
      </Flex>
      {!!note.images?.length && (
        <ImageCarousel
          noteId={note.sortKey}
          encryptedPassword={note.encryptedPassword}
          images={note.images}
        />
      )}
      {note.note ? (
        <TextTruncate showFullText={isDetailsPage} onClick={handleNavigate}>
          <Markdown markdown={note.note} />
        </TextTruncate>
      ) : (
        !!isDetailsPage && <AddNotePlaceholder onClick={handleEidt} />
      )}

      {albumsElement}

      {agoElement}
    </Box>
  );
});

export const AddNotePlaceholder = React.memo(({ onClick }) => {
  return <Placeholder onClick={onClick}>Add note ...</Placeholder>;
});
const Placeholder = styled.div`
  width: 100%;
  height: 3rem;
  padding-top: 0.5rem;
  color: var(--gray-7);
  cursor: pointer;
`;
