import { Box } from '@radix-ui/themes';
import { useAtomValue } from 'jotai';
import React, { useState } from 'react';

import { AlbumsSelector } from '../components/AlbumsSelector';
import { Camera } from '../components/Camera';
import { Images } from '../components/Images';
import { Padding } from '../components/Padding';
import { AreaField } from '../shared-private/react/AreaField';
import { FormButton } from '../shared-private/react/FormButton';
import { ItemsWrapper } from '../shared-private/react/ItemsWrapper';
import { RouteLink } from '../shared-private/react/RouteLink';
import { isCreatingNoteAtom } from '../store/note/noteAtoms';
import { createNoteEffect } from '../store/note/noteEffects';

export function NoteAdd() {
  const isCreating = useAtomValue(isCreatingNoteAtom);
  const [images, setImages] = useState([]);
  const [note, setNote] = useState('');
  const [selectedAlbumSortKeys, setSelectedAlbumSortKeys] = useState([]);
  const [newAlbumDescription, setNewAlbumDescription] = useState('');

  return (
    <>
      {/* {isAndroidPhone() ? (
        <Camera
          onSelect={image => {
            setImages([...images, image]);
          }}
        />
      ) : (
        <Padding>
          <Flex pt="4">
            <ImagePicker
              onSelect={image => {
                setImages([...images, image]);
              }}
            />
          </Flex>
        </Padding>
      )} */}

      <Camera
        onSelect={image => {
          setImages([...images, image]);
        }}
      />

      <Box mt="6">
        <Images images={images} />
      </Box>

      <Padding>
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
              createNoteEffect({
                note,
                canvases: images.map(i => i.canvas),
                albumDescription: newAlbumDescription || undefined,
                albumIds: selectedAlbumSortKeys?.length ? selectedAlbumSortKeys : undefined,
                goBack: false,
                onSucceeded: () => {
                  setImages([]);
                },
              });
            }}
            disabled={!images?.length || isCreating}
          >
            Create
          </FormButton>
        </ItemsWrapper>

        <RouteLink to="/notes">Notes</RouteLink>
      </Padding>
    </>
  );
}
