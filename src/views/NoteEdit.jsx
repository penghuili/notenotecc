import { IconButton } from '@radix-ui/themes';
import { RiImageAddLine, RiSendPlaneLine } from '@remixicon/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useCat } from 'usecat';
import { useParams } from 'wouter';

import { AlbumsSelector } from '../components/AlbumsSelector.jsx';
import { Camera } from '../components/Camera.jsx';
import { ImageCarousel } from '../components/ImageCarousel.jsx';
import { scrollToTop } from '../lib/scrollToTop.js';
import { useWhyDidYouUpdate } from '../lib/useWhyDidYouChange.js';
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
  const [currentSelectedKeys, setCurrentSelectedKeys] = useState('');
  const [selectedAlbumSortKeys, setSelectedAlbumSortKeys] = useState([]);
  const [newAlbumDescription, setNewAlbumDescription] = useState('');

  const [showCamera, setShowCamera] = useState(false);

  useWhyDidYouUpdate('selectedAlbumSortKeys', selectedAlbumSortKeys);

  useEffect(() => {
    scrollToTop();
  }, []);

  useEffect(() => {
    fetchNoteEffect(noteId);
  }, [noteId]);

  useEffect(() => {
    if (!noteItem) {
      return;
    }

    setImages(noteItem.images || []);
    setNote(noteItem.note || '');
    setCurrentSelectedKeys((noteItem.albumIds || []).map(a => a.albumId).join('/'));
  }, [noteItem]);

  const handleAlbumChange = useCallback(({ newAlbum, selectedKeys }) => {
    if (newAlbum !== undefined) {
      setNewAlbumDescription(newAlbum);
    }

    if (selectedKeys !== undefined) {
      setSelectedAlbumSortKeys(selectedKeys);
    }
  }, []);

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
                albumIds: selectedAlbumSortKeys,
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

        <AlbumsSelector currentSelectedKeys={currentSelectedKeys} onChange={handleAlbumChange} />
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
