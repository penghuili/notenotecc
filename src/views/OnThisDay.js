import { Tabs, Text } from '@radix-ui/themes';
import {
  differenceInMonths,
  differenceInYears,
  endOfDay,
  startOfDay,
  subDays,
  subMonths,
  subYears,
} from 'date-fns';
import { useAtomValue } from 'jotai';
import React, { useMemo, useState } from 'react';

import { NoteItem } from '../components/NoteItem';
import { Padding } from '../components/Padding';
import { getUTCTimeNumber } from '../shared-private/js/getUTCTimeNumber';
import { useEffectOnce } from '../shared-private/react/hooks/useEffectOnce';
import { PageHeader } from '../shared-private/react/PageHeader';
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

  const [tab, setTab] = useState('week');

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

    return tabs;
  }, [user?.createdAt]);

  useEffectOnce(() => {
    const tabObj = tabs.find(t => t.value === tab);
    fetchOnThisDayNotesEffect(tab, tabObj.startTime, tabObj.endTime);
  });

  return (
    <>
      <Padding>
        <PageHeader title="On this day" isLoading={isLoading} hasBack />
      </Padding>

      <Tabs.Root
        defaultValue="account"
        value={tab}
        onValueChange={async value => {
          setTab(value);

          const tabObj = tabs.find(t => t.value === value);
          fetchOnThisDayNotesEffect(value, tabObj.startTime, tabObj.endTime);
        }}
        mb="4"
      >
        <Tabs.List>
          {tabs.map(tab => (
            <Tabs.Trigger key={tab.value} value={tab.value}>
              {tab.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs.Root>

      {notes[tab]?.length ? (
        notes[tab].map(note => (
          <NoteItem
            key={note.sortKey}
            note={note}
            albums={note?.albumIds?.map(a => albumsObject[a.albumId])?.filter(Boolean)}
          />
        ))
      ) : (
        <Padding>
          <Text my="2">No notes on this day.</Text>
        </Padding>
      )}
    </>
  );
}
