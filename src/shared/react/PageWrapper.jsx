import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  width: 100%;
  max-width: 600px;
  min-height: ${props => (props.hasMinHeight ? '105vh' : '0')};
  margin: 0 auto;
  padding: env(safe-area-inset-top) 0.5rem env(safe-area-inset-bottom);
  padding-bottom: 4rem;
  box-sizing: border-box;
`;

export function PageWrapper({ children, hasMinHeight }) {
  return <Wrapper hasMinHeight={hasMinHeight}>{children}</Wrapper>;
}
