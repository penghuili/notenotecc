import { Badge, Box, Flex, Text } from '@radix-ui/themes';
import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { useCat } from 'usecat';

import { formatDateWeekTime, getAgo } from '../shared/js/date';
import { currentPathCat, navigate } from '../shared/react/my-router.jsx';
import { navigateEffect } from '../shared/react/store/sharedEffects.js';
import { noteCat } from '../store/note/noteCats.js';
import { AlbumItem } from './AlbumItem.jsx';
import { ImageCarousel } from './ImageCarousel.jsx';
import { Markdown } from './MarkdownEditor/Markdown.jsx';
import { NoteActions } from './NoteActions.jsx';
import { TextTruncate } from './TextTruncate.jsx';

const addAlbumData = {
  sortKey: 'add-album',
  title: '+ Add tag',
};

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
    navigateEffect(`/notes/${note.sortKey}`);
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

  const handleUpdateAlbums = useCallback(() => {
    const currentPath = currentPathCat.get();
    if (currentPath !== `/notes/${note.sortKey}`) {
      noteCat.set(note);
      navigate(`/notes/${note.sortKey}`);
    }

    navigate(`/notes/${note.sortKey}?albums=1`);
  }, [note]);

  return (
    <Box mb="8">
      <Flex justify="between" align="center" mb="2">
        <Text size="2" as="p" style={{ userSelect: 'none' }}>
          {dateTime}
        </Text>

        <NoteActions
          note={note}
          goBackAfterDelete={isDetailsPage}
          onEdit={handleEidt}
          onUpdateAlbums={handleUpdateAlbums}
        />
      </Flex>
      {!!note.images?.length && (
        <ImageCarousel
          noteId={note.sortKey}
          encryptedPassword={note.encryptedPassword}
          images={note.images}
        />
      )}
      {note.note ? (
        <TextTruncate showFullText={isDetailsPage} onShowMore={handleNavigate}>
          <Markdown markdown={note.note} />
        </TextTruncate>
      ) : (
        !!isDetailsPage && <AddNotePlaceholder onClick={handleEidt} />
      )}

      {(!!albums?.length || !!isDetailsPage) && (
        <Flex wrap="wrap">
          {albums?.map(album => (
            <AlbumItem
              key={album.sortKey}
              album={album}
              to={isDetailsPage ? `/notes/${note.sortKey}?albums=1` : `/albums/${album.sortKey}`}
            />
          ))}
          {!!isDetailsPage && (
            <AlbumItem
              key={addAlbumData.sortKey}
              album={addAlbumData}
              to={`/notes/${note.sortKey}?albums=1`}
              color="orange"
            />
          )}
        </Flex>
      )}

      <Text size="1" as="p" color="gray" style={{ userSelect: 'none' }}>
        {ago}
      </Text>
    </Box>
  );
});

export const BadgeStyled = styled(Badge)`
  cursor: pointer;
`;

const AddNotePlaceholder = React.memo(({ onClick }) => {
  return <Placeholder onClick={onClick}>Add note ...</Placeholder>;
});
const Placeholder = styled.div`
  width: 100%;
  height: 3rem;
  padding-top: 0.5rem;
  color: var(--gray-7);
  cursor: pointer;
`;
