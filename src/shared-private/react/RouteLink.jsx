import { Link as RLink } from '@radix-ui/themes';
import React from 'react';
import { Link } from 'wouter';

export function RouteLink({ to, children, size, m, mr, mb }) {
  return (
    <Link to={to} asChild>
      <RLink size={size} m={m} mr={mr} mb={mb}>
        {children}
      </RLink>
    </Link>
  );
}
