import React, { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList, ProtectiveStyling } from '@/types';
import { useOnboarding } from '@/context/OnboardingContext';
import ConsultationShell from '@/components/ConsultationShell';
import OptionCard from '@/components/OptionCard';
import Button from '@/components/Button';
import { BraidIcon, TransitionIcon, LeafIcon } from '@/components/Icons';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ProtectiveStyling'>;

const OPTIONS = [
  { label: 'Yes, regularly — braids, twists, wigs', value: 'yes_regularly' as ProtectiveStyling, icon: <BraidIcon color="#F72585" size={22} strokeWidth={2} />, color: '#F72585' },
  { label: 'Sometimes', value: 'sometimes' as ProtectiveStyling, icon: <TransitionIcon color="#F5C542" size={22} strokeWidth={2} />, color: '#F5C542' },
  { label: 'Never', value: 'never' as ProtectiveStyling, icon: <LeafIcon color="#9B5DE5" size={22} strokeWidth={2} />, color: '#9B5DE5' },
];

export default function ProtectiveStylingScreen({ navigation }: Props) {
  const { data, setData } = useOnboarding();
  const [selected, setSelected] = useState<ProtectiveStyling | null>(data.protective_styling ?? null);

  return (
    <ConsultationShell
      step={17}
      totalSteps={18}
      auntyId="1"
      phaseBadge="Ngozi's Turn · Moisture Authority"
      auntyMessage="Protective styling is one of my best moisture strategies — keeps ends tucked, reduces breakage. Do you use it? This changes what I build for you."
      question="Do you use protective styles?"
      onBack={() => navigation.goBack()}
      footer={
        <Button
          label="Continue"
          onPress={() => {
            if (selected) {
              setData({ protective_styling: selected });
              navigation.navigate('TimeAvailable');
            }
          }}
          disabled={!selected}
        />
      }
    >
      {OPTIONS.map(opt => (
        <OptionCard
          key={opt.value}
          label={opt.label}
          selected={selected === opt.value}
          onPress={() => setSelected(opt.value)}
          icon={opt.icon}
          color={opt.color}
        />
      ))}
    </ConsultationShell>
  );
}
