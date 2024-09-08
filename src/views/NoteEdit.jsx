import { Flex, Text } from '@radix-ui/themes';
import React, { useCallback, useMemo } from 'react';
import { replaceTo } from 'react-baby-router';
import fastMemo from 'react-fast-memo';
import { createCat, useCat } from 'usecat';

import { albumSelectedKeysCat, AlbumsSelector } from '../components/AlbumsSelector.jsx';
import { ImageCarousel } from '../components/ImageCarousel.jsx';
import { MarkdownEditor } from '../components/MarkdownEditor/index.jsx';
import { NoteActions } from '../components/NoteActions.jsx';
import { PrepareData } from '../components/PrepareData.jsx';
import { debounceAndQueue } from '../lib/debounce.js';
import { formatDateWeekTime } from '../shared/js/date.js';
import { PageHeader } from '../shared/react/PageHeader.jsx';
import { useScrollToTop } from '../shared/react/ScrollToTop.jsx';
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
let deletedNoteKey;

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

  useScrollToTop();

  // useEffect(() => {
  //   deletedNoteKey = null;

  //   return () => {
  //     if (!add) {
  //       return;
  //     }

  //     const newNote = noteCat.get();
  //     if (newNote && !descriptionCat.get() && !newNote.images?.length) {
  //       dispatchAction({
  //         type: actionTypes.DELETE_NOTE,
  //         payload: { ...newNote, goBack: false },
  //       });
  //       deletedNoteKey = newNote.sortKey;
  //     }
  //   };
  // }, [add]);

  return (
    <PrepareData load={prepareData}>
      <Header noteId={noteId} />

      <NoteView noteId={noteId} isAddingNote={!!add} />
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

  const rightElement = useMemo(() => !!noteItem && <NoteActions note={noteItem} />, [noteItem]);

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
      <Flex justify="between" align="center" mb="2">
        <Text size="2" as="p" style={{ userSelect: 'none' }}>
          {formatDateWeekTime(noteItem.createdAt)}
        </Text>
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
  if (deletedNoteKey && newNote?.sortKey === deletedNoteKey) {
    return;
  }

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

  return <AlbumsSelector onChange={handleChange} mt="4" />;
});
