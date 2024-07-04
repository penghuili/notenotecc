import { IconButton } from '@radix-ui/themes/dist/cjs/index.js';
import { RiCameraLine, RiCheckLine } from '@remixicon/react';
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
    <div>
      <FilePicker accept="image/*" takePhoto onSelect={setImage} height="auto">
        <IconButton size="4">
          <RiCameraLine />
        </IconButton>
      </FilePicker>

      <div ref={editorRef} />

      {image && (
        <IconButton
          size="4"
          onClick={async () => {
            const canvas = await croptRef.current.toCanvas(900);
            onSelect({ canvas, imageUrl: url });
          }}
        >
          <RiCheckLine />
        </IconButton>
      )}
    </div>
  );
}
