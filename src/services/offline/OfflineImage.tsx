import React, { useEffect, useState } from 'react';
import { Image as NativeImage } from 'react-native';
import type { ImageProps } from 'react-native';
import { mapAssets } from './assets';
import { hasNetwork } from './connectivity';

/** Usa archivos completos del dispositivo; conserva recursos require() empaquetados. */
export function OfflineImage(props: ImageProps) {
  const [source, setSource] = useState(props.source);
  useEffect(() => {
    let active = true;
    setSource(props.source);
    if (props.source && !Array.isArray(props.source) && typeof props.source === 'object' && props.source.uri) {
      const original = props.source;
      void (async () => {
        const cached = await mapAssets(original);
        if (active) setSource(cached);
        if (await hasNetwork()) {
          const downloaded = await mapAssets(original, true);
          if (active) setSource(downloaded);
        }
      })().catch(() => {});
    }
    return () => { active = false; };
  }, [typeof props.source === 'object' && !Array.isArray(props.source) ? props.source?.uri : props.source]);
  return <NativeImage {...props} source={source} />;
}
