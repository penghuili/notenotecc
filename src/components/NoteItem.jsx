import { Typography } from '@douyinfe/semi-ui';
import React, { useCallback, useMemo } from 'react';
import { navigateTo } from 'react-baby-router';
import fastMemo from 'react-fast-memo';

import { formatDateWeekTime, getAgo } from '../shared/js/date';
import { Flex } from '../shared/semi/Flex.jsx';
import { actionTypes, dispatchAction } from '../store/allActions.js';
import { noteCat } from '../store/note/noteCats.js';
import { AlbumItem } from './AlbumItem.jsx';
import { ImageCarousel } from './ImageCarousel.jsx';
import { Markdown } from './MarkdownEditor/Markdown.jsx';
import { NoteActions } from './NoteActions.jsx';
import { TextTruncate } from './TextTruncate.jsx';

export const NoteItem = fastMemo(({ note, albums, textLines, hasMarginBottom = true }) => {
  const dateTime = useMemo(() => {
    return formatDateWeekTime(note.createdAt);
  }, [note?.createdAt]);
  const ago = useMemo(() => {
    return getAgo(new Date(note.createdAt));
  }, [note?.createdAt]);

  const handleNavigate = useCallback(() => {
    noteCat.set(note);
    navigateTo(`/notes/details?noteId=${note.sortKey}`);
  }, [note]);

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
      <Flex direction="row" wrap="wrap">
        {albums?.map(album => (
          <AlbumItem
            key={album.sortKey}
            album={album}
            to={`/albums/details?albumId=${album.sortKey}`}
          />
        ))}
      </Flex>
    );
  }, [albums]);

  const agoElement = useMemo(() => {
    return (
      <Typography.Paragraph size="small" type="secondary" style={{ userSelect: 'none' }}>
        {ago}
      </Typography.Paragraph>
    );
  }, [ago]);

  return (
    <div
      style={{
        marginBottom: hasMarginBottom ? '3rem' : '0',
        width: '100%',
      }}
    >
      <Flex direction="row" justify="between" align="center" m="0 0 0.5rem">
        <Typography.Paragraph size="small" style={{ userSelect: 'none' }}>
          {dateTime}
        </Typography.Paragraph>

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
        <TextTruncate
          showFullText={false}
          maxLines={note.images?.length ? textLines : 8}
          onClick={handleNavigate}
        >
          <Markdown markdown={note.note} />
        </TextTruncate>
      )}

      {albumsElement}

      {agoElement}
    </div>
  );
});
