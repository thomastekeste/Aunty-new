import React, { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList, ProtectiveStyling } from '@/types';
import { useOnboarding } from '@/context/OnboardingContext';
import ConsultationShell from '@/components/ConsultationShell';
import OptionCard from '@/components/OptionCard';
import Button from '@/components/Button';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ProtectiveStyling'>;
const OPTIONS: Array<{ label: string; value: ProtectiveStyling; icon: string; color: string }> = [
  { label: 'Yes, regularly — braids, twists, wigs', value: 'yes_regularly', icon: '👑', color: '#F72585' },
  { label: 'Sometimes', value: 'sometimes', icon: '🔄', color: '#F5C542' },
  { label: 'Never', value: 'never', icon: '💆', color: '#9B5DE5' },
];

export default function ProtectiveStylingScreen({ navigation }: Props) {
  const { data, setData } = useOnboarding();
  const [selected, setSelected] = useState<ProtectiveStyling | null>(data.protective_styling ?? null);

  return (
    <ConsultationShell
      step={16}
      totalSteps={18}
      auntyId="4"
      auntyMessage="Protective styling affects everything — how we build your routine, what products we recommend."
      question="Do you use protective styles?"
      onBack={() => navigation.goBack()}
      footer={
        <Button
          label="Continue"
          onPress={() => { if (selected) { setData({ protective_styling: selected }); navigation.navigate('ScalpConcerns'); } }}
          disabled={!selected}
        />
      }
    >
      {OPTIONS.map(opt => (
        <OptionCard key={opt.value} label={opt.label} selected={selected === opt.value} onPress={() => setSelected(opt.value)} icon={opt.icon} color={opt.color} />
      ))}
    </ConsultationShell>
  );
}
