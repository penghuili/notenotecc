import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  width: 100%;
  max-width: 600px;
  min-height: ${props => (props.hasMinHeight ? '105vh' : '0')};
  margin: 0 auto;
  margin-bottom: ${props => (props.hasMinHeight ? '4rem' : '0')};
  padding: 0 0.5rem;
  box-sizing: border-box;
`;

export function PageWrapper({ children, hasMinHeight }) {
  return <Wrapper hasMinHeight={hasMinHeight}>{children}</Wrapper>;
}
