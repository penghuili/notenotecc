import { goBack } from 'react-baby-router';

import { albumDescriptionCat, albumSelectedKeysCat } from '../components/AlbumsSelector.jsx';
import { localStorageKeys } from '../lib/constants';
import { LocalStorage } from '../shared/browser/LocalStorage';
import { isLoggedInCat } from '../shared/browser/store/sharedCats.js';
import {
  createAlbumEffect,
  deleteAlbumEffect,
  updateAlbumEffect,
  updateAlbumsState,
} from './album/albumEffects';
import {
  addImagesEffect,
  createNoteEffect,
  deleteImageEffect,
  deleteNoteEffect,
  fetchHomeNotesEffect,
  forceFetchHomeNotesEffect,
  noteTimestamps,
  saveLocalNotesAndAlbumsEffect,
  updateNoteEffect,
  updateNoteStates,
} from './note/noteEffects';

export const actionTypes = {
  SAVE_LOCAL_NOTES_AND_ALBUMS: 'SAVE_LOCAL_NOTES_AND_ALBUMS',
  CREATE_NOTE: 'CREATE_NOTE',
  UPDATE_NOTE: 'UPDATE_NOTE',
  ADD_IMAGES: 'ADD_IMAGES',
  DELETE_IMAGE: 'DELETE_IMAGE',
  DELETE_NOTE: 'DELETE_NOTE',
  FETCH_NOTES: 'FETCH_NOTES',
  CREATE_ALBUM: 'CREATE_ALBUM',
  UPDATE_ALBUM: 'UPDATE_ALBUM',
  DELETE_ALBUM: 'DELETE_ALBUM',
};

const actionsQueue = [];

const actionHandlers = {
  [actionTypes.SAVE_LOCAL_NOTES_AND_ALBUMS]: {
    sync: () => {},
    async: async () => {
      await saveLocalNotesAndAlbumsEffect();
    },
  },

  [actionTypes.CREATE_NOTE]: {
    sync: ({ sortKey, timestamp, note, images, albumIds }) => {
      noteTimestamps.updateNotes = Date.now();
      const newNote = {
        sortKey,
        createdAt: timestamp,
        updatedAt: timestamp,
        note,
        images,
        albumIds,
        beforeLoggedIn: !isLoggedInCat.get(),
      };
      updateNoteStates(newNote, 'create');
    },
    async: async ({ sortKey, timestamp, note, images, albumIds }) => {
      await createNoteEffect({ sortKey, timestamp, note, images, albumIds });
    },
  },
  [actionTypes.UPDATE_NOTE]: {
    sync: payload => {
      const newNote = {
        ...payload,
        updatedAt: Date.now(),
        beforeLoggedIn: !isLoggedInCat.get(),
      };
      updateNoteStates(newNote, 'update');

      noteTimestamps.updateNotes = Date.now();
    },
    async: async ({ sortKey, encryptedPassword, note, albumIds }) => {
      await updateNoteEffect(sortKey, { encryptedPassword, note, albumIds });
    },
  },
  [actionTypes.ADD_IMAGES]: {
    sync: ({ images, newImages, ...rest }) => {
      const newNote = {
        ...rest,
        images: [...(images || []), ...(newImages || [])],
        updatedAt: Date.now(),
        beforeLoggedIn: !isLoggedInCat.get(),
      };
      updateNoteStates(newNote, 'update');

      noteTimestamps.updateNotes = Date.now();
    },
    async: async ({ sortKey, encryptedPassword, newImages }) => {
      await addImagesEffect(sortKey, { encryptedPassword, images: newImages });
    },
  },
  [actionTypes.DELETE_IMAGE]: {
    sync: ({ images, imagePath, ...rest }) => {
      const newNote = {
        ...rest,
        images: (images || []).filter(image => !(image.path || image.hash).includes(imagePath)),
        updatedAt: Date.now(),
        beforeLoggedIn: !isLoggedInCat.get(),
      };
      updateNoteStates(newNote, 'update');

      noteTimestamps.updateNotes = Date.now();
    },
    async: async ({ sortKey, imagePath }) => {
      await deleteImageEffect(sortKey, { imagePath });
    },
  },
  [actionTypes.DELETE_NOTE]: {
    sync: payload => {
      updateNoteStates(payload, 'delete');

      noteTimestamps.updateNotes = Date.now();

      if (payload.goBack) {
        goBack();
      }
    },
    async: async ({ sortKey }) => {
      await deleteNoteEffect(sortKey);
    },
  },
  [actionTypes.FETCH_NOTES]: {
    sync: () => {
      fetchHomeNotesEffect();

      noteTimestamps.fetchNotes = Date.now();
    },
    async: async () => {
      await forceFetchHomeNotesEffect();
    },
  },
  [actionTypes.CREATE_ALBUM]: {
    sync: ({ sortKey, timestamp, title }) => {
      const newAlbum = {
        sortKey,
        createdAt: timestamp,
        updatedAt: timestamp,
        title,
        beforeLoggedIn: !isLoggedInCat.get(),
      };
      updateAlbumsState(newAlbum, 'create');
      albumSelectedKeysCat.set([sortKey, ...albumSelectedKeysCat.get()]);
      albumDescriptionCat.set('');
    },
    async: async ({ sortKey, timestamp, title }) => {
      await createAlbumEffect({ sortKey, timestamp, title });
    },
  },
  [actionTypes.UPDATE_ALBUM]: {
    sync: payload => {
      const newNote = {
        ...payload,
        updatedAt: Date.now(),
        beforeLoggedIn: !isLoggedInCat.get(),
      };
      updateAlbumsState(newNote, 'update');
      if (payload.goBack) {
        goBack();
      }
    },
    async: async ({ sortKey, encryptedPassword, title, position }) => {
      await updateAlbumEffect(sortKey, { encryptedPassword, title, position });
    },
  },
  [actionTypes.DELETE_ALBUM]: {
    sync: payload => {
      updateAlbumsState(payload, 'delete');
      goBack();
    },
    async: async ({ sortKey }) => {
      await deleteAlbumEffect(sortKey);
    },
  },
};

export function dispatchAction({ type, payload }) {
  const handler = actionHandlers[type];
  if (!handler) {
    console.log(`no handler for ${type}`);
    return;
  }

  actionsQueue.push({ type, payload });
  LocalStorage.set(localStorageKeys.actions, actionsQueue);

  handler.sync(payload);

  processQueue();
}

let isProcessing = false;
async function processQueue() {
  if (isProcessing) {
    return;
  }

  isProcessing = true;
  while (actionsQueue[0]) {
    const { type, payload } = actionsQueue[0];
    await actionHandlers[type].async(payload);
    actionsQueue.shift();
    LocalStorage.set(localStorageKeys.actions, actionsQueue);
  }
  isProcessing = false;
}

export function loadActionsFromLocalStorage() {
  if (!isLoggedInCat.get()) {
    return;
  }

  if (actionsQueue.length > 0) {
    return;
  }

  const savedActions = LocalStorage.get(localStorageKeys.actions);
  if (savedActions?.length) {
    savedActions.forEach(action => {
      actionsQueue.push(action);
    });

    processQueue();
  }
}
