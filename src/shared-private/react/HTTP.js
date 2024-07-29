import { apps } from '../js/apps';
import { eventEmitter } from './eventEmitter';
import { appName } from './initShared';
import { LocalStorage, sharedLocalStorageKeys } from './LocalStorage';
import { toastTypes } from './store/sharedAtoms';
import { resetEffect, setToastEffect } from './store/sharedEffects';

const serverToUrl = {
  [apps['100rejections'].name]: import.meta.env.VITE_100REJECTIONS_API_URL,
  [apps.Puppeteer.name]: import.meta.env.VITE_PUPPETEER_API_URL,
  [apps['remiind.cc'].name]: import.meta.env.VITE_REMIINDCC_API_URL,
  [apps.simplestcam.name]: import.meta.env.VITE_SIMPLESTCAM_API_URL,
};

function getFullUrl(server, path) {
  return `${serverToUrl[server]}${path}`;
}

let isRefreshing = false;

export const HTTP = {
  async publicGet(server, path) {
    try {
      const response = await fetch(getFullUrl(server, path));
      if (!response.ok) throw response;
      return await response.json();
    } catch (error) {
      throw HTTP.handleError(error);
    }
  },
  async publicPost(server, path, body) {
    try {
      const response = await fetch(getFullUrl(server, path), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw response;
      return await response.json();
    } catch (error) {
      throw HTTP.handleError(error);
    }
  },
  async publicPut(server, path, body) {
    try {
      const response = await fetch(getFullUrl(server, path), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw response;
      return await response.json();
    } catch (error) {
      throw HTTP.handleError(error);
    }
  },

  async post(server, path, body, headers = {}) {
    try {
      await HTTP.refreshTokenIfNecessary();
      const accessToken = LocalStorage.get(sharedLocalStorageKeys.accessToken);
      const response = await fetch(getFullUrl(server, path), {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw response;
      return await response.json();
    } catch (error) {
      throw HTTP.handleError(error);
    }
  },
  async get(server, path) {
    try {
      await HTTP.refreshTokenIfNecessary();
      const accessToken = LocalStorage.get(sharedLocalStorageKeys.accessToken);
      const response = await fetch(getFullUrl(server, path), {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) throw response;
      return await response.json();
    } catch (error) {
      throw HTTP.handleError(error);
    }
  },
  async put(server, path, body) {
    try {
      await HTTP.refreshTokenIfNecessary();
      const accessToken = LocalStorage.get(sharedLocalStorageKeys.accessToken);
      const response = await fetch(getFullUrl(server, path), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw response;
      return await response.json();
    } catch (error) {
      throw HTTP.handleError(error);
    }
  },
  async delete(server, path) {
    try {
      await HTTP.refreshTokenIfNecessary();
      const accessToken = LocalStorage.get(sharedLocalStorageKeys.accessToken);
      const response = await fetch(getFullUrl(server, path), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) throw response;
      return await response.json();
    } catch (error) {
      throw HTTP.handleError(error);
    }
  },

  handleError(error) {
    const status = error.status;
    const errorCode = error.statusText;
    if (status === 401) {
      LocalStorage.resetTokens();
      resetEffect();
    }

    if (status === 403) {
      setToastEffect('You do not have access.', toastTypes.critical);
    }

    return { status, errorCode };
  },

  async refreshTokenIfNecessary(validWindow = 0) {
    if (isRefreshing) {
      await HTTP.waitForRefresh();
      return;
    }

    const expiresAt = LocalStorage.get(sharedLocalStorageKeys.accessTokenExpiresAt);
    const refreshToken = LocalStorage.get(sharedLocalStorageKeys.refreshToken);
    const accessToken = LocalStorage.get(sharedLocalStorageKeys.accessToken);
    if (!refreshToken || !accessToken || !expiresAt) {
      throw { response: { status: 401 } };
    }

    if (expiresAt > Date.now() + validWindow) {
      return;
    }

    isRefreshing = true;
    const data = await HTTP.publicPost(appName, `/v1/user/sign-in/refresh`, {
      refreshToken,
    });
    LocalStorage.saveTokens(data);
    isRefreshing = false;
    eventEmitter.emit('refreshed');
  },

  async waitForRefresh() {
    return new Promise(resolve => {
      eventEmitter.once('refreshed', () => {
        resolve(true);
      });
    });
  },
};
