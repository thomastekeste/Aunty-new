import React, { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList, WashFrequency } from '@/types';
import { useOnboarding } from '@/context/OnboardingContext';
import ConsultationShell from '@/components/ConsultationShell';
import OptionCard from '@/components/OptionCard';
import Button from '@/components/Button';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'WashFrequency'>;

const OPTIONS: Array<{ label: string; value: WashFrequency; icon: string; color: string }> = [
  { label: 'Weekly', value: 'weekly', icon: '📅', color: '#12C064' },
  { label: 'Every 2 weeks', value: 'bi_weekly', icon: '🗓️', color: '#F5C542' },
  { label: 'Monthly', value: 'monthly', icon: '🌙', color: '#9B5DE5' },
  { label: 'Less than that', value: 'less_frequent', icon: '🤷', color: '#FB5607' },
];

export default function WashFrequencyScreen({ navigation }: Props) {
  const { data, setData } = useOnboarding();
  const [selected, setSelected] = useState<WashFrequency | null>(data.wash_frequency ?? null);

  const handleContinue = () => {
    if (!selected) return;
    setData({ wash_frequency: selected });
    navigation.navigate('PrimaryGoal');
  };

  return (
    <ConsultationShell
      step={11}
      totalSteps={18}
      auntyId="2"
      auntyMessage="How often are you actually washing? I need the truth, not the ideal."
      question="How often do you wash your hair?"
      onBack={() => navigation.goBack()}
      footer={<Button label="Continue" onPress={handleContinue} disabled={!selected} />}
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
