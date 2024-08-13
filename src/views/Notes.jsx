import { Button, DropdownMenu, IconButton } from '@radix-ui/themes';
import {
  RiAccountCircleLine,
  RiHashtag,
  RiHistoryLine,
  RiMenuLine,
  RiOpenaiLine,
  RiRefreshLine,
} from '@remixicon/react';
import React, { useCallback, useMemo } from 'react';
import { useCat } from 'usecat';

import { Actions } from '../components/Actions.jsx';
import { NoteItem } from '../components/NoteItem.jsx';
import { PrepareData } from '../components/PrepareData.jsx';
import { ScrollToTop } from '../components/ScrollToTop.jsx';
import { useGetNoteAlbums } from '../lib/useGetNoteAlbums.js';
import { useInView } from '../shared-private/react/hooks/useInView.js';
import { PageHeader } from '../shared-private/react/PageHeader.jsx';
import { userCat } from '../shared-private/react/store/sharedCats.js';
import { fetchSettingsEffect, navigateEffect } from '../shared-private/react/store/sharedEffects';
import {
  isAddingImagesCat,
  isDeletingImageCat,
  isDeletingNoteCat,
  isLoadingNotesCat,
  notesCat,
} from '../store/note/noteCats.js';
import { fetchNotesEffect } from '../store/note/noteEffects';

async function load() {
  await fetchNotesEffect();
}

export function Notes() {
  return (
    <PrepareData load={load} source="Notes">
      <Header />

      <NotesItems />

      <LoadMore />

      <Actions />
    </PrepareData>
  );
}

const Header = React.memo(() => {
  const isLoading = useCat(isLoadingNotesCat);
  const isAddingImages = useCat(isAddingImagesCat);
  const isDeleting = useCat(isDeletingNoteCat);
  const isDeletingImage = useCat(isDeletingImageCat);

  const handleFetch = useCallback(async () => {
    isLoadingNotesCat.set(true);
    await fetchSettingsEffect(true);
    await fetchNotesEffect(null, true);
  }, []);

  const rightElement = useMemo(
    () => (
      <>
        <ScrollToTop />

        <HeaderMenu />
      </>
    ),
    []
  );

  return (
    <PageHeader
      isLoading={isLoading || isAddingImages || isDeleting || isDeletingImage}
      fixed
      showNewVersion
      title={
        <IconButton onClick={handleFetch} mr="2" variant="soft">
          <RiRefreshLine />
        </IconButton>
      }
      right={rightElement}
    />
  );
});

const HeaderMenu = React.memo(() => {
  const userId = useCat(userCat, account => account?.id);
  const isAdmin = useMemo(
    () => [import.meta.env.VITE_USER1, import.meta.env.VITE_USER2].includes(userId),
    [userId]
  );

  const handleNavigateToAccount = useCallback(() => {
    navigateEffect('/account');
  }, []);

  const handleNavigateToHistory = useCallback(() => {
    navigateEffect('/on-this-day');
  }, []);

  const handleNavigateToAlbums = useCallback(() => {
    navigateEffect('/albums');
  }, []);

  const handleNavigateToAI = useCallback(() => {
    navigateEffect('/ai');
  }, []);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <IconButton variant="ghost" mr="2">
          <RiMenuLine />
        </IconButton>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content variant="soft">
        <DropdownMenu.Item onClick={handleNavigateToAccount}>
          <RiAccountCircleLine />
          Account
        </DropdownMenu.Item>

        <DropdownMenu.Separator />

        <DropdownMenu.Item onClick={handleNavigateToHistory}>
          <RiHistoryLine />
          Today in history
        </DropdownMenu.Item>

        <DropdownMenu.Item onClick={handleNavigateToAlbums}>
          <RiHashtag />
          Albums
        </DropdownMenu.Item>

        {isAdmin && (
          <DropdownMenu.Item onClick={handleNavigateToAI}>
            <RiOpenaiLine />
            AI
          </DropdownMenu.Item>
        )}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
});

const NotesItems = React.memo(() => {
  const { items: notes } = useCat(notesCat);
  return <NotesList notes={notes} />;
});

export const NotesList = React.memo(({ notes }) => {
  const getNoteAlbums = useGetNoteAlbums();

  if (!notes?.length) {
    return null;
  }

  return notes.map(note => (
    <NoteItem key={note.sortKey} note={note} albums={getNoteAlbums(note)} />
  ));
});

const LoadMore = React.memo(() => {
  const isLoading = useCat(isLoadingNotesCat);
  const { startKey, hasMore } = useCat(notesCat);

  const handleFetch = useCallback(() => {
    fetchNotesEffect(startKey, true);
  }, [startKey]);

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
      Load more
    </Button>
  );
});
