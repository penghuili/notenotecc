import { Button, DropdownMenu, IconButton, Text } from '@radix-ui/themes';
import {
  RiAccountCircleLine,
  RiHashtag,
  RiHistoryLine,
  RiMenuLine,
  RiOpenaiLine,
  RiRefreshLine,
  RiSettings3Line,
} from '@remixicon/react';
import React, { useCallback, useMemo, useState } from 'react';
import { BabyLink, navigateTo } from 'react-baby-router';
import fastMemo from 'react-fast-memo';
import { useCat } from 'usecat';

import { Actions } from '../components/Actions.jsx';
import { BackupBitte } from '../components/BackupBitte.jsx';
import { NoteItem } from '../components/NoteItem.jsx';
import { PrepareData } from '../components/PrepareData.jsx';
import { useGetNoteAlbums } from '../lib/useGetNoteAlbums.js';
import { useIsAdmin } from '../lib/useIsAdmin.js';
import { useInView } from '../shared/react/hooks/useInView.js';
import { PageEmpty } from '../shared/react/PageEmpty.jsx';
import { PageHeader } from '../shared/react/PageHeader.jsx';
import { isLoggedInCat } from '../shared/react/store/sharedCats.js';
import { actionTypes, dispatchAction } from '../store/allActions.js';
import {
  isAddingImagesCat,
  isDeletingImageCat,
  isDeletingNoteCat,
  isLoadingNotesCat,
  notesCat,
} from '../store/note/noteCats.js';
import { forceFetchHomeNotesEffect } from '../store/note/noteEffects';

async function load() {
  dispatchAction({ type: actionTypes.FETCH_NOTES });
}

export const Notes = fastMemo(() => {
  return (
    <PrepareData load={load} source="Notes">
      <Header />

      <BackupBitte />

      <NoteItems />

      <LoadMore />

      <Actions />
    </PrepareData>
  );
});

const Header = fastMemo(() => {
  const isAddingImages = useCat(isAddingImagesCat);
  const isDeleting = useCat(isDeletingNoteCat);
  const isDeletingImage = useCat(isDeletingImageCat);
  const isLoggedIn = useCat(isLoggedInCat);

  const [isForceLoading, setIsForceLoading] = useState(false);

  const handleFetch = useCallback(async () => {
    setIsForceLoading(true);
    await forceFetchHomeNotesEffect();
    setIsForceLoading(false);
  }, []);

  const rightElement = useMemo(() => <HeaderMenu />, []);

  return (
    <PageHeader
      isLoading={isForceLoading || isAddingImages || isDeleting || isDeletingImage}
      fixed
      showNewVersion
      title={
        isLoggedIn &&
        !isForceLoading && (
          <IconButton onClick={handleFetch} mr="2" variant="soft">
            <RiRefreshLine />
          </IconButton>
        )
      }
      right={rightElement}
    />
  );
});

const HeaderMenu = fastMemo(() => {
  const isAdmin = useIsAdmin();
  const isLoggedIn = useCat(isLoggedInCat);

  const handleNavigateToAccount = useCallback(() => {
    navigateTo('/account');
  }, []);

  const handleNavigateToHistory = useCallback(() => {
    navigateTo('/on-this-day');
  }, []);

  const handleNavigateToAlbums = useCallback(() => {
    navigateTo('/albums');
  }, []);

  const handleNavigateToSettings = useCallback(() => {
    navigateTo('/settings');
  }, []);

  const handleNavigateToAI = useCallback(() => {
    navigateTo('/ai');
  }, []);

  return (
    <>
      {!isLoggedIn && (
        <>
          <BabyLink to="/sign-up">
            <Button variant="solid" size="1" mr="2">
              Sign up
            </Button>
          </BabyLink>
          <BabyLink to="/sign-in">
            <Button variant="soft" size="1" mr="2">
              Sign in
            </Button>
          </BabyLink>
        </>
      )}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <IconButton variant="ghost" mr="2">
            <RiMenuLine />
          </IconButton>
        </DropdownMenu.Trigger>

        <DropdownMenu.Content variant="soft">
          {isLoggedIn && (
            <>
              <DropdownMenu.Item onClick={handleNavigateToAccount}>
                <RiAccountCircleLine />
                Account
              </DropdownMenu.Item>

              <DropdownMenu.Separator />

              <DropdownMenu.Item onClick={handleNavigateToHistory}>
                <RiHistoryLine />
                Today in history
              </DropdownMenu.Item>
            </>
          )}

          <DropdownMenu.Item onClick={handleNavigateToAlbums}>
            <RiHashtag />
            Tags
          </DropdownMenu.Item>

          <DropdownMenu.Item onClick={handleNavigateToSettings}>
            <RiSettings3Line />
            Settings
          </DropdownMenu.Item>

          {isAdmin && (
            <DropdownMenu.Item onClick={handleNavigateToAI}>
              <RiOpenaiLine />
              AI
            </DropdownMenu.Item>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </>
  );
});

const NoteItems = fastMemo(() => {
  const { items: notes } = useCat(notesCat);
  const isLoading = useCat(isLoadingNotesCat);

  if (notes?.length) {
    return <NotesList notes={notes} />;
  }
  if (!isLoading) {
    return (
      <PageEmpty>
        <Text align="center">
          You have no notes yet, tap the actions below to create your first note!
        </Text>
      </PageEmpty>
    );
  }
  return null;
});

export const NotesList = fastMemo(({ notes }) => {
  const getNoteAlbums = useGetNoteAlbums();

  if (!notes?.length) {
    return null;
  }

  return notes.map(note => (
    <NoteItem key={note.sortKey} note={note} albums={getNoteAlbums(note)} />
  ));
});

const LoadMore = fastMemo(() => {
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
