import React, { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList, TimeAvailable } from '@/types';
import { useOnboarding } from '@/context/OnboardingContext';
import ConsultationShell from '@/components/ConsultationShell';
import OptionCard from '@/components/OptionCard';
import Button from '@/components/Button';
import { QuickIcon, HourglassIcon, CrownIcon } from '@/components/Icons';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'TimeAvailable'>;
const OPTIONS = [
  { label: 'Under 1 hour', value: 'under_1h' as TimeAvailable, icon: <QuickIcon color="#F72585" size={22} strokeWidth={2} />, color: '#F72585' },
  { label: '1–2 hours', value: '1_2h' as TimeAvailable, icon: <HourglassIcon color="#F5C542" size={22} strokeWidth={2} />, color: '#F5C542' },
  { label: '3+ hours', value: '3plus_h' as TimeAvailable, icon: <CrownIcon color="#12C064" size={22} strokeWidth={2} />, color: '#12C064' },
];

export default function TimeAvailableScreen({ navigation }: Props) {
  const { data, setData } = useOnboarding();
  const [selected, setSelected] = useState<TimeAvailable | null>(data.time_available ?? null);

  return (
    <ConsultationShell
      step={18}
      totalSteps={18}
      auntyId="5"
      auntyMessage="Mija, I'm not building you a routine you'll abandon in a week. How much time can you really give?"
      question="How much time on wash day?"
      onBack={() => navigation.goBack()}
      footer={
        <Button
          label="Take it to the council."
          onPress={() => { if (selected) { setData({ time_available: selected }); navigation.navigate('CouncilConvening'); } }}
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
