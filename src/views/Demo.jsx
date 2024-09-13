import React from 'react';
import fastMemo from 'react-fast-memo';

import { TikTokCards } from '../components/TikTokCards/TikTokCards.jsx';

const cardContents = [
  <div
    key="card1"
    style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'red',
    }}
  >
    Card 1
  </div>,
  <div
    key="card2"
    style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'blue',
    }}
  >
    Card 2
  </div>,
  <div
    key="card3"
    style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'green',
    }}
  >
    Card 3
  </div>,
  <div
    key="card4"
    style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'purple',
    }}
  >
    Card 4
  </div>,
];

export const Demo = fastMemo(() => {
  return <TikTokCards cards={cardContents} height="80vh" />;
});
