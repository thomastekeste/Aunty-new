import React, { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@/types';
import { useOnboarding } from '@/context/OnboardingContext';
import ConsultationShell from '@/components/ConsultationShell';
import OptionCard from '@/components/OptionCard';
import Button from '@/components/Button';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ScalpConcerns'>;
const OPTIONS: Array<{ label: string; icon: string; color: string }> = [
  { label: 'No concerns', icon: '✅', color: '#12C064' },
  { label: 'Dryness', icon: '🌵', color: '#FB5607' },
  { label: 'Itchiness', icon: '⚡', color: '#F5C542' },
  { label: 'Dandruff', icon: '❄️', color: '#00B4D8' },
  { label: 'Thinning', icon: '🍂', color: '#9B5DE5' },
  { label: 'Oiliness', icon: '💧', color: '#0BBFAA' },
];

export default function ScalpConcernsScreen({ navigation }: Props) {
  const { data, setData } = useOnboarding();
  const [selected, setSelected] = useState<string[]>(data.scalp_concerns ?? []);

  const toggle = (item: string) => {
    if (item === 'No concerns') {
      setSelected(['No concerns']);
      return;
    }
    setSelected(prev => {
      const withoutNone = prev.filter(s => s !== 'No concerns');
      return withoutNone.includes(item)
        ? withoutNone.filter(s => s !== item)
        : [...withoutNone, item];
    });
  };

  return (
    <ConsultationShell
      step={17}
      totalSteps={18}
      auntyId="6"
      auntyMessage="Strong roots start with a healthy scalp. What are you dealing with up there?"
      question="Any scalp concerns? Select all that apply."
      onBack={() => navigation.goBack()}
      footer={
        <Button
          label="Continue"
          onPress={() => { setData({ scalp_concerns: selected }); navigation.navigate('TimeAvailable'); }}
        />
      }
    >
      {OPTIONS.map(opt => (
        <OptionCard key={opt.label} label={opt.label} selected={selected.includes(opt.label)} onPress={() => toggle(opt.label)} multiSelect icon={opt.icon} color={opt.color} />
      ))}
    </ConsultationShell>
  );
}
