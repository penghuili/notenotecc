import { useEffect, useState } from 'react';

import { idbStorage } from '../shared/react/indexDB';

export function useImageLocalUrl(imageHash) {
  const [url, setUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!imageHash) {
      return;
    }

    setIsLoading(true);
    idbStorage
      .getItem(imageHash)
      .then(blob => {
        if (blob) {
          setUrl(URL.createObjectURL(blob));
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

  return { url, isLoading };
}
