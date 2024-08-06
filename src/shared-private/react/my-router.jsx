import { Link } from '@radix-ui/themes';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createCat, useCat } from 'usecat';

export const currentPathCat = createCat(window.location.pathname);
export const queryParamsCat = createCat(parseSearch(window.location.search));

const routesState = {};

export const navigate = to => {
  window.history.pushState({}, '', to);
  const [path, search] = to.split('?');
  currentPathCat.set(path);
  queryParamsCat.set(parseSearch(search));
};

export const goBack = () => window.history.back();

export function useSetupRouter() {
  useEffect(() => {
    const handleLocationChange = () => {
      console.log('handleLocationChange');
      const { pathname, search } = window.location;
      currentPathCat.set(pathname);
      queryParamsCat.set(parseSearch(search));
    };

    window.addEventListener('popstate', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);
}

export const RouteLink = React.memo(({ to, children }) => {
  const handleClick = useCallback(
    e => {
      e.preventDefault();
      navigate(to);
    },
    [to]
  );

  return (
    <Link href={to} onClick={handleClick}>
      {children}
    </Link>
  );
});

export const Route = React.memo(({ path, component: Component }) => {
  const currentPath = useCat(currentPathCat);
  const queryParams = useCat(queryParamsCat);

  const routePath = useMemo(() => path.split('?')[0], [path]);
  const params = useMemo(() => getPathParams(currentPath, routePath), [currentPath, routePath]);

  if (params) {
    // eslint-disable-next-line react-compiler/react-compiler
    routesState[path] = true;

    return <Component pathParams={params} queryParams={queryParams} />;
  }

  routesState[path] = false;

  return null;
});

export const DefaultRoute = React.memo(({ to }) => {
  const currentPath = useCat(currentPathCat);

  const [showDefault, setShowDefault] = useState(false);

  useEffect(() => {
    if (Object.values(routesState).every(value => !value)) {
      setShowDefault(true);
    } else {
      setShowDefault(false);
    }
  }, [currentPath]);

  if (showDefault) {
    return <Redirect to={to} />;
  }

  return null;
});

export const Redirect = React.memo(({ to }) => {
  useEffect(() => {
    navigate(to);
  }, [to]);

  return null;
});

function getPathParams(pathname, routePath) {
  const routeParts = routePath.split('/');
  const pathParts = pathname.split('/');

  if (routeParts.length !== pathParts.length) {
    return null;
  }

  const params = {};
  const match = routeParts.every((routePart, index) => {
    if (routePart.startsWith(':')) {
      params[routePart.slice(1)] = pathParts[index];
      return true;
    }
    return routePart === pathParts[index];
  });

  return match ? params : null;
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
