import { Badge, Box, Flex, Text } from '@radix-ui/themes';
import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';

import { formatDateWeekTime, getAgo } from '../shared/js/date';
import { navigateEffect } from '../shared/react/store/sharedEffects.js';
import { ImageCarousel } from './ImageCarousel.jsx';
import { Markdown } from './MarkdownEditor/index.jsx';
import { NoteActions } from './NoteActions.jsx';
import { TextTruncate } from './TextTruncate.jsx';

export const NoteItem = React.memo(({ note, albums, showFullText, onEdit, onAlbum }) => {
  const dateTime = useMemo(() => {
    return formatDateWeekTime(note.createdAt);
  }, [note?.createdAt]);
  const ago = useMemo(() => {
    return getAgo(new Date(note.createdAt));
  }, [note?.createdAt]);

  const handleNavigate = useCallback(() => {
    navigateEffect(`/notes/${note.sortKey}`);
  }, [note.sortKey]);

  return (
    <Box mb="8">
      <Flex justify="between" align="center" mb="2">
        <Text size="2" as="p" style={{ userSelect: 'none' }}>
          {dateTime}
        </Text>

        <NoteActions
          note={note}
          onEdit={onEdit}
          goBackAfterDelete={showFullText}
          onUpdateAlbums={onAlbum}
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
        <TextTruncate showFullText={showFullText} onShowMore={handleNavigate}>
          <Markdown markdown={note.note} />
        </TextTruncate>
      ) : (
        !!onAlbum && <AddNotePlaceholder onClick={onEdit} />
      )}

      {(!!albums?.length || !!onAlbum) && (
        <Flex wrap="wrap" my="2">
          {albums?.map(album => (
            <BadgeStyled
              key={album.sortKey}
              onClick={() => {
                if (onAlbum) {
                  onAlbum(album);
                } else {
                  navigateEffect(`/albums/${album.sortKey}`);
                }
              }}
              mr="2"
            >
              #{album.title}
            </BadgeStyled>
          ))}
          {!!onAlbum && (
            <BadgeStyled
              onClick={() => {
                if (onAlbum) {
                  onAlbum();
                }
              }}
              mr="2"
              color="orange"
            >
              + Add tag
            </BadgeStyled>
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
  color: var(--gray-5);
  cursor: pointer;
`;
