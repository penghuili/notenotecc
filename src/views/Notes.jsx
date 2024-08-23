import { Button, DropdownMenu, IconButton, Text } from '@radix-ui/themes';
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
import { PageEmpty } from '../components/PageEmpty.jsx';
import { PrepareData } from '../components/PrepareData.jsx';
import { ScrollToTop } from '../components/ScrollToTop.jsx';
import { useGetNoteAlbums } from '../lib/useGetNoteAlbums.js';
import { useIsAdmin } from '../lib/useIsAdmin.js';
import { useInView } from '../shared/react/hooks/useInView.js';
import { navigate } from '../shared/react/my-router.jsx';
import { PageHeader } from '../shared/react/PageHeader.jsx';
import {
  isAddingImagesCat,
  isDeletingImageCat,
  isDeletingNoteCat,
  isLoadingNotesCat,
  notesCat,
} from '../store/note/noteCats.js';
import { fetchHomeNotesEffect, forceFetchHomeNotesEffect } from '../store/note/noteEffects';

async function load() {
  fetchHomeNotesEffect();
}

export function Notes() {
  return (
    <PrepareData load={load} source="Notes">
      <Header />

      <NoteItems />

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
    await forceFetchHomeNotesEffect();
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
  const isAdmin = useIsAdmin();

  const handleNavigateToAccount = useCallback(() => {
    navigate('/account');
  }, []);

  const handleNavigateToHistory = useCallback(() => {
    navigate('/on-this-day');
  }, []);

  const handleNavigateToAlbums = useCallback(() => {
    navigate('/albums');
  }, []);

  const handleNavigateToAI = useCallback(() => {
    navigate('/ai');
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
          Tags
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

const NoteItems = React.memo(() => {
  const { items: notes } = useCat(notesCat);
  const isLoading = useCat(isLoadingNotesCat);

  if (notes?.length) {
    return <NotesList notes={notes} />;
  }
  if (!isLoading) {
    return (
      <PageEmpty>
        <Text align="center">Click actions below to take your first note.</Text>
      </PageEmpty>
    );
  }
  return null;
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
    forceFetchHomeNotesEffect(startKey);
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
      {isLoading ? 'Loading...' : 'Load more'}
    </Button>
  );
});
