import React, { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList, RelaxerHistory } from '@/types';
import { useOnboarding } from '@/context/OnboardingContext';
import ConsultationShell from '@/components/ConsultationShell';
import OptionCard from '@/components/OptionCard';
import Button from '@/components/Button';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'RelaxerHistory'>;
const OPTIONS: Array<{ label: string; value: RelaxerHistory; icon: string; color: string }> = [
  { label: 'Never relaxed', value: 'never_relaxed', icon: '🌱', color: '#12C064' },
  { label: 'Currently relaxed', value: 'currently_relaxed', icon: '💆', color: '#9B5DE5' },
  { label: 'Transitioning — growing out a relaxer', value: 'transitioning', icon: '🔄', color: '#F5C542' },
  { label: 'Big chopped', value: 'big_chopped', icon: '✂️', color: '#F72585' },
];

export default function RelaxerHistoryScreen({ navigation }: Props) {
  const { data, setData } = useOnboarding();
  const [selected, setSelected] = useState<RelaxerHistory | null>(data.relaxer_history ?? null);

  return (
    <ConsultationShell
      step={15}
      totalSteps={18}
      auntyId="3"
      auntyMessage="I need to know what your hair has been through. No judgment — just the truth."
      question="What's your chemical history?"
      onBack={() => navigation.goBack()}
      footer={
        <Button
          label="Continue"
          onPress={() => { if (selected) { setData({ relaxer_history: selected }); navigation.navigate('ProtectiveStyling'); } }}
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
