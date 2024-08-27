import { Button, DropdownMenu, IconButton, Text } from '@radix-ui/themes';
import { RiDeleteBinLine, RiMore2Line, RiPencilLine } from '@remixicon/react';
import React, { useCallback, useMemo, useState } from 'react';
import { useCat } from 'usecat';

import { PrepareData } from '../components/PrepareData.jsx';
import { errorColor } from '../shared/react/AppWrapper.jsx';
import { Confirm } from '../shared/react/Confirm.jsx';
import { useInView } from '../shared/react/hooks/useInView.js';
import { navigate } from '../shared/react/my-router.jsx';
import { PageEmpty } from '../shared/react/PageEmpty.jsx';
import { PageHeader } from '../shared/react/PageHeader.jsx';
import { useScrollToTop } from '../shared/react/ScrollToTop.jsx';
import { isDeletingAlbumCat, useAlbum } from '../store/album/albumCats.js';
import { isLoadingAlbumItemsCat, useAlbumNotes } from '../store/album/albumItemCats.js';
import { fetchAlbumItemsEffect } from '../store/album/albumItemEffects';
import { actionTypes, dispatchAction } from '../store/allActions.js';
import { isAddingImagesCat } from '../store/note/noteCats.js';
import { NotesList } from './Notes.jsx';

export const AlbumDetails = React.memo(({ queryParams: { albumId } }) => {
  const load = useCallback(async () => {
    await fetchAlbumItemsEffect(albumId, { startKey: null });
  }, [albumId]);

  useScrollToTop();

  return (
    <PrepareData load={load}>
      <Header albumId={albumId} />

      <Notes albumId={albumId} />

      <LoadMore albumId={albumId} />
    </PrepareData>
  );
});

const Header = React.memo(({ albumId }) => {
  const isLoading = useCat(isLoadingAlbumItemsCat);
  const isAddingImages = useCat(isAddingImagesCat);
  const isDeleting = useCat(isDeletingAlbumCat);
  const album = useAlbum(albumId);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleEdit = useCallback(() => {
    navigate(`/albums/edit?albumId=${albumId}`);
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

const Notes = React.memo(({ albumId }) => {
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

const LoadMore = React.memo(({ albumId }) => {
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
