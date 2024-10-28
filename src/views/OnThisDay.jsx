import { Typography } from '@douyinfe/semi-ui';
import React, { useCallback, useEffect, useMemo } from 'react';
import fastMemo from 'react-fast-memo';
import { useCat } from 'usecat';

import { NoteItem } from '../components/NoteItem.jsx';
import { TikTokCards } from '../components/TikTokCards/TikTokCards.jsx';
import {
  getTabNotes,
  loadHistoryNotes,
  randomDateCat,
  tabsCat,
} from '../components/useHasHistory.jsx';
import { useGetNoteAlbums } from '../lib/useGetNoteAlbums.js';
import { PageContent } from '../shared/browser/PageContent.jsx';
import { useUserCreatedAt } from '../shared/browser/store/sharedCats.js';
import { formatDateWeek } from '../shared/js/date.js';
import { Flex } from '../shared/semi/Flex.jsx';
import { PageHeader } from '../shared/semi/PageHeader.jsx';
import { PrepareData } from '../shared/semi/PrepareData.jsx';
import { isLoadingOnThisDayNotesCat, onThisDayNotesCat } from '../store/note/noteCats.js';
import { reviewHistoryEffect } from '../store/settings/settingsEffects.js';

export const OnThisDay = fastMemo(() => {
  const userCreatedAt = useUserCreatedAt();

  const load = useCallback(async () => {
    loadHistoryNotes(userCreatedAt);
  }, [userCreatedAt]);

  useEffect(() => {
    reviewHistoryEffect();
  }, []);

  return (
    <PrepareData load={load}>
      <PageContent paddingBottom="0">
        <Header />

        <Notes />
      </PageContent>
    </PrepareData>
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
                <Typography.Title heading={4}>{curr.tab.label}</Typography.Title>
                <Typography.Text>{formatDateWeek(new Date(curr.tab.date))}</Typography.Text>
                <Typography.Text>You wrote {curr.notes.length} notes</Typography.Text>
                <Typography.Text>(Scroll to view them)</Typography.Text>
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
    return <Typography.Text style={{ margin: '0.5rem 0' }}>No notes on this day.</Typography.Text>;
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
      height="calc(100vh - 4.5rem)"
    />
  );
});
