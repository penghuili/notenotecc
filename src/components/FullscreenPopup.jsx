import { Flex, IconButton } from '@radix-ui/themes';
import { RiArrowLeftLine, RiCheckLine, RiCloseLine } from '@remixicon/react';
import React, { useEffect } from 'react';
import fastMemo from 'react-fast-memo';
import styled from 'styled-components';

import { disableBodyScroll, enableBodyScroll } from '../shared/react/bodySccroll';
import { isMobileWidth } from '../shared/react/device';
import { widthWithoutScrollbar } from '../shared/react/getScrollbarWidth';

const Wrapper = styled.div`
  position: fixed;
  top: env(safe-area-inset-top);
  left: 0;
  z-index: 3000;

  width: ${widthWithoutScrollbar}px;
  height: calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom));
  overflow: hidden;

  background-color: white;
`;
const Content = styled.div`
  position: relative;

  width: 100%;
  max-width: 600px;
  height: 100%;
  margin: 0 auto;

  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 0.5rem;
  box-sizing: border-box;
`;
const Top = styled(Flex)`
  position: fixed;
  top: 0;
  left: 50%;
  transform: ${isMobileWidth() ? 'translateX(-50%)' : 'translateX(calc(-50% - 0.5rem))'};
  width: calc(100% - 1rem);
  max-width: calc(600px - 1rem);
  height: var(--space-8);
  padding: 0.5rem 0;
`;
const TopPlaceholder = styled.div`
  width: 100%;
  height: calc(var(--space-8) + var(--space-2));
`;

export const FullscreenPopup = fastMemo(({ disabled, onBack, onConfirm, onClose, children }) => {
  useEffect(() => {
    disableBodyScroll();

    return () => {
      enableBodyScroll();
    };
  }, []);

  return (
    <Wrapper>
      <Content>
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
      </Content>
    </Wrapper>
  );
});
