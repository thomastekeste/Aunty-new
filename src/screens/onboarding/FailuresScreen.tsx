import React, { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@/types';
import { useOnboarding } from '@/context/OnboardingContext';
import ConsultationShell from '@/components/ConsultationShell';
import OptionCard from '@/components/OptionCard';
import Button from '@/components/Button';
import { FrizzIcon, DryIcon, BreakageIcon, NoDefinitionIcon, ShrinkageIcon, BuildupIcon, ScalpIcon } from '@/components/Icons';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Failures'>;

const OPTIONS = [
  { label: 'Frizz', icon: <FrizzIcon color="#9B5DE5" size={22} strokeWidth={1.8} />, color: '#9B5DE5' },
  { label: 'Dryness', icon: <DryIcon color="#FB5607" size={22} strokeWidth={1.8} />, color: '#FB5607' },
  { label: 'Breakage', icon: <BreakageIcon color="#E0142C" size={22} strokeWidth={2} />, color: '#E0142C' },
  { label: 'No definition', icon: <NoDefinitionIcon color="#00B4D8" size={22} strokeWidth={2} />, color: '#00B4D8' },
  { label: 'Shrinkage', icon: <ShrinkageIcon color="#F5C542" size={22} strokeWidth={2} />, color: '#F5C542' },
  { label: 'Buildup', icon: <BuildupIcon color="#8B6914" size={22} strokeWidth={2} />, color: '#8B6914' },
  { label: 'Scalp issues', icon: <ScalpIcon color="#F72585" size={22} strokeWidth={1.8} />, color: '#F72585' },
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
    navigation.navigate('ProtectiveStyling');
  };

  return (
    <ConsultationShell
      step={16}
      totalSteps={18}
      auntyId="1"
      phaseBadge="Ngozi's Turn · Moisture Authority"
      auntyMessage="Tell me what's been failing — all of it. I need to know so I don't repeat the mistake. Dryness? Frizz? Tell me. That's data, not failure."
      question="What keeps going wrong? Select all that apply."
      onBack={() => navigation.goBack()}
      footer={<Button label="Continue" onPress={handleContinue} />}
    >
      {OPTIONS.map(opt => (
        <OptionCard
          key={opt.label}
          label={opt.label}
          selected={selected.includes(opt.label)}
          onPress={() => toggle(opt.label)}
          multiSelect
          icon={opt.icon}
          color={opt.color}
        />
      ))}
    </ConsultationShell>
  );
}
