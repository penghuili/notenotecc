import React from 'react';
import { Button, Flex } from '@radix-ui/themes';

export function FormButton({ disabled, isLoading, onClick, children, p }) {
  return (
    <Flex p={p}>
      <Button onClick={onClick} disabled={disabled} loading={isLoading}>
        {children}
      </Button>
    </Flex>
  );
}
