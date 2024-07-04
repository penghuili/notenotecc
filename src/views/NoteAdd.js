import { useAtomValue } from 'jotai';
import React, { useState } from 'react';

import { AlbumsSelector } from '../components/AlbumsSelector';
import { Camera } from '../components/Camera';
import { ImagePicker } from '../components/ImagePicker';
import { Images } from '../components/Images';
import { isAndroidPhone } from '../components/isAndroid';
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
      {isAndroidPhone() ? (
        <Camera
          onSelect={image => {
            setImages([...images, image]);
          }}
        />
      ) : (
        <ImagePicker
          onSelect={image => {
            setImages([...images, image]);
          }}
        />
      )}

      <Images images={images} />

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
