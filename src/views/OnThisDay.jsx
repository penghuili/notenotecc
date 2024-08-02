import { Flex, IconButton, Tabs, Text } from '@radix-ui/themes';
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
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useCat } from 'usecat';

import { DatePicker } from '../components/DatePicker.jsx';
import { NoteItem } from '../components/NoteItem.jsx';
import { asyncForEach } from '../shared-private/js/asyncForEach';
import { formatDate } from '../shared-private/js/date.js';
import { getUTCTimeNumber } from '../shared-private/js/getUTCTimeNumber';
import { randomBetween } from '../shared-private/js/utils.js';
import { PageHeader } from '../shared-private/react/PageHeader.jsx';
import { userCat } from '../shared-private/react/store/sharedCats.js';
import { useAlbumsObject } from '../store/album/albumCats.js';
import {
  isLoadingOnThisDayNotesCat,
  onThisDayNotesCat,
  randomDateCat,
} from '../store/note/noteCats.js';
import { fetchOnThisDayNotesEffect } from '../store/note/noteEffects';

export function OnThisDay() {
  const albumsObject = useAlbumsObject();
  const user = useCat(userCat);
  const isLoading = useCat(isLoadingOnThisDayNotesCat);
  const notes = useCat(onThisDayNotesCat);
  const randomDate = useCat(randomDateCat);

  const tabs = useMemo(() => getTabs(user?.createdAt), [user?.createdAt]);
  const [activeTab, setActiveTab] = useState(tabs[0].value);
  const currentTabNotes = useMemo(
    () => getTabNotes(notes, activeTab, randomDate),
    [notes, activeTab, randomDate]
  );

  const handleDatePickerChange = useCallback(date => {
    randomDateCat.set(date);
    fetchNotesForDate(date);
  }, []);

  useEffect(() => {
    fetchNotes(tabs);
  }, [tabs]);

  return (
    <>
      <PageHeader title="On this day" isLoading={isLoading} fixed hasBack />

      <Tabs.Root
        defaultValue="account"
        value={activeTab}
        onValueChange={async value => {
          setActiveTab(value);
        }}
        mb="4"
      >
        <Tabs.List>
          {tabs.map(tab => (
            <Tabs.Trigger key={tab.label} value={tab.value}>
              {tab.label} ({getTabNotes(notes, tab.value, randomDate).length})
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs.Root>

      {activeTab === 'random' && (
        <Flex direction="column" gap="2" mb="4">
          <IconButton
            onClick={() => {
              const date = getRandomDate(user.createdAt);
              randomDateCat.set(date);
              fetchNotesForDate(date);
            }}
          >
            <RiRefreshLine />
          </IconButton>
          <DatePicker value={randomDate} onChange={handleDatePickerChange} />
        </Flex>
      )}

      {currentTabNotes.length ? (
        currentTabNotes.map(note => (
          <NoteItem
            key={note.sortKey}
            note={note}
            albums={note?.albumIds?.map(a => albumsObject[a.albumId])?.filter(Boolean)}
          />
        ))
      ) : (
        <Text my="2">No notes on this day.</Text>
      )}
    </>
  );
}

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

async function fetchNotes(tabs) {
  await asyncForEach(tabs, async tabObj => {
    await fetchNotesForDate(tabObj.date);
  });
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
