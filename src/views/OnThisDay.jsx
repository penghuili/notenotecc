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
import { userAtom } from '../shared-private/react/store/sharedAtoms';
import { albumsObjectAtom } from '../store/album/albumAtoms';
import {
  isLoadingOnThisDayNotesAtom,
  onThisDayNotesAtom,
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

  const [activeTab, setActiveTab] = useState('week');
  const [randomDate, setRandomDate] = useState(getRandomDate());

  const tabs = useMemo(() => {
    if (!user?.createdAt) {
      return [];
    }

    const tabs = [
      {
        label: 'Last week',
        value: 'week',
        startTime: parseStartTime(subDays(new Date(), 7)),
        endTime: parseEndTime(subDays(new Date(), 7)),
      },
      {
        label: 'Last month',
        value: 'month',
        startTime: parseStartTime(subMonths(new Date(), 1)),
        endTime: parseEndTime(subMonths(new Date(), 1)),
      },
    ];

    const months = differenceInMonths(new Date(), new Date(user.createdAt));
    if (months >= 3) {
      tabs.push({
        label: '3 months ago',
        value: 'threeMonths',
        startTime: parseStartTime(subMonths(new Date(), 3)),
        endTime: parseEndTime(subMonths(new Date(), 3)),
      });
    }
    if (months >= 6) {
      tabs.push({
        label: '6 months ago',
        value: 'sixMonths',
        startTime: parseStartTime(subMonths(new Date(), 6)),
        endTime: parseEndTime(subMonths(new Date(), 6)),
      });
    }

    const years = differenceInYears(new Date(), new Date(user.createdAt));
    if (years >= 1) {
      Array(years)
        .fill(0)
        .forEach((_, i) => {
          tabs.push({
            label: `${i + 1} year(s) ago`,
            value: '${i + 1}years',
            startTime: parseStartTime(subYears(new Date(), i + 1)),
            endTime: parseEndTime(subYears(new Date(), i + 1)),
          });
        });
    }

    tabs.push({
      label: 'Random',
      value: 'random',
    });

    return tabs;
  }, [user?.createdAt]);

  useEffect(() => {
    asyncForEach(tabs, async tabObj => {
      if (tabObj.startTime && tabObj.endTime) {
        await fetchOnThisDayNotesEffect(tabObj.value, tabObj.startTime, tabObj.endTime);
      }
    });
  }, [tabs]);

  useEffect(() => {
    if (activeTab === 'random') {
      setRandomDate(getRandomDate());
    }
  }, [activeTab, getRandomDate]);

  useEffect(() => {
    if (!randomDate) {
      return;
    }

    const formated = formatDate(randomDate);
    fetchOnThisDayNotesEffect(formated, parseStartTime(randomDate), parseEndTime(randomDate));
  }, [randomDate]);

  function getTabNotes(tab) {
    if (tab === 'random') {
      const formated = formatDate(randomDate);
      return notes[formated] || [];
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
            <Tabs.Trigger key={tab.value} value={tab.value}>
              {tab.label} ({getTabNotes(tab.value).length})
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs.Root>

      {activeTab === 'random' && !!randomDate && (
        <Flex direction="column" gap="2" mb="4">
          <IconButton
            onClick={() => {
              setRandomDate(getRandomDate());
            }}
          >
            <RiRefreshLine />
          </IconButton>
          <DatePicker value={randomDate} onChange={setRandomDate} />
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
