import { IconButton } from '@radix-ui/themes';
import { RiImageAddLine, RiSendPlaneLine } from '@remixicon/react';
import { useAtomValue } from 'jotai';
import React, { useState } from 'react';
import { useParams } from 'wouter';

import { AlbumsSelector } from '../components/AlbumsSelector';
import { Camera } from '../components/Camera';
import { ImageCarousel } from '../components/ImageCarousel';
import { formatImages } from '../lib/formatImages';
import { AreaField } from '../shared-private/react/AreaField';
import { useEffectOnce } from '../shared-private/react/hooks/useEffectOnce';
import { useListener } from '../shared-private/react/hooks/useListener';
import { ItemsWrapper } from '../shared-private/react/ItemsWrapper';
import { PageHeader } from '../shared-private/react/PageHeader';
import {
  isAddingImagesAtom,
  isLoadingNoteAtom,
  isUpdatingNoteAtom,
  useNote,
} from '../store/note/noteAtoms';
import { addImagesEffect, fetchNoteEffect, updateNoteEffect } from '../store/note/noteEffects';

export function NoteEdit() {
  const { noteId } = useParams();

  const isLoading = useAtomValue(isLoadingNoteAtom);
  const isUpdating = useAtomValue(isUpdatingNoteAtom);
  const isAddingImages = useAtomValue(isAddingImagesAtom);
  const noteItem = useNote(noteId);

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
      <PageHeader
        title="Update note"
        isLoading={isLoading || isAddingImages || isUpdating}
        fixed
        hasBack
        right={
          <IconButton
            disabled={!note || isUpdating}
            onClick={() => {
              updateNoteEffect(noteId, {
                note,
                albumDescription: newAlbumDescription || null,
                albumIds: selectedAlbumSortKeys?.length ? selectedAlbumSortKeys : null,
                goBack: false,
                onSucceeded: () => {
                  setNewAlbumDescription('');
                },
              });
            }}
            mr="2"
          >
            <RiSendPlaneLine />
          </IconButton>
        }
      />

      <IconButton my="4" onClick={() => setShowCamera(true)}>
        <RiImageAddLine />
      </IconButton>
      <ItemsWrapper>
        <AreaField value={note} onChange={setNote} />

        <AlbumsSelector
          selectedAlbumSortKeys={selectedAlbumSortKeys}
          onSelect={setSelectedAlbumSortKeys}
          newAlbum={newAlbumDescription}
          onNewAlbumChange={setNewAlbumDescription}
        />
      </ItemsWrapper>

      <ImageCarousel noteId={noteId} images={images} />

      {showCamera && (
        <Camera
          onSelect={async newImages => {
            const images = await formatImages(newImages);
            addImagesEffect(noteId, {
              images,
            });
            setShowCamera(false);
          }}
          onCancel={() => setShowCamera(false)}
        />
      )}
    </>
  );
}
