import { useAtomValue } from 'jotai';
import React, { useState } from 'react';
import { useParams } from 'wouter';

import { AlbumsSelector } from '../components/AlbumsSelector';
import { Images } from '../components/Images';
import { Padding } from '../components/Padding';
import { AreaField } from '../shared-private/react/AreaField';
import { FormButton } from '../shared-private/react/FormButton';
import { useEffectOnce } from '../shared-private/react/hooks/useEffectOnce';
import { useListener } from '../shared-private/react/hooks/useListener';
import { ItemsWrapper } from '../shared-private/react/ItemsWrapper';
import { PageHeader } from '../shared-private/react/PageHeader';
import {
  isLoadingNoteAtom,
  isUpdatingNoteAtom,
  noteAtom,
} from '../store/note/noteAtoms';
import { fetchNoteEffect, updateNoteEffect } from '../store/note/noteEffects';

export function NoteEdit() {
  const { noteId } = useParams();

  const isLoading = useAtomValue(isLoadingNoteAtom);
  const isUpdating = useAtomValue(isUpdatingNoteAtom);
  const noteItem = useAtomValue(noteAtom);

  const [images, setImages] = useState([]);
  const [note, setNote] = useState('');
  const [selectedAlbumSortKeys, setSelectedAlbumSortKeys] = useState([]);
  const [newAlbumDescription, setNewAlbumDescription] = useState('');

  useListener(noteItem, value => {
    if (!value) {
      return;
    }

    setImages(value.images || []);
    setNote(value.note || '');
    setSelectedAlbumSortKeys((value.albumIds || []).map(a => a.albumId));
  });

  useEffectOnce(() => {
    fetchNoteEffect(noteId);
  }, [noteId]);

  return (
    <>
      <Padding>
        <PageHeader title="Update note" isLoading={isLoading} hasBack />
      </Padding>

      <Images noteId={noteId} images={images} showDelete />

      <Padding>
        <ItemsWrapper>
          <AreaField label="Note" value={note} onChange={setNote} />

          <AlbumsSelector
            selectedAlbumSortKeys={selectedAlbumSortKeys}
            onSelect={setSelectedAlbumSortKeys}
            newAlbum={newAlbumDescription}
            onNewAlbumChange={setNewAlbumDescription}
          />

          <FormButton
            onClick={() => {
              updateNoteEffect(noteId, {
                note,
                albumDescription: newAlbumDescription || null,
                albumIds: selectedAlbumSortKeys?.length ? selectedAlbumSortKeys : null,
                goBack: false,
              });
            }}
            disabled={isUpdating}
          >
            Update
          </FormButton>
        </ItemsWrapper>
      </Padding>
    </>
  );
}
