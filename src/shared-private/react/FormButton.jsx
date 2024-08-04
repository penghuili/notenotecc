import { Button, Flex } from '@radix-ui/themes';
import React from 'react';

export const FormButton = React.memo(({ disabled, isLoading, onClick, children, p }) => {
  return (
    <Flex p={p}>
      <Button onClick={onClick} disabled={disabled} loading={isLoading}>
        {children}
      </Button>
    </Flex>
  );
});
