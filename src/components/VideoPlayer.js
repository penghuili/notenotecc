import 'plyr/dist/plyr.css';

import Plyr from 'plyr';
import React, { useEffect, useRef } from 'react';

import { getVideoDuration } from '../lib/getVideoDuration';

export default function VideoPlayer({ src, hidden, onLoad }) {
  const ref = useRef(null);

  useEffect(() => {
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
  }, [src]);

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
