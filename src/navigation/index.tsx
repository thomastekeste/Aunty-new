import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Platform } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { colors, fonts } from '@/constants/theme';
import { HomeIcon, RoutineIcon, ChatIcon } from '@/components/Icons';

// Onboarding screens
import SplashScreen from '@/screens/onboarding/SplashScreen';
import MeetCouncilScreen from '@/screens/onboarding/MeetCouncilScreen';
import NameScreen from '@/screens/onboarding/NameScreen';
import SignUpScreen from '@/screens/onboarding/SignUpScreen';
import LocationScreen from '@/screens/onboarding/LocationScreen';
import HairTestSuite from '@/screens/onboarding/HairTestSuite';
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
import JourneyScreen from '@/screens/app/JourneyScreen';
import ProductChatScreen from '@/screens/app/ProductChatScreen';
import CheckinScreen from '@/screens/app/CheckinScreen';
import AuntyConversationScreen from '@/screens/app/AuntyConversationScreen';
import HairJourneyScreen from '@/screens/app/HairJourneyScreen';

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
      <OnboardingStack.Screen name="PorosityTest" component={HairTestSuite} />
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

  return (
    <View style={{ alignItems: 'center' }}>
      {focused && (
        <View style={{
          position: 'absolute',
          top: -10,
          width: 28,
          height: 3,
          borderRadius: 2,
          backgroundColor: colors.primary,
        }} />
      )}
      {label === 'Home' && <HomeIcon color={color} size={22} strokeWidth={sw} />}
      {label === 'Journey' && <RoutineIcon color={color} size={22} strokeWidth={sw} />}
      {label === 'Chat' && <ChatIcon color={color} size={22} strokeWidth={sw} />}
    </View>
  );
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
          paddingTop: 12,
          paddingBottom: 6,
          height: 64,
        },
        tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Journey" component={JourneyScreen} options={{ title: 'Journey' }} />
      <Tab.Screen name="Chat" component={ProductChatScreen} options={{ title: 'Chat' }} />
    </Tab.Navigator>
  );
}

// ── App stack (tabs + modals + new screens) ─────────────────────────────────
function AppNavigator() {
  return (
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
      <AppStack.Screen name="Tabs" component={MainTabs} />
      <AppStack.Screen
        name="CheckinModal"
        component={CheckinScreen}
        options={{ presentation: 'modal', headerShown: false }}
      />
      <AppStack.Screen
        name="AuntyConversation"
        component={AuntyConversationScreen}
        options={{ presentation: 'modal', headerShown: false }}
      />
      <AppStack.Screen
        name="HairJourney"
        component={HairJourneyScreen}
        options={{ animation: 'slide_from_right', headerShown: false }}
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
