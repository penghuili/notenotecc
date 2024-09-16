import { Flex } from '@radix-ui/themes';
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
import React, { useEffect, useMemo } from 'react';
import fastMemo from 'react-fast-memo';
import { createCat, useCat } from 'usecat';

import { asyncForEach } from '../shared/js/asyncForEach';
import { formatDate } from '../shared/js/date.js';
import { getUTCTimeNumber } from '../shared/js/getUTCTimeNumber';
import { randomBetween } from '../shared/js/utils.js';
import { RouteLink } from '../shared/react/RouteLink.jsx';
import { useUserCreatedAt } from '../shared/react/store/sharedCats.js';
import { onThisDayNotesCat } from '../store/note/noteCats.js';
import { fetchOnThisDayNotesEffect } from '../store/note/noteEffects';

export const tabsCat = createCat([]);
export const randomDateCat = createCat(null);

export const WhatHappened = fastMemo(() => {
  const userCreatedAt = useUserCreatedAt();

  useEffect(() => {
    loadHistoryNotes(userCreatedAt);
  }, [userCreatedAt]);

  return <WhatHappenedText />;
});

const WhatHappenedText = fastMemo(() => {
  const notes = useCat(onThisDayNotesCat);
  const tabs = useCat(tabsCat);

  const firstBlock = useMemo(() => {
    return tabs.find(tab => tab.value !== 'random' && getTabNotes(notes, tab.value)?.length);
  }, [notes, tabs]);

  if (!firstBlock) {
    return null;
  }

  return (
    <Flex mb="5" justify="center">
      <RouteLink to="/on-this-day">
        What happened the same day {firstBlock.label.toLowerCase()}?{' '}
      </RouteLink>
    </Flex>
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

export async function loadHistoryNotes(userCreatedAt) {
  const tabs = getTabs(userCreatedAt);

  tabsCat.set(tabs);

  await fetchNotesForDate(tabs[0].date);

  asyncForEach(tabs.slice(1), async tabObj => {
    await fetchNotesForDate(tabObj.date);
  });
}

export function getTabNotes(notes, tab, randomDate) {
  if (tab === 'random') {
    const date = formatDate(randomDate || new Date());
    return notes[date] || [];
  }
  return notes[tab] || [];
}

async function fetchNotesForDate(date) {
  await fetchOnThisDayNotesEffect(formatDate(date), parseStartTime(date), parseEndTime(date));
}
