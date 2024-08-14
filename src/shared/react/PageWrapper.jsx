import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  width: 100%;
  max-width: 600px;
  min-height: 105vh;
  margin: 0 auto;
  margin-bottom: 4rem;
  padding: 0 0.5rem;
  box-sizing: border-box;
`;

export function PageWrapper({ children }) {
  return <Wrapper>{children}</Wrapper>;
}
