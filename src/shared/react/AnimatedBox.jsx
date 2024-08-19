import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.2s ease-in-out;
`;

export function AnimatedBox({ visible, children }) {
  const contentRef = useRef(null);

  useEffect(() => {
    const content = contentRef.current;
    let timerId;
    if (visible) {
      content.style.maxHeight = `${content.scrollHeight}px`;
    } else {
      contentRef.current.style.maxHeight = `${content.scrollHeight}px`;
      timerId = setTimeout(() => {
        contentRef.current.style.maxHeight = '0';
      }, 10);
    }

    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [visible]);

  function handleTransitionEnd() {
    const content = contentRef.current;
    if (visible) {
      content.style.maxHeight = 'none';
    }
  }

  return (
    <Wrapper ref={contentRef} onTransitionEnd={handleTransitionEnd}>
      {children}
    </Wrapper>
  );
}
