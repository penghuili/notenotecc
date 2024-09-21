import { Button, DropdownMenu, IconButton, Text } from '@radix-ui/themes';
import { RiDeleteBinLine, RiMore2Line, RiPencilLine } from '@remixicon/react';
import React, { useCallback, useMemo, useState } from 'react';
import { navigateTo } from 'react-baby-router';
import fastMemo from 'react-fast-memo';
import { useCat } from 'usecat';

import { PrepareData } from '../components/PrepareData.jsx';
import { useInView } from '../shared/browser/hooks/useInView.js';
import { errorColor } from '../shared/radix/AppWrapper.jsx';
import { Confirm } from '../shared/radix/Confirm.jsx';
import { PageEmpty } from '../shared/radix/PageEmpty.jsx';
import { PageHeader } from '../shared/radix/PageHeader.jsx';
import { isDeletingAlbumCat, useAlbum } from '../store/album/albumCats.js';
import { isLoadingAlbumItemsCat, useAlbumNotes } from '../store/album/albumItemCats.js';
import { fetchAlbumItemsEffect } from '../store/album/albumItemEffects';
import { actionTypes, dispatchAction } from '../store/allActions.js';
import { isAddingImagesCat } from '../store/note/noteCats.js';
import { NotesList } from './Notes.jsx';

export const AlbumDetails = fastMemo(({ queryParams: { albumId } }) => {
  const load = useCallback(async () => {
    await fetchAlbumItemsEffect(albumId, { startKey: null });
  }, [albumId]);

  return (
    <PrepareData load={load}>
      <Header albumId={albumId} />

      <Notes albumId={albumId} />

      <LoadMore albumId={albumId} />
    </PrepareData>
  );
});

const Header = fastMemo(({ albumId }) => {
  const isLoading = useCat(isLoadingAlbumItemsCat);
  const isAddingImages = useCat(isAddingImagesCat);
  const isDeleting = useCat(isDeletingAlbumCat);
  const album = useAlbum(albumId);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleEdit = useCallback(() => {
    navigateTo(`/albums/edit?albumId=${albumId}`);
  }, [albumId]);

  const handleShowDelete = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const handleDelete = useCallback(() => {
    dispatchAction({
      type: actionTypes.DELETE_ALBUM,
      payload: { sortKey: albumId },
    });
  }, [albumId]);

  const isNoAlbum = albumId?.startsWith('album_noalbum_');

  const rightElement = useMemo(() => {
    return (
      !isNoAlbum && (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <IconButton mr="2" ml="2" variant="ghost">
              <RiMore2Line />
            </IconButton>
          </DropdownMenu.Trigger>

          <DropdownMenu.Content variant="soft">
            <DropdownMenu.Item onClick={handleEdit}>
              <RiPencilLine />
              Edit
            </DropdownMenu.Item>

            <DropdownMenu.Item onClick={handleShowDelete} color={errorColor} disabled={isDeleting}>
              <RiDeleteBinLine />
              Delete
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      )
    );
  }, [handleEdit, handleShowDelete, isDeleting, isNoAlbum]);

  return (
    <>
      <PageHeader
        title={isNoAlbum ? 'Notes without tags' : album?.title || 'Tag details'}
        isLoading={isLoading || isAddingImages || isDeleting}
        fixed
        hasBack
        right={rightElement}
      />

      <Confirm
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        message="This tag will be deleted, notes within this tag won't be deleted. Are you sure?"
        onConfirm={handleDelete}
        isSaving={isDeleting}
      />
    </>
  );
});

const Notes = fastMemo(({ albumId }) => {
  const { items: notes } = useAlbumNotes(albumId);

  if (notes?.length) {
    return <NotesList notes={notes} />;
  }

  return (
    <PageEmpty>
      <Text align="center">No notes in this tag.</Text>
    </PageEmpty>
  );
});

const LoadMore = fastMemo(({ albumId }) => {
  const isLoading = useCat(isLoadingAlbumItemsCat);
  const { startKey, hasMore } = useAlbumNotes(albumId);

  const handleFetch = useCallback(() => {
    fetchAlbumItemsEffect(albumId, { startKey });
  }, [albumId, startKey]);

  const ref = useInView(
    () => {
      handleFetch();
    },
    {
      threshold: 0.1,
      alwaysObserve: true,
    }
  );

  if (!hasMore) {
    return null;
  }

  return (
    <Button ref={ref} onClick={handleFetch} disabled={isLoading}>
      {isLoading ? 'Loading...' : 'Load more'}
    </Button>
  );
});
