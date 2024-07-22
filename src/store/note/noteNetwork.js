import { imagePathToUrl } from '../../lib/imagePathToUrl';
import { asyncForEach } from '../../shared-private/js/asyncForEach';
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

async function uploadImages(images) {
  const names = await Promise.all(
    images.map(async b => {
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
    images.map(async (image, i) => {
      await fetch(urls[i].url, {
        method: 'PUT',
        body: image.blob,
        headers: {
          'Content-Type': image.isImage ? 'image/webp' : 'video/webm',
          'Cache-Control': 'max-age=31536000,public',
        },
      });
    })
  );

  return urls.map((u, i) => ({
    path: u.path,
    size: images[i].size,
  }));
}

export async function convertNoteImages(note) {
  const pngImages = (note.images || []).filter(i => i.path.endsWith('.png'));

  const webpImages = await Promise.all(pngImages.map(i => convertPNG2Webp(imagePathToUrl(i.path))));
  const { data, error } = await addImages(note.sortKey, webpImages);
  let newNote = data;
  let newError = error;
  if (data) {
    await asyncForEach(pngImages, async i => {
      const { data: afterDeleteData, error: afterDeleteError } = await deleteImage(
        note.sortKey,
        i.path
      );
      if (afterDeleteData) {
        newNote = afterDeleteData;
      }
      if (afterDeleteError) {
        newError = afterDeleteError;
      }
    });
  }

  return { data: newNote, error: newError };
}

async function convertPNG2Webp(pngUrl) {
  const response = await fetch(pngUrl, { mode: 'cors' });
  const blob = await response.blob();
  const imageBitmap = await createImageBitmap(blob);

  const canvas = document.createElement('canvas');
  canvas.width = imageBitmap.width;
  canvas.height = imageBitmap.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(imageBitmap, 0, 0);

  const webpBlob = await canvasToBlob(canvas, 'image/webp', 0.8);
  return { blob: webpBlob, size: webpBlob.size, isImage: true };
}

export async function createNote({ note, images, albumIds, albumDescription }) {
  try {
    const uploadedImages = await uploadImages(images);

    const data = await HTTP.post(appName, `/v1/notes`, {
      note,
      images: uploadedImages,
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

export async function addImages(noteId, images) {
  try {
    const uploadedImages = await uploadImages(images);

    const data = await HTTP.put(appName, `/v1/notes/${noteId}/images/add`, {
      images: uploadedImages,
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
