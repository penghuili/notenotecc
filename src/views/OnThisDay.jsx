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
import { useAtomValue } from 'jotai';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { DatePicker } from '../components/DatePicker.jsx';
import { NoteItem } from '../components/NoteItem.jsx';
import { asyncForEach } from '../shared-private/js/asyncForEach';
import { formatDate } from '../shared-private/js/date.js';
import { getUTCTimeNumber } from '../shared-private/js/getUTCTimeNumber';
import { randomBetween } from '../shared-private/js/utils';
import { PageHeader } from '../shared-private/react/PageHeader.jsx';
import { updateAtomValue } from '../shared-private/react/store/atomHelpers.js';
import { userAtom } from '../shared-private/react/store/sharedAtoms';
import { albumsObjectAtom } from '../store/album/albumAtoms';
import {
  isLoadingOnThisDayNotesAtom,
  onThisDayNotesAtom,
  randomDateAtom,
} from '../store/note/noteAtoms';
import { fetchOnThisDayNotesEffect } from '../store/note/noteEffects';

function parseStartTime(startTime) {
  return startTime ? getUTCTimeNumber(startOfDay(new Date(startTime))) : null;
}
function parseEndTime(endTime) {
  return endTime ? getUTCTimeNumber(endOfDay(new Date(endTime))) : null;
}

export function OnThisDay() {
  const albumsObject = useAtomValue(albumsObjectAtom);
  const user = useAtomValue(userAtom);
  const isLoading = useAtomValue(isLoadingOnThisDayNotesAtom);
  const notes = useAtomValue(onThisDayNotesAtom);

  const getRandomDate = useCallback(() => {
    const createdDays = differenceInCalendarDays(new Date(), new Date(user.createdAt));
    const randomDays = randomBetween(0, createdDays);
    return addDays(new Date(user.createdAt), randomDays);
  }, [user?.createdAt]);

  const randomDate = useAtomValue(randomDateAtom);

  const tabs = useMemo(() => {
    if (!user?.createdAt) {
      return [];
    }

    const lastWeek = subDays(new Date(), 7);
    const lastMonth = subMonths(new Date(), 1);
    const tabs = [
      {
        label: 'Last week',
        value: formatDate(lastWeek),
        date: formatDate(lastWeek),
        startTime: parseStartTime(lastWeek),
        endTime: parseEndTime(lastWeek),
      },
      {
        label: 'Last month',
        value: formatDate(lastMonth),
        date: formatDate(lastMonth),
        startTime: parseStartTime(lastMonth),
        endTime: parseEndTime(lastMonth),
      },
    ];

    const months = differenceInMonths(new Date(), new Date(user.createdAt));
    if (months >= 3) {
      const threeMonths = subMonths(new Date(), 3);
      tabs.push({
        label: '3 months ago',
        value: formatDate(threeMonths),
        date: formatDate(threeMonths),
        startTime: parseStartTime(threeMonths),
        endTime: parseEndTime(threeMonths),
      });
    }
    if (months >= 6) {
      const sixMonths = subMonths(new Date(), 6);
      tabs.push({
        label: '6 months ago',
        value: formatDate(sixMonths),
        date: formatDate(sixMonths),
        startTime: parseStartTime(sixMonths),
        endTime: parseEndTime(sixMonths),
      });
    }

    const years = differenceInYears(new Date(), new Date(user.createdAt));
    if (years >= 1) {
      Array(years)
        .fill(0)
        .forEach((_, i) => {
          const yearDate = subYears(new Date(), i + 1);
          tabs.push({
            label: `${i + 1} year(s) ago`,
            value: formatDate(yearDate),
            date: formatDate(yearDate),
            startTime: parseStartTime(yearDate),
            endTime: parseEndTime(yearDate),
          });
        });
    }

    if (randomDate) {
      tabs.push({
        label: 'Random',
        value: 'random',
        date: formatDate(randomDate),
        startTime: parseStartTime(randomDate),
        endTime: parseEndTime(randomDate),
      });
    }

    return tabs;
  }, [user?.createdAt, randomDate]);

  const [activeTab, setActiveTab] = useState(tabs[0].value);

  useEffect(() => {
    if (!randomDate) {
      updateAtomValue(getRandomDate());
    }
  }, [getRandomDate, randomDate]);

  useEffect(() => {
    asyncForEach(tabs, async tabObj => {
      await fetchOnThisDayNotesEffect(tabObj.date, tabObj.startTime, tabObj.endTime);
    });
  }, [tabs]);

  function getTabNotes(tab) {
    if (tab === 'random') {
      const date = formatDate(randomDate);
      return notes[date] || [];
    }
    return notes[tab] || [];
  }

  const currentTabNotes = getTabNotes(activeTab);

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
              {tab.label} ({getTabNotes(tab.value).length})
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs.Root>

      {activeTab === 'random' && (
        <Flex direction="column" gap="2" mb="4">
          <IconButton
            onClick={() => {
              updateAtomValue(getRandomDate());
            }}
          >
            <RiRefreshLine />
          </IconButton>
          <DatePicker
            value={randomDate}
            onChange={date => {
              updateAtomValue(date);
            }}
          />
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
