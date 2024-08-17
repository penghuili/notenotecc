import { Flex, IconButton } from '@radix-ui/themes';
import { RiCheckLine, RiCloseLine } from '@remixicon/react';
import React, { useEffect } from 'react';
import styled from 'styled-components';

import { disableBodyScroll, enableBodyScroll } from '../shared/react/bodySccroll';

const Wrapper = styled.div`
  position: fixed;
  top: env(safe-area-inset-top);
  left: 50%;
  transform: translateX(-50%);
  width: 100vw;
  max-width: 600px;
  height: calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom));
  z-index: 3000;
  background-color: white;

  display: flex;
  flex-direction: column;
  align-items: center;
`;
const Top = styled(Flex)`
  max-width: 600px;
`;

export const FullscreenPopup = React.memo(({ disabled, onConfirm, onClose, children }) => {
  useEffect(() => {
    disableBodyScroll();

    return () => {
      enableBodyScroll();
    };
  }, []);

  return (
    <Wrapper>
      <Top justify="between" width="100%" p="2">
        <IconButton variant="soft" onClick={onClose}>
          <RiCloseLine />
        </IconButton>

        <IconButton onClick={onConfirm} disabled={disabled}>
          <RiCheckLine />
        </IconButton>
      </Top>

      {children}
    </Wrapper>
  );
});
