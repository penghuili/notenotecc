import React from 'react';
import fastMemo from 'react-fast-memo';

import { Draw } from '../components/Draw.jsx';

export const Demo = fastMemo(() => {
  return <Draw />;
});
