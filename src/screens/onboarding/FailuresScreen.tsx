import React, { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@/types';
import { useOnboarding } from '@/context/OnboardingContext';
import ConsultationShell from '@/components/ConsultationShell';
import OptionCard from '@/components/OptionCard';
import Button from '@/components/Button';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Failures'>;

const OPTIONS = [
  'Frizz',
  'Dryness',
  'Breakage',
  'No definition',
  'Shrinkage',
  'Buildup',
  'Scalp issues',
];

export default function FailuresScreen({ navigation }: Props) {
  const { data, setData } = useOnboarding();
  const [selected, setSelected] = useState<string[]>(data.failed_attempts ?? []);

  const toggle = (item: string) => {
    setSelected(prev =>
      prev.includes(item) ? prev.filter(s => s !== item) : [...prev, item]
    );
  };

  const handleContinue = () => {
    setData({ failed_attempts: selected });
    navigation.navigate('HeatUse');
  };

  return (
    <ConsultationShell
      step={13}
      totalSteps={18}
      auntyId="3"
      auntyMessage="Tell me what's been failing. All of it. I need to know what we're working around."
      question="What keeps going wrong? Select all that apply."
      onBack={() => navigation.goBack()}
      footer={<Button label="Continue" onPress={handleContinue} />}
    >
      {OPTIONS.map(opt => (
        <OptionCard
          key={opt}
          label={opt}
          selected={selected.includes(opt)}
          onPress={() => toggle(opt)}
          multiSelect
        />
      ))}
    </ConsultationShell>
  );
}
