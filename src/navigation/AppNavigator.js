import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../theme';
import { HomeIcon, CouncilIcon, RoutineIcon, ProgressIcon } from '../components/Icons';

import WelcomeScreen from '../screens/WelcomeScreen';
import IntakeScreen from '../screens/IntakeScreen';
import LoadingScreen from '../screens/LoadingScreen';
import CouncilScreen from '../screens/CouncilScreen';
import RoutineScreen from '../screens/RoutineScreen';
import SendOffScreen from '../screens/SendOffScreen';
import CheckInScreen from '../screens/CheckInScreen';
import HomeScreen from '../screens/HomeScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const iconComponents = {
  Home: HomeIcon,
  Council: CouncilIcon,
  Routine: RoutineIcon,
  Progress: ProgressIcon,
};

function TabIcon({ label, focused }) {
  const IconComponent = iconComponents[label];
  const iconColor = focused ? colors.amber : colors.brownLight;
  const strokeWidth = focused ? 2.2 : 1.6;
  return (
    <View style={tabStyles.iconWrap}>
      {IconComponent && (
        <IconComponent color={iconColor} size={22} strokeWidth={strokeWidth} />
      )}
      <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>
        {label}
      </Text>
    </View>
  );
}

const tabStyles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
  },
  label: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 10,
    color: colors.brownLight,
    marginTop: 2,
  },
  labelActive: {
    color: colors.amber,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
});

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.cream,
          borderTopWidth: 0.5,
          borderTopColor: colors.border,
          height: 56 + 20,
          paddingBottom: 20,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Home" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="CouncilTab"
        component={CouncilScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Council" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="RoutineTab"
        component={RoutineScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Routine" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="ProgressTab"
        component={CheckInScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Progress" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_bottom',
        animationDuration: 300,
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Intake" component={IntakeScreen} />
      <Stack.Screen
        name="Loading"
        component={LoadingScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen name="Council" component={CouncilScreen} />
      <Stack.Screen name="Routine" component={RoutineScreen} />
      <Stack.Screen name="SendOff" component={SendOffScreen} />
      <Stack.Screen name="CheckIn" component={CheckInScreen} />
      <Stack.Screen name="Main" component={MainTabs} />
    </Stack.Navigator>
  );
}
