import { useEffect, useState } from 'react';

import { idbStorage } from '../shared/react/indexDB';

export function useImageLocalUrl(imageHash) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!imageHash) {
      return;
    }

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
      });
  }, [imageHash]);

  return url;
}
