import React from 'react';
import { View, ImageSourcePropType, StyleSheet } from 'react-native';
import { Image } from 'react-native';
import AuntyPortrait from './AuntyPortrait';

interface AuntyAvatarProps {
  auntyId: string;
  size?: number;
  source?: ImageSourcePropType;
  // Pass world='council' for ink border, world='care' for canvas border (stacking overlap effect)
  world?: 'council' | 'care';
}

export default function AuntyAvatar({ auntyId, size = 56, source, world }: AuntyAvatarProps) {
  const borderColor = world === 'council' ? '#1a0f0a' : world === 'care' ? '#fef9f3' : undefined;

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        borderColor && {
          borderWidth: size > 40 ? 3 : 2,
          borderColor,
        },
      ]}
    >
      {source ? (
        <Image
          source={source}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          resizeMode="cover"
        />
      ) : (
        <AuntyPortrait auntyId={auntyId} size={size} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
