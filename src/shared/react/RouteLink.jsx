import { Link } from '@radix-ui/themes';
import React from 'react';
import { BabyLink } from 'react-baby-router';

export const RouteLink = React.memo(({ to, children, mr, mb }) => {
  return (
    <BabyLink to={to}>
      <Link mr={mr} mb={mb}>
        {children}
      </Link>
    </BabyLink>
  );
});
