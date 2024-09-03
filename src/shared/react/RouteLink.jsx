import { Link } from '@radix-ui/themes';
import React, { useCallback } from 'react';
import { navigateTo } from 'react-baby-router';

export const RouteLink = React.memo(({ to, children, mr, mb }) => {
  const handleClick = useCallback(
    e => {
      e.preventDefault();
      navigateTo(to);
    },
    [to]
  );

  return (
    <Link href={to} mr={mr} mb={mb} underline="hover" onClick={handleClick}>
      {children}
    </Link>
  );
});