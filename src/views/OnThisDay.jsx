import { Flex, IconButton, Spinner, Tabs, Text } from '@radix-ui/themes';
import { RiArrowUpSLine, RiRefreshLine } from '@remixicon/react';
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
import React, { useCallback, useMemo } from 'react';
import { createCat, useCat } from 'usecat';

import { DatePicker } from '../components/DatePicker.jsx';
import { PrepareData } from '../components/PrepareData.jsx';
import { scrollToTop } from '../lib/scrollToTop.js';
import { asyncForEach } from '../shared-private/js/asyncForEach';
import { formatDate } from '../shared-private/js/date.js';
import { getUTCTimeNumber } from '../shared-private/js/getUTCTimeNumber';
import { randomBetween } from '../shared-private/js/utils.js';
import { PageHeader } from '../shared-private/react/PageHeader.jsx';
import { useUserCreatedAt } from '../shared-private/react/store/sharedCats.js';
import { isLoadingOnThisDayNotesCat, onThisDayNotesCat } from '../store/note/noteCats.js';
import { fetchOnThisDayNotesEffect } from '../store/note/noteEffects';
import { NotesList } from './Notes.jsx';

const tabsCat = createCat([]);
const activeTabCat = createCat(null);
const randomDateCat = createCat(null);

export function OnThisDay() {
  const userCreatedAt = useUserCreatedAt();

  const load = useCallback(async () => {
    const tabs = getTabs(userCreatedAt);

    tabsCat.set(tabs);
    activeTabCat.set(tabs[0].value);

    await fetchNotesForDate(tabs[0].date);

    asyncForEach(tabs.slice(1), async tabObj => {
      await fetchNotesForDate(tabObj.date);
    });
  }, [userCreatedAt]);

  return (
    <PrepareData load={load}>
      <Header />

      <HistoryTabs />

      <DatePickerForRandomDate />

      <Notes />
    </PrepareData>
  );
}

const Header = React.memo(() => {
  const isLoading = useCat(isLoadingOnThisDayNotesCat);

  const rightElement = useMemo(
    () => (
      <IconButton onClick={scrollToTop} mr="2" variant="ghost">
        <RiArrowUpSLine />
      </IconButton>
    ),
    []
  );

  return (
    <PageHeader title="On this day" isLoading={isLoading} fixed hasBack right={rightElement} />
  );
});

const HistoryTabs = React.memo(() => {
  const notes = useCat(onThisDayNotesCat);

  const tabs = useCat(tabsCat);
  const activeTab = useCat(activeTabCat);
  const randomDate = useCat(randomDateCat);

  return (
    <Tabs.Root defaultValue="account" value={activeTab} onValueChange={activeTabCat.set} mb="4">
      <Tabs.List>
        {tabs.map(tab => (
          <Tabs.Trigger key={tab.label} value={tab.value}>
            {tab.label} ({getTabNotes(notes, tab.value, randomDate).length})
          </Tabs.Trigger>
        ))}
      </Tabs.List>
    </Tabs.Root>
  );
});

const DatePickerForRandomDate = React.memo(() => {
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

const Notes = React.memo(() => {
  const isLoading = useCat(isLoadingOnThisDayNotesCat);
  const notes = useCat(onThisDayNotesCat);

  const activeTab = useCat(activeTabCat);
  const randomDate = useCat(randomDateCat);

  const currentTabNotes = useMemo(
    () => getTabNotes(notes, activeTab, randomDate),
    [notes, activeTab, randomDate]
  );

  if (currentTabNotes?.length) {
    return <NotesList notes={currentTabNotes} />;
  }

  if (isLoading) {
    return <Spinner />;
  }

  return <Text my="2">No notes on this day.</Text>;
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
    label: 'Random',
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
