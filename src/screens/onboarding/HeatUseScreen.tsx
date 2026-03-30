import React, { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList, HeatUse } from '@/types';
import { useOnboarding } from '@/context/OnboardingContext';
import ConsultationShell from '@/components/ConsultationShell';
import OptionCard from '@/components/OptionCard';
import Button from '@/components/Button';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'HeatUse'>;
const OPTIONS: Array<{ label: string; value: HeatUse }> = [
  { label: 'Never', value: 'never' },
  { label: 'Rarely — a few times a year', value: 'rarely' },
  { label: 'Sometimes — once a month or so', value: 'sometimes' },
  { label: 'Often — weekly or more', value: 'often' },
];

export default function HeatUseScreen({ navigation }: Props) {
  const { data, setData } = useOnboarding();
  const [selected, setSelected] = useState<HeatUse | null>(data.heat_use ?? null);

  return (
    <ConsultationShell
      step={14}
      totalSteps={18}
      auntyId="4"
      auntyMessage="Heat changes everything about how I build your routine. How often are you using it?"
      question="How often do you use direct heat?"
      onBack={() => navigation.goBack()}
      footer={
        <Button
          label="Continue"
          onPress={() => { if (selected) { setData({ heat_use: selected }); navigation.navigate('RelaxerHistory'); } }}
          disabled={!selected}
        />
      }
    >
      {OPTIONS.map(opt => (
        <OptionCard key={opt.value} label={opt.label} selected={selected === opt.value} onPress={() => setSelected(opt.value)} />
      ))}
    </ConsultationShell>
  );
}
