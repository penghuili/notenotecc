import { Text } from '@radix-ui/themes';
import { differenceInCalendarDays } from 'date-fns';
import React from 'react';

import { formatDate } from '../js/date';
import { errorColor, warningColor } from './AppWrapper.jsx';
import { useExpiresAt } from './store/sharedCats.js';

export function PaymentStatus() {
  const expiresAt = useExpiresAt();

  if (!expiresAt) {
    return null;
  }

  if (expiresAt === 'forever') {
    return <Text weight="bold">Life time access</Text>;
  }

  const expiresDate = new Date(expiresAt);
  const formattedExpiresDate = formatDate(expiresDate);
  const today = new Date();
  const formattedToday = formatDate(today);
  const isExpired = formattedExpiresDate < formattedToday;
  const validDays = differenceInCalendarDays(expiresDate, today);
  const willBeExpiredSoon = validDays <= 7;

  if (isExpired) {
    return <Text color={errorColor}>Expired (valid until {formattedExpiresDate})</Text>;
  }

  if (willBeExpiredSoon) {
    return (
      <Text color={warningColor}>
        {formattedExpiresDate} ({validDays} {validDays > 1 ? 'days' : 'day'} left)
      </Text>
    );
  }

  return (
    <Text>
      {formattedExpiresDate} ({validDays} days left)
    </Text>
  );
}
