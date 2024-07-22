import { createItemsCache } from '../../shared-private/react/cacheItems';
import { canvasToBlob } from '../../shared-private/react/canvasToBlob';
import { HTTP } from '../../shared-private/react/HTTP';
import { appName } from '../../shared-private/react/initShared';
import { md5 } from '../../shared-private/react/md5';
import { objectToQueryString } from '../../shared-private/react/routeHelpers';

export const noteCache = createItemsCache('notenotecc-note');

export async function fetchNotes(startKey, startTime, endTime) {
  try {
    const query = objectToQueryString({ startKey, startTime, endTime });
    const {
      items,
      startKey: newStartKey,
      limit,
    } = await HTTP.get(appName, `/v1/notes${query ? `?${query}` : ''}`);

    if (!startKey && !startTime && !endTime) {
      await noteCache.cacheItems(items);
    }

    return {
      data: { items: items, startKey: newStartKey, hasMore: items.length >= limit },
      error: null,
    };
  } catch (error) {
    return { data: null, error };
  }
}

export async function fetchNote(noteId) {
  try {
    const note = await HTTP.get(appName, `/v1/notes/${noteId}`);

    await noteCache.cacheItem(note.sortKey, note);

    return {
      data: note,
      error: null,
    };
  } catch (error) {
    return { data: null, error };
  }
}

async function uploadImages(canvases) {
  const blobs = await Promise.all(
    canvases.map(async c => {
      if (c?.tagName?.toUpperCase() === 'CANVAS') {
        const blob = await canvasToBlob(c, 'image/webp', 0.8);
        return { isImage: true, blob, size: blob.size };
      }
      return { isImage: false, blob: c, size: c.size };
    })
  );
  const names = await Promise.all(
    blobs.map(async b => {
      const hash = await md5(b.blob);
      return {
        name: b.isImage ? `${hash}.webp` : `${hash}.webm`,
        type: b.isImage ? 'image/webp' : 'video/webm',
      };
    })
  );
  const urls = await HTTP.post(appName, `/v1/upload-urls`, {
    images: names,
  });
  await Promise.all(
    blobs.map(async (blob, i) => {
      await fetch(urls[i].url, {
        method: 'PUT',
        body: blob.blob,
        headers: {
          'Content-Type': blob.isImage ? 'image/png' : 'video/webm',
          'Cache-Control': 'max-age=31536000,public',
        },
      });
    })
  );

  return urls.map((u, i) => ({
    path: u.path,
    size: blobs[i].size,
  }));
}

export async function createNote({ note, canvases, albumIds, albumDescription }) {
  try {
    const imagePathes = await uploadImages(canvases);

    const data = await HTTP.post(appName, `/v1/notes`, {
      note,
      images: imagePathes,
      albumIds: albumIds || [],
      albumDescription,
    });

    await updateCache(data, 'create');

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function updateNote(noteId, { note, albumIds, albumDescription }) {
  try {
    const data = await HTTP.put(appName, `/v1/notes/${noteId}`, {
      note,
      albumIds,
      albumDescription,
    });

    await updateCache(data, 'update');

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function deleteImage(noteId, imagePath) {
  try {
    const data = await HTTP.put(appName, `/v1/notes/${noteId}/images/delete`, {
      imagePath,
    });

    await updateCache(data, 'update');

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function addImages(noteId, canvases) {
  try {
    const imagePathes = await uploadImages(canvases);

    const data = await HTTP.put(appName, `/v1/notes/${noteId}/images/add`, {
      images: imagePathes,
    });

    await updateCache(data, 'update');

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function deleteNote(noteId) {
  try {
    const data = await HTTP.delete(appName, `/v1/notes/${noteId}`);

    await updateCache({ sortKey: noteId }, 'delete');

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

async function updateCache(note, type) {
  const cachedItems = (await noteCache.getCachedItems()) || [];

  let newItems = cachedItems;
  if (type === 'update') {
    newItems = cachedItems.map(item => (item.sortKey === note.sortKey ? note : item));
  } else if (type === 'delete') {
    newItems = cachedItems.filter(item => item.sortKey !== note.sortKey);
  } else if (type === 'create') {
    newItems = [note, ...cachedItems];
  }

  await noteCache.cacheItems(newItems);
}
