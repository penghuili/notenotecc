import { Link } from '@radix-ui/themes';
import React, { useCallback, useEffect, useState } from 'react';
import { createCat } from 'usecat';

let renderPage = () => {};

export const currentPathCat = createCat(window.location.pathname);

listenToPopStateChange();

export const navigate = to => {
  if (isUrlChanged(to)) {
    window.history.pushState({}, '', to);
    renderPage();
  }
};

export const replaceTo = to => {
  if (isUrlChanged(to)) {
    window.history.replaceState({}, '', to);
    renderPage();
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
  const [page, setPage] = useState(getPageComponent(routes));

  useEffect(() => {
    renderPage = () => {
      setPage(getPageComponent(routes));
    };
    renderPage();
  }, [routes]);

  useEffect(() => {
    if (!page) {
      navigate(defaultRoute);
    }
  }, [defaultRoute, page]);

  return page;
});

export function parseSearch(search) {
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
    renderPage();
  };

  window.addEventListener('popstate', handleLocationChange);
}

function handleNavigateForLink(e, to) {
  e.preventDefault();
  navigate(to);
}

function isUrlChanged(to) {
  const current = `${window.location.pathname}${window.location.search}`;
  return current !== to;
}

function getPageComponent(routes) {
  const { pathname, search } = window.location;

  if (routes[pathname]) {
    const Component = routes[pathname];
    const queryParams = parseSearch(search);
    return <Component queryParams={queryParams} />;
  }

  return null;
}
