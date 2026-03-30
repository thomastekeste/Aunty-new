import React, { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList, PrimaryGoal } from '@/types';
import { useOnboarding } from '@/context/OnboardingContext';
import ConsultationShell from '@/components/ConsultationShell';
import OptionCard from '@/components/OptionCard';
import Button from '@/components/Button';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'PrimaryGoal'>;

const OPTIONS: Array<{ label: string; value: PrimaryGoal }> = [
  { label: 'Length — I want it to grow', value: 'length' },
  { label: 'Moisture — it\'s always dry', value: 'moisture' },
  { label: 'Definition — I want real curls', value: 'definition' },
  { label: 'Volume — more is more', value: 'volume' },
  { label: 'Health — fix what\'s broken', value: 'health' },
];

export default function PrimaryGoalScreen({ navigation }: Props) {
  const { data, setData } = useOnboarding();
  const [selected, setSelected] = useState<PrimaryGoal | null>(data.primary_goal ?? null);

  const handleContinue = () => {
    if (!selected) return;
    setData({ primary_goal: selected });
    navigation.navigate('Failures');
  };

  return (
    <ConsultationShell
      step={12}
      totalSteps={18}
      auntyId="5"
      auntyMessage="Mija, what do you want most from your hair right now? Be honest."
      question="What's your #1 goal?"
      onBack={() => navigation.goBack()}
      footer={<Button label="Continue" onPress={handleContinue} disabled={!selected} />}
    >
      {OPTIONS.map(opt => (
        <OptionCard
          key={opt.value}
          label={opt.label}
          selected={selected === opt.value}
          onPress={() => setSelected(opt.value)}
        />
      ))}
    </ConsultationShell>
  );
}
