import { Flex, Heading, Text } from '@radix-ui/themes';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import fastMemo from 'react-fast-memo';
import { useCat } from 'usecat';

import { NoteItem } from '../components/NoteItem.jsx';
import { PrepareData } from '../components/PrepareData.jsx';
import { TikTokCards } from '../components/TikTokCards/TikTokCards.jsx';
import {
  getTabNotes,
  loadHistoryNotes,
  randomDateCat,
  tabsCat,
} from '../components/useHasHistory.jsx';
import { useGetNoteAlbums } from '../lib/useGetNoteAlbums.js';
import { PageContentRef } from '../shared/browser/PageContentRef.jsx';
import { useUserCreatedAt } from '../shared/browser/store/sharedCats.js';
import { formatDateWeek } from '../shared/js/date.js';
import { PageHeader } from '../shared/radix/PageHeader.jsx';
import { isLoadingOnThisDayNotesCat, onThisDayNotesCat } from '../store/note/noteCats.js';
import { reviewHistoryEffect } from '../store/settings/settingsEffects.js';

export const OnThisDay = fastMemo(() => {
  const userCreatedAt = useUserCreatedAt();
  const pageContentRef = useRef(null);

  const load = useCallback(async () => {
    loadHistoryNotes(userCreatedAt);
  }, [userCreatedAt]);

  useEffect(() => {
    reviewHistoryEffect();

    pageContentRef.current.style.paddingBottom = '0';

    return () => {
      if (pageContentRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        pageContentRef.current.style.paddingBottom = '5rem';
      }
    };
  }, []);

  return (
    <>
      <PrepareData load={load}>
        <Header />

        <Notes />
      </PrepareData>
      <PageContentRef ref={pageContentRef} />
    </>
  );
});

const Header = fastMemo(() => {
  const isLoading = useCat(isLoadingOnThisDayNotesCat);

  return <PageHeader title="On this day" isLoading={isLoading} hasBack />;
});

const Notes = fastMemo(() => {
  const isLoading = useCat(isLoadingOnThisDayNotesCat);
  const notes = useCat(onThisDayNotesCat);
  const tabs = useCat(tabsCat);

  const randomDate = useCat(randomDateCat);

  const allNotes = useMemo(() => {
    const tabNotes = tabs.map(tab => ({ tab, notes: getTabNotes(notes, tab.value, randomDate) }));
    return tabNotes.reduce(
      (acc, curr) => [
        ...acc,
        ...(curr?.notes?.length
          ? [
              <Flex key={curr.tab.label} direction="column" align="center">
                <Heading>{curr.tab.label}</Heading>
                <Text>{formatDateWeek(new Date(curr.tab.date))}</Text>
                <Text>You wrote {curr.notes.length} notes</Text>
                <Text>(Scroll to view them)</Text>
              </Flex>,
              ...curr.notes,
            ]
          : []),
      ],
      []
    );
  }, [notes, randomDate, tabs]);

  if (allNotes?.length) {
    return <NotesSwiper notes={allNotes} />;
  }

  if (!isLoading) {
    return <Text my="2">No notes on this day.</Text>;
  }

  return null;
});

const NotesSwiper = fastMemo(({ notes }) => {
  const getNoteAlbums = useGetNoteAlbums();

  if (!notes?.length) {
    return null;
  }

  return (
    <TikTokCards
      cards={notes.map(note =>
        React.isValidElement(note) ? (
          note
        ) : (
          <NoteItem
            key={note.sortKey}
            note={note}
            albums={getNoteAlbums(note)}
            textLines={2}
            hasMarginBottom={false}
          />
        )
      )}
      height="calc(100vh - var(--space-8) - 1.5rem)"
    />
  );
});
