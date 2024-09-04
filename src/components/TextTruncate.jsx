import React, { useEffect, useRef, useState } from 'react';
import fastMemo from 'react-fast-memo';
import styled from 'styled-components';

export const TextTruncate = fastMemo(({ children, maxLines = 6, showFullText, onClick }) => {
  const textRef = useRef(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    if (textRef.current) {
      setIsTruncated(textRef.current.offsetHeight < textRef.current.scrollHeight);
    }
  }, [children]);

  return (
    <Wrapper onClick={onClick}>
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
  line-height: var(--line-height-3);
  max-height: ${props =>
    props.showFullText ? 'none' : `calc(var(--line-height-3) * var(--max-lines))`};
`;
const FadeOut = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0) 30%, rgba(255, 255, 255, 1) 100%);
  cursor: pointer;
`;
