import { getHook } from './hooksOutside';

export const routeHelpers = {
  navigate: path => {
    const [location, setLocation] = getHook('location');
    if (path === location) {
      return;
    }

    setLocation(path, { replace: false });
  },
  replace: path => {
    const [location, setLocation] = getHook('location');
    if (path === location) {
      return;
    }

    setLocation(path, { replace: true });
  },
  goBack() {
    if (history.length > 1) {
      history.back();
    } else {
      routeHelpers.navigate('/');
    }
  },
};

export function getQueryParams() {
  const obj = {};

  const searchParams = new URLSearchParams(window.location.search);
  searchParams.forEach((value, key) => {
    obj[key] = value;
  });

  return obj;
}

export function objectToQueryString(obj) {
  const searchParams = new URLSearchParams();
  Object.keys(obj)
    .filter(key => obj[key] !== undefined && obj[key] !== null)
    .forEach(key => {
      searchParams.set(key, obj[key]);
    });

  return searchParams.toString();
}
