import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: ${props => (props.hidden ? 'none' : 'flex')};
  justify-content: center;
  align-items: center;
  padding: 0.5rem;
`;

export const AudioPlayer = React.memo(({ src, hidden, onLoaded }) => {
  return (
    <Wrapper hidden={hidden}>
      <audio controls preload="metadata" onLoadedData={onLoaded}>
        <source src={src} type="audio/webm" />
      </audio>
    </Wrapper>
  );
});
