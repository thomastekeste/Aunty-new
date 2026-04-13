/**
 * TypewriterText — Spring-physics word reveal.
 * Maps legacy `speed` prop to stagger timing.
 */

import React, { memo } from 'react';
import { WordReveal } from './WordReveal';

interface Props {
  text: string;
  speed?: number;
  onComplete?: () => void;
  style?: any;
}

export const TypewriterText = memo(function TypewriterText({
  text,
  speed = 65,
  onComplete,
  style,
}: Props) {
  return (
    <WordReveal
      text={text}
      stagger={speed}
      onComplete={onComplete}
      style={style}
    />
  );
});
