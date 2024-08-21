import { DropdownMenu, IconButton, Text } from '@radix-ui/themes';
import { RiDeleteBinLine, RiMore2Line, RiPencilLine } from '@remixicon/react';
import React, { useCallback, useMemo, useState } from 'react';
import { useCat } from 'usecat';

import { PageEmpty } from '../components/PageEmpty.jsx';
import { PrepareData } from '../components/PrepareData.jsx';
import { ScrollToTop } from '../components/ScrollToTop.jsx';
import { useScrollToTop } from '../lib/useScrollToTop.js';
import { errorColor } from '../shared/react/AppWrapper.jsx';
import { Confirm } from '../shared/react/Confirm.jsx';
import { FormButton } from '../shared/react/FormButton.jsx';
import { navigate } from '../shared/react/my-router.jsx';
import { PageHeader } from '../shared/react/PageHeader.jsx';
import { isDeletingAlbumCat } from '../store/album/albumCats.js';
import { deleteAlbumEffect } from '../store/album/albumEffects.js';
import { isLoadingAlbumItemsCat, useAlbumNotes } from '../store/album/albumItemCats.js';
import { fetchAlbumItemsEffect } from '../store/album/albumItemEffects';
import { isAddingImagesCat } from '../store/note/noteCats.js';
import { NotesList } from './Notes.jsx';

export const AlbumDetails = React.memo(({ pathParams: { albumId } }) => {
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

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleEdit = useCallback(() => {
    navigate(`/albums/${albumId}/edit`);
  }, [albumId]);

  const handleShowDelete = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const handleDelete = useCallback(
    e => {
      e.stopPropagation();
      deleteAlbumEffect(albumId, { goBack: true });
    },
    [albumId]
  );

  const rightElement = useMemo(() => {
    return (
      <>
        <ScrollToTop />

        {!albumId?.startsWith('album_noalbum_') && (
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

              <DropdownMenu.Item
                onClick={handleShowDelete}
                color={errorColor}
                disabled={isDeleting}
              >
                <RiDeleteBinLine />
                Delete
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        )}
      </>
    );
  }, [albumId, handleEdit, handleShowDelete, isDeleting]);

  return (
    <>
      <PageHeader
        title="Tag details"
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

  if (!hasMore) {
    return null;
  }

  return (
    <FormButton onClick={handleFetch} disabled={isLoading}>
      Load more
    </FormButton>
  );
});
