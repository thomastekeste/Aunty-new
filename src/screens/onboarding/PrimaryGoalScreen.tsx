import React, { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList, PrimaryGoal } from '@/types';
import { useOnboarding } from '@/context/OnboardingContext';
import ConsultationShell from '@/components/ConsultationShell';
import OptionCard from '@/components/OptionCard';
import Button from '@/components/Button';
import { GrowthIcon, DropIcon, CurlIcon, VolumeIcon, LeafIcon } from '@/components/Icons';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'PrimaryGoal'>;

const C = { length: '#12C064', moisture: '#00B4D8', definition: '#9B5DE5', volume: '#F5C542', health: '#FB5607' };
const OPTIONS: Array<{ label: string; value: PrimaryGoal; icon: React.ReactNode; color: string }> = [
  { label: 'Length — I want it to grow', value: 'length', icon: <GrowthIcon color={C.length} size={22} strokeWidth={2} />, color: C.length },
  { label: 'Moisture — it\'s always dry', value: 'moisture', icon: <DropIcon color={C.moisture} size={22} strokeWidth={2} />, color: C.moisture },
  { label: 'Definition — I want real curls', value: 'definition', icon: <CurlIcon color={C.definition} size={22} strokeWidth={2} />, color: C.definition },
  { label: 'Volume — more is more', value: 'volume', icon: <VolumeIcon color={C.volume} size={22} strokeWidth={2} />, color: C.volume },
  { label: 'Health — fix what\'s broken', value: 'health', icon: <LeafIcon color={C.health} size={22} strokeWidth={2} />, color: C.health },
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
          icon={opt.icon}
          color={opt.color}
        />
      ))}
    </ConsultationShell>
  );
}
