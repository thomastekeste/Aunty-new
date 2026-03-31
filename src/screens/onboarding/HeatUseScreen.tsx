import React, { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList, HeatUse } from '@/types';
import { useOnboarding } from '@/context/OnboardingContext';
import ConsultationShell from '@/components/ConsultationShell';
import OptionCard from '@/components/OptionCard';
import Button from '@/components/Button';
import { NoHeatIcon, SnowflakeIcon, FlameIcon } from '@/components/Icons';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'HeatUse'>;

const OPTIONS = [
  { label: 'Never', value: 'never' as HeatUse, icon: <NoHeatIcon color="#12C064" size={22} strokeWidth={2} />, color: '#12C064' },
  { label: 'Rarely — a few times a year', value: 'rarely' as HeatUse, icon: <SnowflakeIcon color="#00B4D8" size={22} strokeWidth={1.6} />, color: '#00B4D8' },
  { label: 'Sometimes — once a month or so', value: 'sometimes' as HeatUse, icon: <FlameIcon color="#F5C542" size={22} strokeWidth={2} />, color: '#F5C542' },
  { label: 'Often — weekly or more', value: 'often' as HeatUse, icon: <FlameIcon color="#E0142C" size={22} strokeWidth={2.5} />, color: '#E0142C' },
];

export default function HeatUseScreen({ navigation }: Props) {
  const { data, setData } = useOnboarding();
  const [selected, setSelected] = useState<HeatUse | null>(data.heat_use ?? null);

  return (
    <ConsultationShell
      step={12}
      totalSteps={18}
      auntyId="2"
      phaseBadge="Marcia's Turn · Root Whisperer"
      auntyMessage="Heat goes straight to di roots — damages what we're trying to grow. You said you wash {washFreq}. Now tell mi about the heat."
      question="How often do you use direct heat?"
      onBack={() => navigation.goBack()}
      footer={
        <Button
          label="Continue"
          onPress={() => {
            if (selected) {
              setData({ heat_use: selected });
              navigation.navigate('RelaxerHistory');
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
