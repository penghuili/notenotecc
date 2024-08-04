import { useCallback, useEffect, useRef } from 'react';

import { useAlbumsObject } from '../store/album/albumCats';

export function useGetNoteAlbums() {
  const albumsObject = useAlbumsObject();

  const albumsForNotes = useRef({});

  const getNoteAlbums = useCallback(
    note => {
      const key = note?.albumIds
        ?.map(a => a.albumId)
        ?.filter(id => !id.startsWith('album_noalbum_'))
        ?.join('-');

      if (!key) {
        return undefined;
      }

      if (!albumsForNotes.current[key]) {
        const noteAlbums = note.albumIds.map(a => albumsObject[a.albumId]).filter(Boolean);
        if (noteAlbums.length) {
          albumsForNotes.current[key] = noteAlbums;
          return noteAlbums;
        }

        return undefined;
      }

      return albumsForNotes.current[key];
    },
    [albumsObject]
  );

  useEffect(() => {
    albumsForNotes.current = {};
  }, [albumsObject]);

  return getNoteAlbums;
}
