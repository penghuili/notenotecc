import { Flex, Heading, IconButton, Text } from '@radix-ui/themes';
import { RiRefreshLine } from '@remixicon/react';
import {
  addDays,
  differenceInCalendarDays,
  differenceInMonths,
  differenceInYears,
  endOfDay,
  startOfDay,
  subDays,
  subMonths,
  subYears,
} from 'date-fns';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import fastMemo from 'react-fast-memo';
import { createCat, useCat } from 'usecat';

import { DatePicker } from '../components/DatePicker.jsx';
import { NoteItem } from '../components/NoteItem.jsx';
import { PrepareData } from '../components/PrepareData.jsx';
import { TikTokCards } from '../components/TikTokCards/TikTokCards.jsx';
import { useGetNoteAlbums } from '../lib/useGetNoteAlbums.js';
import { asyncForEach } from '../shared/js/asyncForEach';
import { formatDate, formatDateWeek } from '../shared/js/date.js';
import { getUTCTimeNumber } from '../shared/js/getUTCTimeNumber';
import { randomBetween } from '../shared/js/utils.js';
import { PageContentRef } from '../shared/react/PageContentRef.jsx';
import { PageHeader } from '../shared/react/PageHeader.jsx';
import { useUserCreatedAt } from '../shared/react/store/sharedCats.js';
import { isLoadingOnThisDayNotesCat, onThisDayNotesCat } from '../store/note/noteCats.js';
import { fetchOnThisDayNotesEffect } from '../store/note/noteEffects';

const tabsCat = createCat([]);
const activeTabCat = createCat(null);
const randomDateCat = createCat(null);

export const OnThisDay = fastMemo(({ queryParams: { tab } }) => {
  const userCreatedAt = useUserCreatedAt();
  const pageContentRef = useRef(null);

  const load = useCallback(async () => {
    const tabs = getTabs(userCreatedAt);

    tabsCat.set(tabs);
    activeTabCat.set(tab || tabs[0].value);

    await fetchNotesForDate(tabs[0].date);

    asyncForEach(tabs.slice(1), async tabObj => {
      await fetchNotesForDate(tabObj.date);
    });
  }, [tab, userCreatedAt]);

  useEffect(() => {
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

        <DatePickerForRandomDate />

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

const DatePickerForRandomDate = fastMemo(() => {
  const createdAt = useUserCreatedAt();

  const activeTab = useCat(activeTabCat);
  const randomDate = useCat(randomDateCat);

  const handleRefreshDate = useCallback(() => {
    const date = getRandomDate(createdAt);
    randomDateCat.set(date);
    fetchNotesForDate(date);
  }, [createdAt]);

  const handleDatePickerChange = useCallback(date => {
    randomDateCat.set(date);
    fetchNotesForDate(date);
  }, []);

  if (activeTab !== 'random') {
    return null;
  }

  return (
    <Flex direction="column" gap="2" mb="4">
      <IconButton onClick={handleRefreshDate}>
        <RiRefreshLine />
      </IconButton>
      <DatePicker value={randomDate} onChange={handleDatePickerChange} />
    </Flex>
  );
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

function parseStartTime(startTime) {
  return startTime ? getUTCTimeNumber(startOfDay(new Date(startTime))) : null;
}
function parseEndTime(endTime) {
  return endTime ? getUTCTimeNumber(endOfDay(new Date(endTime))) : null;
}
function getTabs(createdAt) {
  if (!createdAt) {
    return [];
  }

  const lastWeek = subDays(new Date(), 7);
  const tabs = [
    {
      label: 'Last week',
      value: formatDate(lastWeek),
      date: lastWeek,
    },
  ];

  const months = differenceInMonths(new Date(), new Date(createdAt));
  if (months >= 1) {
    const lastMonth = subMonths(new Date(), 1);
    tabs.push({
      label: 'Last month',
      value: formatDate(lastMonth),
      date: lastMonth,
    });
  }
  if (months >= 3) {
    const threeMonths = subMonths(new Date(), 3);
    tabs.push({
      label: '3 months ago',
      value: formatDate(threeMonths),
      date: threeMonths,
    });
  }
  if (months >= 6) {
    const sixMonths = subMonths(new Date(), 6);
    tabs.push({
      label: '6 months ago',
      value: formatDate(sixMonths),
      date: sixMonths,
    });
  }

  const years = differenceInYears(new Date(), new Date(createdAt));
  if (years >= 1) {
    Array(years)
      .fill(0)
      .forEach((_, i) => {
        const yearDate = subYears(new Date(), i + 1);
        tabs.push({
          label: `${i + 1} year(s) ago`,
          value: formatDate(yearDate),
          date: yearDate,
        });
      });
  }

  let randomDate = randomDateCat.get();
  if (!randomDate) {
    randomDate = getRandomDate(createdAt);
    randomDateCat.set(randomDate);
  }

  tabs.push({
    label: 'A random day',
    value: 'random',
    date: randomDate,
  });

  return tabs;
}
function getRandomDate(createdAt) {
  if (!createdAt) {
    return new Date();
  }

  const createdDays = differenceInCalendarDays(new Date(), new Date(createdAt));
  const randomDays = randomBetween(0, createdDays);
  return addDays(new Date(createdAt), randomDays);
}

async function fetchNotesForDate(date) {
  await fetchOnThisDayNotesEffect(formatDate(date), parseStartTime(date), parseEndTime(date));
}
function getTabNotes(notes, tab, randomDate) {
  if (tab === 'random') {
    const date = formatDate(randomDate || new Date());
    return notes[date] || [];
  }
  return notes[tab] || [];
}
