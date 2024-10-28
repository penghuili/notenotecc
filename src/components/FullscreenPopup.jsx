import { RiArrowLeftLine, RiCheckLine, RiCloseLine } from '@remixicon/react';
import React, { useEffect } from 'react';
import fastMemo from 'react-fast-memo';
import styled from 'styled-components';

import { disableBodyScroll, enableBodyScroll } from '../shared/browser/bodySccroll';
import { isMobileWidth } from '../shared/browser/device';
import { widthWithoutScrollbar } from '../shared/browser/getScrollbarWidth';
import { Flex } from '../shared/semi/Flex';
import { IconButton } from '../shared/semi/IconButton';

const Wrapper = styled.div`
  position: fixed;
  top: env(safe-area-inset-top);
  left: 0;
  z-index: 3000;

  width: ${widthWithoutScrollbar}px;
  height: calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom));
  overflow: hidden;

  background-color: var(--semi-color-bg-0);
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
const TopPlaceholder = styled.div`
  width: 100%;
  height: 3.5rem;
`;

export const FullscreenPopup = fastMemo(
  ({ alwaysDark, disabled, onBack, onConfirm, onClose, children }) => {
    useEffect(() => {
      disableBodyScroll();

      return () => {
        enableBodyScroll();
      };
    }, []);

    return (
      <Wrapper className={alwaysDark ? 'semi-always-dark' : ''}>
        <Content>
          <Flex
            direction="row"
            justify="between"
            style={{
              position: 'fixed',
              top: 0,
              left: '50%',
              transform: `${isMobileWidth() ? 'translateX(-50%)' : 'translateX(calc(-50% - 0.5rem))'}`,
              width: 'calc(100% - 1rem)',
              maxWidth: 'calc(600px - 1rem)',
              height: '3rem',
              padding: '0.5rem 0',
            }}
          >
            {onBack ? (
              <IconButton
                theme="borderless"
                onClick={onBack}
                disabled={disabled}
                icon={<RiArrowLeftLine />}
              />
            ) : (
              <>
                <IconButton onClick={onClose} disabled={disabled} icon={<RiCloseLine />} />

                <IconButton
                  theme="solid"
                  onClick={onConfirm}
                  disabled={disabled}
                  icon={<RiCheckLine />}
                />
              </>
            )}
          </Flex>
          <TopPlaceholder />

          {children}
        </Content>
      </Wrapper>
    );
  }
);
