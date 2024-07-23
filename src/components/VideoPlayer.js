import 'plyr/dist/plyr.css';

import Plyr from 'plyr';
import React, { useRef } from 'react';

import { getVideoDuration } from '../lib/getVideoDuration';
import { useEffectOnce } from '../shared-private/react/hooks/useEffectOnce';

export default function VideoPlayer({ src, hidden, onLoad }) {
  const ref = useRef(null);
  useEffectOnce(() => {
    getVideoDuration(src)
      .catch(() => undefined)
      .then(duration => {
        new Plyr(ref.current, {
          controls: ['play', 'progress', 'current-time', 'mute', 'fullscreen'],
          seekTime: 3,
          muted: true,
          duration: duration || undefined,
        });
      });
  });

  return (
    <video
      ref={ref}
      controls
      muted
      onLoadedData={onLoad}
      style={{ display: hidden ? 'none' : 'block' }}
    >
      <source src={src} type="video/webm" />
    </video>
  );
}
