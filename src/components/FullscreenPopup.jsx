import { Flex, IconButton } from '@radix-ui/themes';
import { RiArrowLeftLine, RiCheckLine, RiCloseLine } from '@remixicon/react';
import React, { useEffect } from 'react';
import styled from 'styled-components';

import { disableBodyScroll, enableBodyScroll } from '../shared/react/bodySccroll';

const Wrapper = styled.div`
  position: fixed;
  top: env(safe-area-inset-top);
  left: 50%;
  transform: translateX(-50%);
  z-index: 3000;

  width: 100vw;
  max-width: 600px;
  height: 100vh;
  background-color: white;

  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 0.5rem;
  box-sizing: border-box;
  overflow: hidden;
`;
const Top = styled(Flex)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  max-width: 600px;
  height: var(--space-8);
  padding: 0.5rem;
`;
const TopPlaceholder = styled.div`
  width: 100%;
  height: calc(var(--space-8) + var(--space-2));
`;

export const FullscreenPopup = React.memo(({ disabled, onBack, onConfirm, onClose, children }) => {
  useEffect(() => {
    disableBodyScroll();

    return () => {
      enableBodyScroll();
    };
  }, []);

  return (
    <Wrapper>
      <Top justify="between" width="100%">
        {onBack ? (
          <IconButton variant="soft" onClick={onBack} disabled={disabled}>
            <RiArrowLeftLine />
          </IconButton>
        ) : (
          <>
            <IconButton variant="soft" onClick={onClose}>
              <RiCloseLine />
            </IconButton>

            <IconButton onClick={onConfirm} disabled={disabled}>
              <RiCheckLine />
            </IconButton>
          </>
        )}
      </Top>
      <TopPlaceholder />

      {children}
    </Wrapper>
  );
});
