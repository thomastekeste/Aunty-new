import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { colors, fonts } from '@/constants/theme';
import { HomeIcon, RoutineIcon, ProgressIcon, ProductsIcon } from '@/components/Icons';

// Onboarding screens
import SplashScreen from '@/screens/onboarding/SplashScreen';
import MeetCouncilScreen from '@/screens/onboarding/MeetCouncilScreen';
import NameScreen from '@/screens/onboarding/NameScreen';
import SignUpScreen from '@/screens/onboarding/SignUpScreen';
import LocationScreen from '@/screens/onboarding/LocationScreen';
import PorosityTestScreen from '@/screens/onboarding/PorosityTestScreen';
import ElasticityTestScreen from '@/screens/onboarding/ElasticityTestScreen';
import DensityTestScreen from '@/screens/onboarding/DensityTestScreen';
import PhotoUploadScreen from '@/screens/onboarding/PhotoUploadScreen';
import CurlTypeRevealScreen from '@/screens/onboarding/CurlTypeRevealScreen';
import WashFrequencyScreen from '@/screens/onboarding/WashFrequencyScreen';
import PrimaryGoalScreen from '@/screens/onboarding/PrimaryGoalScreen';
import FailuresScreen from '@/screens/onboarding/FailuresScreen';
import HeatUseScreen from '@/screens/onboarding/HeatUseScreen';
import RelaxerHistoryScreen from '@/screens/onboarding/RelaxerHistoryScreen';
import ProtectiveStylingScreen from '@/screens/onboarding/ProtectiveStylingScreen';
import ScalpConcernsScreen from '@/screens/onboarding/ScalpConcernsScreen';
import TimeAvailableScreen from '@/screens/onboarding/TimeAvailableScreen';
import CouncilConveningScreen from '@/screens/onboarding/CouncilConveningScreen';
import CouncilSpeaksScreen from '@/screens/onboarding/CouncilSpeaksScreen';
import RoutineScreen from '@/screens/onboarding/RoutineScreen';
import SendOffScreen from '@/screens/onboarding/SendOffScreen';

// App screens
import HomeScreen from '@/screens/app/HomeScreen';
import RoutineDetailScreen from '@/screens/app/RoutineDetailScreen';
import ProgressScreen from '@/screens/app/ProgressScreen';
import ProductsScreen from '@/screens/app/ProductsScreen';
import CheckinScreen from '@/screens/app/CheckinScreen';

import {
  RootStackParamList,
  OnboardingStackParamList,
  AppStackParamList,
  AppTabParamList,
} from '@/types';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const OnboardingStack = createNativeStackNavigator<OnboardingStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();
const Tab = createBottomTabNavigator<AppTabParamList>();

// ── Onboarding flow ──────────────────────────────────────────────────
function OnboardingNavigator() {
  return (
    <OnboardingStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <OnboardingStack.Screen name="Splash" component={SplashScreen} />
      <OnboardingStack.Screen name="MeetCouncil" component={MeetCouncilScreen} />
      <OnboardingStack.Screen name="Name" component={NameScreen} />
      <OnboardingStack.Screen name="SignUp" component={SignUpScreen} />
      <OnboardingStack.Screen name="Location" component={LocationScreen} />
      <OnboardingStack.Screen name="PorosityTest" component={PorosityTestScreen} />
      <OnboardingStack.Screen name="ElasticityTest" component={ElasticityTestScreen} />
      <OnboardingStack.Screen name="DensityTest" component={DensityTestScreen} />
      <OnboardingStack.Screen name="PhotoUpload" component={PhotoUploadScreen} />
      <OnboardingStack.Screen name="CurlTypeReveal" component={CurlTypeRevealScreen} />
      <OnboardingStack.Screen name="WashFrequency" component={WashFrequencyScreen} />
      <OnboardingStack.Screen name="PrimaryGoal" component={PrimaryGoalScreen} />
      <OnboardingStack.Screen name="Failures" component={FailuresScreen} />
      <OnboardingStack.Screen name="HeatUse" component={HeatUseScreen} />
      <OnboardingStack.Screen name="RelaxerHistory" component={RelaxerHistoryScreen} />
      <OnboardingStack.Screen name="ProtectiveStyling" component={ProtectiveStylingScreen} />
      <OnboardingStack.Screen name="ScalpConcerns" component={ScalpConcernsScreen} />
      <OnboardingStack.Screen name="TimeAvailable" component={TimeAvailableScreen} />
      <OnboardingStack.Screen name="CouncilConvening" component={CouncilConveningScreen} />
      <OnboardingStack.Screen name="CouncilSpeaks" component={CouncilSpeaksScreen} />
      <OnboardingStack.Screen name="Routine" component={RoutineScreen} />
      <OnboardingStack.Screen name="SendOff" component={SendOffScreen} />
    </OnboardingStack.Navigator>
  );
}

// ── Tab bar icon ─────────────────────────────────────────────────────
function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const color = focused ? colors.ink : colors.mutedLight;
  const sw = focused ? 2.4 : 1.5;
  if (label === 'Home') return <HomeIcon color={color} size={22} strokeWidth={sw} />;
  if (label === 'RoutineTab') return <RoutineIcon color={color} size={22} strokeWidth={sw} />;
  if (label === 'Progress') return <ProgressIcon color={color} size={22} strokeWidth={sw} />;
  if (label === 'Products') return <ProductsIcon color={color} size={22} strokeWidth={sw} />;
  return null;
}

// ── Main tabs ────────────────────────────────────────────────────────
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '800',
          fontFamily: fonts.body,
          letterSpacing: 0.5,
          marginTop: 2,
        },
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.mutedLight,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: colors.borderLight,
          backgroundColor: colors.surface,
          paddingTop: 8,
          paddingBottom: 6,
        },
        tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="RoutineTab" component={RoutineDetailScreen} options={{ title: 'Routine' }} />
      <Tab.Screen name="Progress" component={ProgressScreen} options={{ title: 'Progress' }} />
      <Tab.Screen name="Products" component={ProductsScreen} options={{ title: 'Products' }} />
    </Tab.Navigator>
  );
}

// ── App stack (tabs + modal) ─────────────────────────────────────────
function AppNavigator() {
  return (
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
      <AppStack.Screen name="Tabs" component={MainTabs} />
      <AppStack.Screen
        name="CheckinModal"
        component={CheckinScreen}
        options={{
          presentation: 'modal',
          headerShown: true,
          title: 'Check-in',
          headerTitleStyle: { fontWeight: '700' },
        }}
      />
    </AppStack.Navigator>
  );
}

// ── Root ─────────────────────────────────────────────────────────────
export default function RootNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  const showApp = user && user.onboarding_complete;

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false, animation: 'none' }}>
        {showApp ? (
          <RootStack.Screen name="App" component={AppNavigator} />
        ) : (
          <RootStack.Screen name="Onboarding" component={OnboardingNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
