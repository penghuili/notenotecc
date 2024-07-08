import { Box } from '@radix-ui/themes';
import { IconButton } from '@radix-ui/themes/dist/cjs/index.js';
import { RiImageLine } from '@remixicon/react';
import { useAtomValue } from 'jotai';
import React, { useState } from 'react';

import { AlbumsSelector } from '../components/AlbumsSelector';
import { Camera } from '../components/Camera';
import { ImageCarousel } from '../components/ImageCarousel';
import { Padding } from '../components/Padding';
import { AreaField } from '../shared-private/react/AreaField';
import { FormButton } from '../shared-private/react/FormButton';
import { ItemsWrapper } from '../shared-private/react/ItemsWrapper';
import { PageHeader } from '../shared-private/react/PageHeader';
import { navigateEffect } from '../shared-private/react/store/sharedEffects';
import { isCreatingNoteAtom } from '../store/note/noteAtoms';
import { createNoteEffect } from '../store/note/noteEffects';

export function NoteAdd() {
  const isCreating = useAtomValue(isCreatingNoteAtom);
  const [images, setImages] = useState([]);
  const [note, setNote] = useState('');
  const [selectedAlbumSortKeys, setSelectedAlbumSortKeys] = useState([]);
  const [newAlbumDescription, setNewAlbumDescription] = useState('');

  const [showCamera, setShowCamera] = useState(true);

  return (
    <>
      <Padding>
        <PageHeader title="Update note" isLoading={isCreating} hasBack />
      </Padding>

      {!!images?.length && (
        <Box mb="2">
          <ImageCarousel
            images={images}
            onDeleteLocal={image => setImages(images.filter(i => i.url !== image.url))}
          />
        </Box>
      )}

      <Padding>
        <ItemsWrapper>
          <IconButton size="4" onClick={() => setShowCamera(true)}>
            <RiImageLine />
          </IconButton>
          <AreaField value={note} onChange={setNote} />

          <AlbumsSelector
            selectedAlbumSortKeys={selectedAlbumSortKeys}
            onSelect={setSelectedAlbumSortKeys}
            newAlbum={newAlbumDescription}
            onNewAlbumChange={setNewAlbumDescription}
          />

          <FormButton
            onClick={() => {
              createNoteEffect({
                note,
                canvases: images.map(i => i.canvas),
                albumDescription: newAlbumDescription || undefined,
                albumIds: selectedAlbumSortKeys?.length ? selectedAlbumSortKeys : undefined,
                goBack: false,
                onSucceeded: () => {
                  setImages([]);
                  setNote('');
                  setSelectedAlbumSortKeys([]);
                  setNewAlbumDescription('');
                  navigateEffect('/notes');
                },
              });
            }}
            disabled={!images?.length || isCreating}
          >
            Create
          </FormButton>
        </ItemsWrapper>
      </Padding>

      {showCamera && (
        <Camera
          onSelect={newImages => {
            setImages([...images, ...newImages]);
            setShowCamera(false);
          }}
          onClose={() => setShowCamera(false)}
        />
      )}
    </>
  );
}
