import { IconButton } from '@radix-ui/themes';
import { RiAddLine } from '@remixicon/react';
import { useAtomValue } from 'jotai';
import React, { useState } from 'react';
import { useParams } from 'wouter';

import { AlbumsSelector } from '../components/AlbumsSelector';
import { Camera } from '../components/Camera';
import { ImageCarousel } from '../components/ImageCarousel';
import { Padding } from '../components/Padding';
import { AreaField } from '../shared-private/react/AreaField';
import { FormButton } from '../shared-private/react/FormButton';
import { useEffectOnce } from '../shared-private/react/hooks/useEffectOnce';
import { useListener } from '../shared-private/react/hooks/useListener';
import { ItemsWrapper } from '../shared-private/react/ItemsWrapper';
import { PageHeader } from '../shared-private/react/PageHeader';
import {
  isAddingImagesAtom,
  isLoadingNoteAtom,
  isUpdatingNoteAtom,
  noteAtom,
} from '../store/note/noteAtoms';
import {
  addImagesEffect,
  fetchNoteEffect,
  updateNoteEffect,
} from '../store/note/noteEffects';

export function NoteEdit() {
  const { noteId } = useParams();

  const isLoading = useAtomValue(isLoadingNoteAtom);
  const isUpdating = useAtomValue(isUpdatingNoteAtom);
  const isAddingImages = useAtomValue(isAddingImagesAtom);
  const noteItem = useAtomValue(noteAtom);

  const [images, setImages] = useState([]);
  const [note, setNote] = useState('');
  const [selectedAlbumSortKeys, setSelectedAlbumSortKeys] = useState([]);
  const [newAlbumDescription, setNewAlbumDescription] = useState('');

  const [showCamera, setShowCamera] = useState(false);

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
        <PageHeader
          title="Update note"
          isLoading={isLoading || isAddingImages || isUpdating}
          hasBack
        />
      </Padding>

      <ImageCarousel images={images} />

      <Padding>
        <IconButton my="4" onClick={() => setShowCamera(true)}>
          <RiAddLine />
        </IconButton>
        <ItemsWrapper>
          <AreaField value={note} onChange={setNote} />

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

      {showCamera && (
        <Camera
          onSelect={newImages => {
            addImagesEffect(noteId, {
              canvases: newImages.map(i => i.canvas),
            });
            setShowCamera(false);
          }}
          onCancel={() => setShowCamera(false)}
        />
      )}
    </>
  );
}
