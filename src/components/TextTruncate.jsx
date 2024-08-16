import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

export const TextTruncate = React.memo(({ children, maxLines = 6, showFullText }) => {
  const textRef = useRef(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    if (textRef.current) {
      setIsTruncated(textRef.current.offsetHeight < textRef.current.scrollHeight);
    }
  }, [children]);

  return (
    <Wrapper>
      <Content ref={textRef} showFullText={showFullText} style={{ '--max-lines': maxLines }}>
        {children}
      </Content>
      {isTruncated && <FadeOut />}
    </Wrapper>
  );
});

const Wrapper = styled.div`
  position: relative;
  transition: max-height 0.3s ease;
`;
const Content = styled.div`
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.5rem;
  max-height: ${props => (props.showFullText ? 'none' : `calc(1.5rem * var(--max-lines))`)};
`;
const FadeOut = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 100%);
  pointer-events: none;
`;
