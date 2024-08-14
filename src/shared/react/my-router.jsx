import { Link } from '@radix-ui/themes';
import React, { useCallback, useEffect, useMemo } from 'react';
import { createCat, useCat } from 'usecat';

export const currentPathCat = createCat(window.location.pathname);
export const queryParamsCat = createCat(parseSearch(window.location.search));

listenToPopStateChange();

export const navigate = to => {
  window.history.pushState({}, '', to);
  const [path, search] = to.split('?');
  currentPathCat.set(path);
  queryParamsCat.set(parseSearch(search));
};

export const replaceTo = to => {
  window.history.replaceState({}, '', to);
  const [path, search] = to.split('?');
  currentPathCat.set(path);
  queryParamsCat.set(parseSearch(search));
};

export const goBack = () => window.history.back();

export const RouteLink = React.memo(({ to, children, mr }) => {
  const handleClick = useCallback(
    e => {
      e.preventDefault();
      navigate(to);
    },
    [to]
  );

  return (
    <Link href={to} onClick={handleClick} mr={mr}>
      {children}
    </Link>
  );
});

export const Routes = React.memo(({ routes, defaultRoute = '/' }) => {
  const currentPath = useCat(currentPathCat);
  const queryParams = useCat(queryParamsCat);

  const route = useMemo(() => {
    const route = routes.find(({ path }) => matchPath(currentPath, path));
    if (!route) {
      return null;
    }

    const { path, component: Component } = route;
    const pathParams = getPathParams(currentPath, path);
    return <Component pathParams={pathParams} queryParams={queryParams} />;
  }, [currentPath, queryParams, routes]);

  useEffect(() => {
    if (!route) {
      navigate(defaultRoute);
    }
  }, [defaultRoute, route]);

  return route;
});

function matchPath(realPath, routePath) {
  const routeParts = routePath.split('/');
  const pathParts = realPath.split('/');

  if (routeParts.length !== pathParts.length) {
    return false;
  }

  return routeParts.every((routePart, index) => {
    if (routePart.startsWith(':')) {
      return true;
    }
    return routePart === pathParts[index];
  });
}

function getPathParams(pathname, routePath) {
  const routeParts = routePath.split('/');
  const pathParts = pathname.split('/');

  if (routeParts.length !== pathParts.length) {
    return {};
  }

  const params = {};
  routeParts.forEach((routePart, index) => {
    if (routePart.startsWith(':')) {
      params[routePart.slice(1)] = pathParts[index];
    }
  });

  return params;
}

function parseSearch(search) {
  const obj = {};

  if (search) {
    const searchParams = new URLSearchParams(search);
    searchParams.forEach((value, key) => {
      obj[key] = value;
    });
  }

  return obj;
}

function listenToPopStateChange() {
  const handleLocationChange = () => {
    const { pathname, search } = window.location;
    currentPathCat.set(pathname);
    queryParamsCat.set(parseSearch(search));
  };

  window.addEventListener('popstate', handleLocationChange);
}
