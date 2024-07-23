import { IconButton } from '@radix-ui/themes';
import { RiImageAddLine, RiSendPlaneLine } from '@remixicon/react';
import { useAtomValue } from 'jotai';
import React, { useEffect, useState } from 'react';
import { useParams } from 'wouter';

import { AlbumsSelector } from '../components/AlbumsSelector.jsx';
import { Camera } from '../components/Camera.jsx';
import { ImageCarousel } from '../components/ImageCarousel.jsx';
import { formatImages } from '../lib/formatImages';
import { AreaField } from '../shared-private/react/AreaField.jsx';
import { ItemsWrapper } from '../shared-private/react/ItemsWrapper.jsx';
import { PageHeader } from '../shared-private/react/PageHeader.jsx';
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

  useEffect(() => {
    if (!noteItem) {
      return;
    }

    setImages(noteItem.images || []);
    setNote(noteItem.note || '');
    setSelectedAlbumSortKeys((noteItem.albumIds || []).map(a => a.albumId));
  }, [noteItem]);

  useEffect(() => {
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
