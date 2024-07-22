export function getVideoDuration(videoBlob) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(videoBlob);

    const video = document.createElement('video');

    video.addEventListener('loadedmetadata', () => {
      if (isFinite(video.duration)) {
        resolve(video.duration);
      } else {
        reject(new Error('Unable to determine video duration.'));
      }

      URL.revokeObjectURL(url);
    });

    video.addEventListener('error', error => {
      reject(new Error(`Error loading video: ${error.message}`));
      URL.revokeObjectURL(url);
    });

    video.src = url;
  });
}
