import { IconButton } from '@radix-ui/themes';
import { RiImageAddLine, RiSendPlaneLine } from '@remixicon/react';
import React, { useEffect, useState } from 'react';
import { useCat } from 'usecat';
import { useParams } from 'wouter';

import { AlbumsSelector } from '../components/AlbumsSelector.jsx';
import { Camera } from '../components/Camera.jsx';
import { ImageCarousel } from '../components/ImageCarousel.jsx';
import { scrollToTop } from '../lib/scrollToTop.js';
import { AreaField } from '../shared-private/react/AreaField.jsx';
import { ItemsWrapper } from '../shared-private/react/ItemsWrapper.jsx';
import { PageHeader } from '../shared-private/react/PageHeader.jsx';
import {
  isAddingImagesCat,
  isLoadingNoteCat,
  isUpdatingNoteCat,
  useNote,
} from '../store/note/noteCats.js';
import { addImagesEffect, fetchNoteEffect, updateNoteEffect } from '../store/note/noteEffects';

export function NoteEdit() {
  const { noteId } = useParams();

  const isLoading = useCat(isLoadingNoteCat);
  const isUpdating = useCat(isUpdatingNoteCat);
  const isAddingImages = useCat(isAddingImagesCat);
  const noteItem = useNote(noteId);

  const [images, setImages] = useState([]);
  const [note, setNote] = useState('');
  const [selectedAlbumSortKeys, setSelectedAlbumSortKeys] = useState([]);
  const [newAlbumDescription, setNewAlbumDescription] = useState('');

  const [showCamera, setShowCamera] = useState(false);

  useEffect(() => {
    scrollToTop();
  }, []);

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
            disabled={(!images?.length && !note) || isUpdating}
            onClick={() => {
              updateNoteEffect(noteId, {
                encryptedPassword: noteItem?.encryptedPassword,
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
        <AreaField autofocus value={note} onChange={setNote} />

        <AlbumsSelector
          selectedAlbumSortKeys={selectedAlbumSortKeys}
          onSelect={setSelectedAlbumSortKeys}
          newAlbum={newAlbumDescription}
          onNewAlbumChange={setNewAlbumDescription}
        />
      </ItemsWrapper>

      <ImageCarousel
        noteId={noteId}
        encryptedPassword={noteItem?.encryptedPassword}
        images={images}
      />

      {showCamera && (
        <Camera
          onSelect={async newImages => {
            addImagesEffect(noteId, {
              encryptedPassword: noteItem.encryptedPassword,
              images: newImages,
            });
            setShowCamera(false);
          }}
          onCancel={() => setShowCamera(false)}
        />
      )}
    </>
  );
}
