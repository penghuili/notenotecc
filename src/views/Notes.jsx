import { Button, Dropdown, Typography } from '@douyinfe/semi-ui';
import {
  RiAccountCircleLine,
  RiHashtag,
  RiHistoryLine,
  RiMenuLine,
  RiOpenaiLine,
  RiRefreshLine,
  RiSettings3Line,
} from '@remixicon/react';
import React, { useCallback, useMemo } from 'react';
import { BabyLink, navigateTo } from 'react-baby-router';
import fastMemo from 'react-fast-memo';
import styled from 'styled-components';
import { useCat } from 'usecat';

import { Actions } from '../components/Actions.jsx';
import { BackupBitte } from '../components/BackupBitte.jsx';
import { NoteItem } from '../components/NoteItem.jsx';
import { useHasHistory } from '../components/useHasHistory.jsx';
import { useGetNoteAlbums } from '../lib/useGetNoteAlbums.js';
import { useIsAdmin } from '../lib/useIsAdmin.js';
import { useInView } from '../shared/browser/hooks/useInView.js';
import { PageContent } from '../shared/browser/PageContent.jsx';
import { isLoggedInCat } from '../shared/browser/store/sharedCats.js';
import { IconButton } from '../shared/semi/IconButton.jsx';
import { Link } from '../shared/semi/Link.jsx';
import { PageEmpty } from '../shared/semi/PageEmpty.jsx';
import { PageHeader } from '../shared/semi/PageHeader.jsx';
import { PrepareData } from '../shared/semi/PrepareData.jsx';
import { forceFetchAlbumsEffect } from '../store/album/albumEffects.js';
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
      <PageContent>
        <Header />

        <Actions />

        <BackupBitte />

        <NoteItems />

        <LoadMore />
      </PageContent>
    </PrepareData>
  );
});

const Header = fastMemo(() => {
  const isLoadingNotes = useCat(isLoadingNotesCat);
  const isAddingImages = useCat(isAddingImagesCat);
  const isDeleting = useCat(isDeletingNoteCat);
  const isDeletingImage = useCat(isDeletingImageCat);
  const isLoggedIn = useCat(isLoggedInCat);

  const handleFetch = useCallback(async () => {
    dispatchAction({ type: actionTypes.FETCH_NOTES });
    forceFetchAlbumsEffect();
  }, []);

  const rightElement = useMemo(() => <HeaderMenu />, []);

  return (
    <PageHeader
      isLoading={isLoadingNotes || isAddingImages || isDeleting || isDeletingImage}
      fixed
      showNewVersion
      title={
        isLoggedIn &&
        !isLoadingNotes && (
          <IconButton
            icon={<RiRefreshLine />}
            onClick={handleFetch}
            style={{ marginRight: '0.5rem' }}
          />
        )
      }
      right={rightElement}
    />
  );
});

const HeaderMenu = fastMemo(() => {
  const isAdmin = useIsAdmin();
  const isLoggedIn = useCat(isLoggedInCat);
  const hasHistory = useHasHistory();

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
            <Button theme="solid" size="small" style={{ marginRight: '0.5rem' }}>
              Sign up
            </Button>
          </BabyLink>
          <BabyLink to="/sign-in">
            <Button size="small" style={{ marginRight: '0.5rem' }}>
              Sign in
            </Button>
          </BabyLink>
        </>
      )}

      <Dropdown
        trigger="click"
        position="bottomLeft"
        clickToHide
        render={
          <Dropdown.Menu>
            {isLoggedIn && (
              <>
                <Dropdown.Item icon={<RiAccountCircleLine />} onClick={handleNavigateToAccount}>
                  Account
                </Dropdown.Item>

                <Dropdown.Divider />

                <Dropdown.Item
                  icon={<RiHistoryLine />}
                  onClick={handleNavigateToHistory}
                  style={{ position: 'relative' }}
                >
                  Today in history
                  {hasHistory && <RedDot />}
                </Dropdown.Item>
              </>
            )}

            <Dropdown.Item icon={<RiHashtag />} onClick={handleNavigateToAlbums}>
              Tags
            </Dropdown.Item>
            <Dropdown.Item icon={<RiSettings3Line />} onClick={handleNavigateToSettings}>
              Settings
            </Dropdown.Item>

            {isAdmin && (
              <Dropdown.Item icon={<RiOpenaiLine />} onClick={handleNavigateToAI}>
                AI
              </Dropdown.Item>
            )}
          </Dropdown.Menu>
        }
      >
        <IconButton
          icon={
            <>
              <RiMenuLine />
              {hasHistory && <RedDot />}
            </>
          }
          theme="borderless"
          style={{ position: 'relative' }}
        />
      </Dropdown>
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
        <img
          src="https://app.notenote.cc/assets/no-notes.gif"
          alt="No notes"
          style={{ width: '100%', maxWidth: '250px', marginBottom: '1.5rem' }}
        />

        <Typography.Paragraph style={{ textAlign: 'center' }}>
          You have no notes yet.
        </Typography.Paragraph>
        <Typography.Paragraph style={{ textAlign: 'center' }}>
          Tap the actions below to create your first note!
        </Typography.Paragraph>

        <Link href="https://notenote.cc" target="_blank">
          Learn more &gt;&gt;
        </Link>
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
    <Button onClick={handleFetch} disabled={isLoading}>
      <span ref={ref}> {isLoading ? 'Loading...' : 'Load more'}</span>
    </Button>
  );
});

const RedDot = styled.span`
  display: inline-block;
  width: 8px;
  height: 8px;
  background-color: red;
  border-radius: 50%;

  position: absolute;
  top: 0;
  right: -2px;
`;
