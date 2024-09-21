import { useEffect, useState } from 'react';

import { idbStorage } from '../shared/browser/indexDB';

const cachedUrls = {};

export function useImageLocalUrl(imageHash) {
  const [url, setUrl] = useState(cachedUrls[imageHash]);
  const [imageBlob, setImageBlob] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!imageHash || cachedUrls[imageHash]) {
      return;
    }

    setIsLoading(true);
    idbStorage
      .getItem(imageHash)
      .then(blob => {
        if (blob) {
          setImageBlob(blob);
          const blobUrl = URL.createObjectURL(blob);
          setUrl(blobUrl);
          cachedUrls[imageHash] = blobUrl;
        }
      })
      .catch(e => {
        setUrl(null);
        console.log(e);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [imageHash]);

  return { url, blob: imageBlob, isLoading };
}
