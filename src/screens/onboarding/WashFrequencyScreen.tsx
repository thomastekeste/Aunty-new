import React, { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList, WashFrequency } from '@/types';
import { useOnboarding } from '@/context/OnboardingContext';
import ConsultationShell from '@/components/ConsultationShell';
import OptionCard from '@/components/OptionCard';
import Button from '@/components/Button';
import { CalWeekIcon, CalMonthIcon, HourglassIcon, LooseIcon } from '@/components/Icons';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'WashFrequency'>;

const OPTIONS = [
  { label: 'Weekly', value: 'weekly' as WashFrequency, icon: <CalWeekIcon color="#12C064" size={22} strokeWidth={2} />, color: '#12C064' },
  { label: 'Every 2 weeks', value: 'bi_weekly' as WashFrequency, icon: <CalMonthIcon color="#F5C542" size={22} strokeWidth={2} />, color: '#F5C542' },
  { label: 'Monthly', value: 'monthly' as WashFrequency, icon: <HourglassIcon color="#9B5DE5" size={22} strokeWidth={2} />, color: '#9B5DE5' },
  { label: 'Less than that', value: 'less_frequent' as WashFrequency, icon: <LooseIcon color="#FB5607" size={22} strokeWidth={2} />, color: '#FB5607' },
];

export default function WashFrequencyScreen({ navigation }: Props) {
  const { data, setData } = useOnboarding();
  const [selected, setSelected] = useState<WashFrequency | null>(data.wash_frequency ?? null);

  const handleContinue = () => {
    if (!selected) return;
    setData({ wash_frequency: selected });
    navigation.navigate('HeatUse');
  };

  return (
    <ConsultationShell
      step={11}
      totalSteps={18}
      auntyId="2"
      phaseBadge="Marcia's Turn · Root Whisperer"
      auntyMessage="How often are you actually washing? I need the truth, not the ideal. Di roots can't breathe if you're overwashing — or starving them."
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
