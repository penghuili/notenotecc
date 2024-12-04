import { Typography } from '@douyinfe/semi-ui';
import React, { useCallback, useMemo } from 'react';
import { replaceTo } from 'react-baby-router';
import fastMemo from 'react-fast-memo';
import { createCat, useCat } from 'usecat';

import { albumSelectedKeysCat, AlbumsSelector } from '../components/AlbumsSelector.jsx';
import { ImageCarousel } from '../components/ImageCarousel.jsx';
import { MarkdownEditor } from '../components/MarkdownEditor/index.jsx';
import { NoteActions } from '../components/NoteActions.jsx';
import { debounceAndQueue } from '../lib/debounce.js';
import { PageContent } from '../shared/browser/PageContent.jsx';
import { formatDateWeekTime } from '../shared/js/date.js';
import { Flex } from '../shared/semi/Flex.jsx';
import { PageHeader } from '../shared/semi/PageHeader.jsx';
import { PrepareData } from '../shared/semi/PrepareData.jsx';
import { actionTypes, dispatchAction } from '../store/allActions.js';
import {
  isAddingImagesCat,
  isCreatingNoteCat,
  isDeletingImageCat,
  isDeletingNoteCat,
  isUpdatingNoteCat,
  noteCat,
  useNote,
} from '../store/note/noteCats.js';
import { fetchNoteEffect } from '../store/note/noteEffects';

const descriptionCat = createCat('');

export const NoteEdit = fastMemo(({ queryParams: { noteId, add } }) => {
  const prepareData = useCallback(async () => {
    if (noteId) {
      await fetchNoteEffect(noteId);

      const note = noteCat.get();
      if (note) {
        descriptionCat.set(note.note || '');
        albumSelectedKeysCat.set(note.albumIds || []);

        return;
      }
      replaceTo('/');
    }
  }, [noteId]);

  return (
    <PrepareData load={prepareData}>
      <PageContent>
        <Header noteId={noteId} />

        <NoteView noteId={noteId} isAddingNote={!!add} />
      </PageContent>
    </PrepareData>
  );
});

const Header = fastMemo(({ noteId }) => {
  const isCreating = useCat(isCreatingNoteCat);
  const isUpdating = useCat(isUpdatingNoteCat);
  const isDeleting = useCat(isDeletingNoteCat);
  const isAddingImages = useCat(isAddingImagesCat);
  const isDeletingImage = useCat(isDeletingImageCat);
  const noteItem = useNote(noteId);

  const rightElement = useMemo(
    () => !!noteItem && <NoteActions note={noteItem} isDetailsPage />,
    [noteItem]
  );

  return (
    <PageHeader
      title="Note"
      isLoading={isAddingImages || isUpdating || isDeleting || isDeletingImage || isCreating}
      fixed
      hasBack
      right={rightElement}
    />
  );
});

const NoteView = fastMemo(({ noteId, isAddingNote }) => {
  const noteItem = useNote(noteId);

  const handleDeleteImage = useCallback(
    imagePath => {
      dispatchAction({
        type: actionTypes.DELETE_IMAGE,
        payload: { ...noteItem, imagePath },
      });
    },
    [noteItem]
  );

  if (!noteItem) {
    return null;
  }

  return (
    <>
      <Flex direction="row" justify="between" align="center" m="0 0 0.5rem">
        <Typography.Paragraph size="small" style={{ userSelect: 'none' }}>
          {formatDateWeekTime(noteItem.createdAt)}
        </Typography.Paragraph>
      </Flex>
      {!!noteItem.images?.length && (
        <ImageCarousel
          noteId={noteItem.sortKey}
          encryptedPassword={noteItem.encryptedPassword}
          images={noteItem.images}
          onDelete={handleDeleteImage}
        />
      )}
      <Editor noteId={noteId} autoFocus={isAddingNote} />

      <AddAlbums noteId={noteId} />
    </>
  );
});

const saveDescription = async newNote => {
  dispatchAction({
    type: actionTypes.UPDATE_NOTE,
    payload: newNote,
  });
};
const debouncedSaveDescription = debounceAndQueue(saveDescription, 500);

const Editor = fastMemo(({ noteId, autoFocus }) => {
  const noteItem = useNote(noteId);
  const description = useCat(descriptionCat);

  const handleChange = useCallback(
    newDescription => {
      descriptionCat.set(newDescription);

      debouncedSaveDescription({
        ...noteItem,
        note: newDescription,
      });
    },
    [noteItem]
  );

  return <MarkdownEditor autoFocus={autoFocus} defaultText={description} onChange={handleChange} />;
});

const AddAlbums = fastMemo(({ noteId }) => {
  const noteItem = useNote(noteId);

  const handleChange = useCallback(
    async albumIds => {
      dispatchAction({
        type: actionTypes.UPDATE_NOTE,
        payload: {
          ...noteItem,
          albumIds,
        },
      });
    },
    [noteItem]
  );

  return <AlbumsSelector onChange={handleChange} />;
});
