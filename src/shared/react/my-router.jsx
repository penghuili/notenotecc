import { Link } from '@radix-ui/themes';
import React, { useCallback, useEffect, useMemo } from 'react';
import { createCat, useCat } from 'usecat';

export const currentPathCat = createCat(window.location.pathname);
export const queryParamsCat = createCat(parseSearch(window.location.search));

listenToPopStateChange();

export const navigate = to => {
  if (isUrlChanged(to)) {
    window.history.pushState({}, '', to);
    updatePathAndQuery(to);
  }
};

export const replaceTo = to => {
  if (isUrlChanged(to)) {
    window.history.replaceState({}, '', to);
    updatePathAndQuery(to);
  }
};

export const goBack = () => window.history.back();

export const RouteLink = React.memo(({ to, children, mr, mb, mt, ml }) => {
  const handleClick = useCallback(
    e => {
      handleNavigateForLink(e, to);
    },
    [to]
  );

  return (
    <Link href={to} onClick={handleClick} mr={mr} mb={mb} mt={mt} ml={ml}>
      {children}
    </Link>
  );
});

export const CustomRouteLink = React.memo(({ to, children, mr, mb }) => {
  const handleClick = useCallback(
    e => {
      handleNavigateForLink(e, to);
    },
    [to]
  );

  return (
    <a
      href={to}
      onClick={handleClick}
      style={{ marginRight: mr && `var(--space-${mr})`, marginBottom: mb && `var(--space-${mb})` }}
    >
      {children}
    </a>
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

function handleNavigateForLink(e, to) {
  e.preventDefault();
  navigate(to);
}

function updatePathAndQuery(to) {
  const [path, search] = to.split('?');
  const query = parseSearch(search);
  currentPathCat.set(path);
  queryParamsCat.set(query);
}

function isUrlChanged(to) {
  const current = `${window.location.pathname}${window.location.search}`;
  return current !== to;
}
