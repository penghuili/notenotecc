import { createCat } from 'usecat';

import { isMobileBrowser } from '../shared/browser/device';

const facingModeCat = createCat(isMobileBrowser() ? 'environment' : 'user');
export const isUsingVideoStreamCat = createCat(false);
export const hasAudioCat = createCat(false);
export const videoStreamCat = createCat(null);
export const videoStreamErrorCat = createCat(null);

export async function requestVideoStream() {
  try {
    stopVideoStream();

    const facing = facingModeCat.get();
    const config = hasAudioCat.get()
      ? {
          video: {
            width: { ideal: 720 },
            height: { ideal: 720 },
            frameRate: 30,
            facingMode: { ideal: facing },
          },
          audio: true,
        }
      : {
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 900 },
            height: { ideal: 900 },
          },
        };

    const stream = await navigator.mediaDevices.getUserMedia(config);

    if (isUsingVideoStreamCat.get()) {
      videoStreamCat.set(stream);
      videoStreamErrorCat.set(null);
    } else {
      stopVideoStream();
    }
  } catch (error) {
    console.log(error);
    videoStreamCat.set(null);
    videoStreamErrorCat.set(error);
  }
}

export function stopVideoStream() {
  const stream = videoStreamCat.get();
  if (stream) {
    stream.getTracks().forEach(track => {
      track.stop();
      stream.removeTrack(track);
    });

    videoStreamCat.set(null);
  }
}

export function rotateCamera() {
  facingModeCat.set(facingModeCat.get() === 'user' ? 'environment' : 'user');

  requestVideoStream();
}

window.addEventListener('focus', () => {
  if (isUsingVideoStreamCat.get()) {
    requestVideoStream();
  }
});

window.addEventListener('blur', () => {
  if (isUsingVideoStreamCat.get()) {
    stopVideoStream();
  }
});
