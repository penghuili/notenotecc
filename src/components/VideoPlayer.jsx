import 'plyr/dist/plyr.css';

import Plyr from 'plyr';
import React, { useEffect, useRef } from 'react';

import { getVideoDuration } from '../lib/getVideoDuration';

export const VideoPlayer = React.memo(({ src, hidden, onLoad }) => {
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
        onLoad();
      });
  }, [onLoad, src]);

  return (
    <video
      ref={ref}
      controls
      muted
      style={{ display: hidden ? 'none' : 'block', width: '100%' }}
      preload="metadata"
    >
      <source src={src} type="video/webm" />
    </video>
  );
});
