/**
 * Navigation — Root navigator with auth, onboarding, and app flows.
 *
 * Auth: if not authenticated, show SignUp/SignIn screens
 * Onboarding: if authenticated but not complete, show consultation flow
 * App: if authenticated and onboarding complete, show tab navigator + modals
 */

import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { TabBar } from '../components/TabBar';
import { useOnboarding } from '../context/OnboardingContext';
import { useAuth } from '../context/AuthContext';
import { colors } from '../constants/theme';

// Auth screens
import SignUpScreen from '../screens/auth/SignUpScreen';
import SignInScreen from '../screens/auth/SignInScreen';

// Onboarding screens
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import NameEntryScreen from '../screens/onboarding/NameEntryScreen';
import CurlTypeScreen from '../screens/onboarding/CurlTypeScreen';
import PorosityTestScreen from '../screens/onboarding/PorosityTestScreen';
import PrimaryGoalScreen from '../screens/onboarding/PrimaryGoalScreen';
import HairHabitsScreen from '../screens/onboarding/HairHabitsScreen';
import StrugglesScreen from '../screens/onboarding/StrugglesScreen';
import BudgetQuestionScreen from '../screens/onboarding/BudgetQuestionScreen';
import CouncilConveningScreen from '../screens/onboarding/CouncilConveningScreen';
import CouncilVerdictScreen from '../screens/onboarding/CouncilVerdictScreen';
import ValuePreviewScreen from '../screens/onboarding/ValuePreviewScreen';
import ProductRevealScreen from '../screens/onboarding/ProductRevealScreen';
import SendOffScreen from '../screens/onboarding/SendOffScreen';

// App screens
import HomeScreen from '../screens/app/HomeScreen';
import RitualScreen from '../screens/app/RitualScreen';
import CouncilScreen from '../screens/app/CouncilScreen';
import JourneyScreen from '../screens/app/JourneyScreen';
import ProductsScreen from '../screens/app/ProductsScreen';
import SettingsScreen from '../screens/app/SettingsScreen';
import RitualStepScreen from '../screens/app/RitualStepScreen';
import CheckInScreen from '../screens/app/CheckInScreen';

import type {
  RootStackParamList,
  OnboardingStackParamList,
  AppTabParamList,
  AppStackParamList,
} from '../types';

// ─── Auth Stack ─────────────────────────────────────────────────

type AuthStackParamList = {
  SignUp: undefined;
  SignIn: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}
    >
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
      <AuthStack.Screen name="SignIn" component={SignInScreen} />
    </AuthStack.Navigator>
  );
}

// ─── Onboarding Stack ───────────────────────────────────────────

const OnboardingStack = createNativeStackNavigator<OnboardingStackParamList>();

function OnboardingNavigator() {
  return (
    <OnboardingStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}
    >
      <OnboardingStack.Screen name="Welcome" component={WelcomeScreen} />
      <OnboardingStack.Screen name="ValuePreview" component={ValuePreviewScreen} />
      <OnboardingStack.Screen name="NameEntry" component={NameEntryScreen} />
      <OnboardingStack.Screen name="CurlType" component={CurlTypeScreen} />
      <OnboardingStack.Screen name="PorosityTest" component={PorosityTestScreen} />
      <OnboardingStack.Screen name="PrimaryGoal" component={PrimaryGoalScreen} />
      <OnboardingStack.Screen name="HairHabits" component={HairHabitsScreen} />
      <OnboardingStack.Screen name="Struggles" component={StrugglesScreen} />
      <OnboardingStack.Screen name="BudgetQuestion" component={BudgetQuestionScreen} />
      <OnboardingStack.Screen name="CouncilConvening" component={CouncilConveningScreen} />
      <OnboardingStack.Screen name="CouncilVerdict" component={CouncilVerdictScreen} />
      <OnboardingStack.Screen name="ProductReveal" component={ProductRevealScreen} />
      <OnboardingStack.Screen name="SendOff" component={SendOffScreen} />
    </OnboardingStack.Navigator>
  );
}

// ─── App Tab Navigator ──────────────────────────────────────────

const AppTab = createBottomTabNavigator<AppTabParamList>();

function TabNavigator() {
  return (
    <AppTab.Navigator
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <AppTab.Screen name="Home" component={HomeScreen} />
      <AppTab.Screen name="Ritual" component={RitualScreen} />
      <AppTab.Screen name="Products" component={ProductsScreen} />
      <AppTab.Screen name="Chat" component={CouncilScreen} />
      <AppTab.Screen name="Journey" component={JourneyScreen} />
    </AppTab.Navigator>
  );
}

// ─── App Stack (tabs + modal screens) ───────────────────────────

const AppStack = createNativeStackNavigator<AppStackParamList>();

function AppNavigator() {
  return (
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
      <AppStack.Screen name="Tabs" component={TabNavigator} />
      <AppStack.Group screenOptions={{ presentation: 'modal', animation: 'slide_from_bottom' }}>
        <AppStack.Screen name="HairProfile" component={PlaceholderScreen} />
        <AppStack.Screen name="Settings" component={SettingsScreen} />
        <AppStack.Screen name="RitualSteps" component={RitualStepScreen} />
        <AppStack.Screen name="CheckIn" component={CheckInScreen} />
      </AppStack.Group>
    </AppStack.Navigator>
  );
}

// Placeholder for screens not yet built
function PlaceholderScreen() {
  return (
    <View style={loadingStyles.container}>
      <ActivityIndicator color={colors.primary} size="large" />
    </View>
  );
}

// ─── Root Navigator ─────────────────────────────────────────────

const RootStack = createNativeStackNavigator<RootStackParamList & { Auth: undefined }>();

export function RootNavigator() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { state } = useOnboarding();

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <View style={loadingStyles.container}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false, animation: 'none' }}>
        {!isAuthenticated ? (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        ) : !state.isComplete ? (
          <RootStack.Screen name="Onboarding" component={OnboardingNavigator} />
        ) : (
          <RootStack.Screen name="App" component={AppNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
