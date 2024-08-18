import { Flex, IconButton } from '@radix-ui/themes';
import { RiArrowLeftLine, RiCheckLine, RiCloseLine } from '@remixicon/react';
import React, { useEffect } from 'react';
import styled from 'styled-components';

import { hasPageMinHeightCat } from '../shared/react/AppWrapper.jsx';
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
  height: 48px;
  padding: 0.5rem;
`;
const TopPlaceholder = styled.div`
  width: 100%;
  height: 48px;
`;

export const FullscreenPopup = React.memo(({ disabled, onBack, onConfirm, onClose, children }) => {
  useEffect(() => {
    hasPageMinHeightCat.set(false);
    disableBodyScroll();

    return () => {
      hasPageMinHeightCat.set(true);
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
