import React, { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@/types';
import { useOnboarding } from '@/context/OnboardingContext';
import ConsultationShell from '@/components/ConsultationShell';
import OptionCard from '@/components/OptionCard';
import Button from '@/components/Button';
import { ShieldCheckIcon, DryIcon, ScalpIcon, SnowflakeIcon, ThinningIcon, OilIcon } from '@/components/Icons';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ScalpConcerns'>;

const OPTIONS = [
  { label: 'No concerns', icon: <ShieldCheckIcon color="#12C064" size={22} strokeWidth={2} />, color: '#12C064' },
  { label: 'Dryness', icon: <DryIcon color="#FB5607" size={22} strokeWidth={1.8} />, color: '#FB5607' },
  { label: 'Itchiness', icon: <ScalpIcon color="#F5C542" size={22} strokeWidth={1.8} />, color: '#F5C542' },
  { label: 'Dandruff', icon: <SnowflakeIcon color="#00B4D8" size={22} strokeWidth={1.6} />, color: '#00B4D8' },
  { label: 'Thinning', icon: <ThinningIcon color="#9B5DE5" size={22} strokeWidth={2} />, color: '#9B5DE5' },
  { label: 'Oiliness', icon: <OilIcon color="#0BBFAA" size={22} strokeWidth={2} />, color: '#0BBFAA' },
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
      step={14}
      totalSteps={18}
      auntyId="2"
      phaseBadge="Marcia's Turn · Root Whisperer"
      auntyMessage="Last thing from mi — strong roots start with a healthy scalp. What are you dealing with up there? Everything yuh tell mi stays between us."
      question="Any scalp concerns? Select all that apply."
      onBack={() => navigation.goBack()}
      footer={
        <Button
          label="Continue"
          onPress={() => {
            setData({ scalp_concerns: selected });
            navigation.navigate('PrimaryGoal');
          }}
        />
      }
    >
      {OPTIONS.map(opt => (
        <OptionCard
          key={opt.label}
          label={opt.label}
          selected={selected.includes(opt.label)}
          onPress={() => toggle(opt.label)}
          multiSelect
          icon={opt.icon}
          color={opt.color}
        />
      ))}
    </ConsultationShell>
  );
}
