export function getVideoDuration(videoUrl) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = function () {
      if (video.duration !== Infinity) {
        resolve(video.duration);
      } else {
        // If duration is Infinity, we'll try to seek to the end to get the real duration
        video.currentTime = Number.MAX_SAFE_INTEGER;
        video.ontimeupdate = function () {
          if (video.currentTime === 0) {
            // Seeking failed, duration is not available
            reject('Unable to determine video duration');
          } else {
            resolve(video.duration);
          }
          video.ontimeupdate = null;
        };
      }
    };

    video.onerror = function () {
      reject('Error loading video');
    };

    video.src = videoUrl;
  });
}

export function getVideoPreviewImage(videoUrl) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = function () {
      const canvas = document.createElement('canvas');
      canvas.width = 720;
      canvas.height = 720;

      // Seek to a specific time  for the preview
      video.currentTime = 0.5;

      video.addEventListener(
        'seeked',
        () => {
          // Draw the current frame to the canvas
          canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

          resolve(canvas.toDataURL('image/webp'));
        },
        { once: true }
      );
    };

    video.onerror = function () {
      reject('Error loading video');
    };

    video.src = videoUrl;
  });
}
