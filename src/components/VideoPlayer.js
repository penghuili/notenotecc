import 'plyr/dist/plyr.css';

import Plyr from 'plyr';
import React, { useRef } from 'react';

import { useEffectOnce } from '../shared-private/react/hooks/useEffectOnce';

export default function VideoPlayer({ src, duration }) {
  const ref = useRef(null);
  useEffectOnce(() => {
    new Plyr(ref.current, {
      controls: ['play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
      seekTime: 3,
      muted: true,
      duration: duration ? duration / 1000 : undefined,
    });
  });

  return (
    <video ref={ref} controls muted>
      <source src={src} type="video/webm" />
    </video>
  );
}
