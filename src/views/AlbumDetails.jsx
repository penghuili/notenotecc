import { Button, Dropdown, Typography } from '@douyinfe/semi-ui';
import { RiDeleteBinLine, RiEdit2Line, RiMore2Line } from '@remixicon/react';
import React, { useCallback, useMemo, useState } from 'react';
import { navigateTo } from 'react-baby-router';
import fastMemo from 'react-fast-memo';
import { useCat } from 'usecat';

import { useInView } from '../shared/browser/hooks/useInView.js';
import { PageContent } from '../shared/browser/PageContent.jsx';
import { Confirm } from '../shared/semi/Confirm.jsx';
import { IconButton } from '../shared/semi/IconButton.jsx';
import { PageEmpty } from '../shared/semi/PageEmpty.jsx';
import { PageHeader } from '../shared/semi/PageHeader.jsx';
import { PrepareData } from '../shared/semi/PrepareData.jsx';
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
      <PageContent>
        <Header albumId={albumId} />

        <Notes albumId={albumId} />

        <LoadMore albumId={albumId} />
      </PageContent>
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
        <Dropdown
          trigger="click"
          clickToHide
          render={
            <Dropdown.Menu>
              <Dropdown.Item icon={<RiEdit2Line />} onClick={handleEdit}>
                Edit
              </Dropdown.Item>

              <Dropdown.Divider />

              <Dropdown.Item
                type="danger"
                icon={<RiDeleteBinLine />}
                disabled={isDeleting}
                onClick={handleShowDelete}
              >
                Delete
              </Dropdown.Item>
            </Dropdown.Menu>
          }
        >
          <IconButton
            theme="borderless"
            icon={<RiMore2Line />}
            style={{
              position: 'absolute',
              top: '0.5rem',
              right: '0.5rem',
            }}
          />
        </Dropdown>
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
      <Typography.Paragraph>No notes in this tag.</Typography.Paragraph>
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
    <Button theme="solid" onClick={handleFetch} disabled={isLoading}>
      <span ref={ref}>{isLoading ? 'Loading...' : 'Load more'}</span>
    </Button>
  );
});
