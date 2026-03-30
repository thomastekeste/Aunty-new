import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { getAunty } from '../data/aunties';
import { fonts } from '../theme';

import NgozPortrait from './portraits/NgoziPortrait';
import MarciaPortrait from './portraits/MarciaPortrait';
import DenisePortrait from './portraits/DenisePortrait';
import FatouPortrait from './portraits/FatouPortrait';
import CarmenPortrait from './portraits/CarmenPortrait';
import AmaraPortrait from './portraits/AmaraPortrait';
import SalmaPortrait from './portraits/SalmaPortrait';

// SVG portrait map — hand-crafted editorial illustrations
// When real PNG illustrations are ready, drop them in /assets/portraits/[name].png
// and pass via the imageSource prop — zero code changes needed
const svgPortraits = {
  ngozi: NgozPortrait,
  marcia: MarciaPortrait,
  denise: DenisePortrait,
  fatou: FatouPortrait,
  carmen: CarmenPortrait,
  amara: AmaraPortrait,
  salma: SalmaPortrait,
};

export default function AuntyPortrait({ size = 56, aunty, imageSource, style }) {
  const auntyData = getAunty(aunty);
  if (!auntyData) return null;

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    overflow: 'hidden',
  };

  // Real PNG portrait takes priority when provided
  if (imageSource) {
    return (
      <View style={[containerStyle, style]}>
        <Image
          source={imageSource}
          style={{ width: size, height: size }}
          resizeMode="cover"
        />
      </View>
    );
  }

  // Render hand-crafted SVG portrait
  const SvgPortrait = svgPortraits[aunty];
  if (SvgPortrait) {
    return (
      <View style={[containerStyle, style]}>
        <SvgPortrait size={size} />
      </View>
    );
  }

  // Final fallback — initials
  const { bg, accent } = auntyData.colors;
  const fontSize = size * 0.38;
  return (
    <View style={[containerStyle, { backgroundColor: bg }, styles.placeholder, style]}>
      <Text style={[styles.initials, { fontSize, color: accent, fontFamily: fonts.heading }]}>
        {auntyData.initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    textAlign: 'center',
  },
});
