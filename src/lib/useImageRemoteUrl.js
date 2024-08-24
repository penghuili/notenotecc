import { useEffect, useState } from 'react';

import { decryptBlob } from '../store/note/noteNetwork';
import { fetchFileWithUrl } from './fetchFileWithUrl';
import { imagePathToUrl } from './imagePathToUrl';

export function useImageRemoteUrl(encryptedPassword, path, type) {
  const [url, setUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!path || !encryptedPassword) {
      return;
    }

    setIsLoading(true);
    fetchFileWithUrl(imagePathToUrl(path), type)
      .then(data => decryptBlob(encryptedPassword, data.blob, type))
      .then(blob => {
        setUrl(URL.createObjectURL(blob));
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
