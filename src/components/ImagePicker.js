import { Flex, IconButton } from '@radix-ui/themes';
import { RiArrowDownDoubleLine, RiImageAddLine } from '@remixicon/react';
import { Cropt } from 'cropt';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { FilePicker } from './FilePicker';

export function ImagePicker({ onSelect }) {
  const editorRef = useRef(null);
  const croptRef = useRef(null);
  const [image, setImage] = useState(null);

  const url = useMemo(() => (image ? URL.createObjectURL(image) : null), [image]);

  useEffect(() => {
    if (!url) {
      return;
    }

    const cropt = new Cropt(editorRef.current, {
      viewport: {
        width: 300,
        height: 300,
        type: 'square',
      },
    });
    cropt.bind(url);
    croptRef.current = cropt;

    return () => {
      cropt.destroy();
    };
  }, [url]);

  return (
    <Flex direction="column">
      <FilePicker accept="image/*" takePhoto={false} onSelect={setImage} height="auto">
        <IconButton size="4">
          <RiImageAddLine />
        </IconButton>
      </FilePicker>

      <div ref={editorRef} style={{ marginTop: '8px' }} />

      {image && (
        <IconButton
          size="4"
          onClick={async () => {
            const canvas = await croptRef.current.toCanvas(900);
            const imageUrl = canvas.toDataURL('image/png');
            onSelect({ canvas, url: imageUrl });
            setImage(null);
          }}
          mt="2"
        >
          <RiArrowDownDoubleLine />
        </IconButton>
      )}
    </Flex>
  );
}
