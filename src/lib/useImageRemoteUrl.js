import { useEffect, useState } from 'react';

import { decryptBlob } from '../store/note/noteNetwork';
import { fetchFileWithUrl } from './fetchFileWithUrl';
import { imagePathToUrl } from './imagePathToUrl';

export const cachedImageUrls = {};

export function useImageRemoteUrl(encryptedPassword, path, type) {
  const [url, setUrl] = useState(cachedImageUrls[path]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!path || !encryptedPassword || cachedImageUrls[path]) {
      return;
    }

    setIsLoading(true);
    fetchFileWithUrl(imagePathToUrl(path), type)
      .then(data => decryptBlob(encryptedPassword, data.blob, type))
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob);
        setUrl(blobUrl);
        cachedImageUrls[path] = blobUrl;
      })
      .catch(e => {
        console.log(e);
        setUrl(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [encryptedPassword, path, type]);

  return { url, isLoading };
}
