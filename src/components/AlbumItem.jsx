import { DropdownMenu, Flex, IconButton } from '@radix-ui/themes';
import { RiDeleteBinLine, RiMore2Line, RiPencilLine } from '@remixicon/react';
import React, { useCallback } from 'react';
import { useCat } from 'usecat';

import { errorColor } from '../shared/react/AppWrapper.jsx';
import { RouteLink } from '../shared/react/my-router.jsx';
import { navigateEffect } from '../shared/react/store/sharedEffects';
import { isDeletingAlbumCat } from '../store/album/albumCats';
import { deleteAlbumEffect } from '../store/album/albumEffects';

export const AlbumItem = React.memo(({ album }) => {
  const isDeleting = useCat(isDeletingAlbumCat);

  const handleEdit = useCallback(() => {
    navigateEffect(`/albums/${album.sortKey}/edit`);
  }, [album.sortKey]);

  const handleDelete = useCallback(
    e => {
      e.stopPropagation();
      deleteAlbumEffect(album.sortKey, {});
    },
    [album.sortKey]
  );

  return (
    <Flex align="center" mr="3" mb="2">
      <RouteLink key={album.sortKey} to={`/albums/${album.sortKey}`}>
        #{album.title}
      </RouteLink>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <IconButton radius="full" ml="1" variant="soft">
            <RiMore2Line />
          </IconButton>
        </DropdownMenu.Trigger>

        <DropdownMenu.Content variant="soft">
          <DropdownMenu.Item onClick={handleEdit}>
            <RiPencilLine />
            Edit
          </DropdownMenu.Item>

          <DropdownMenu.Item onClick={handleDelete} color={errorColor} disabled={isDeleting}>
            <RiDeleteBinLine />
            Delete
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </Flex>
  );
});
