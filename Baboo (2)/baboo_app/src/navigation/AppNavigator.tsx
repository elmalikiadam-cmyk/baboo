import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { colors, type, space } from '@/theme/theme';
import {
  OnboardingScreen, LoginScreen,
  FeedScreen, DetailScreen, FiltersScreen, MapScreen,
  FavoritesScreen, PublishScreen, MessagesScreen, AccountScreen,
} from '@/screens';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabLabel({ focused, label }: { focused: boolean; label: string }) {
  return (
    <View style={{ alignItems: 'center', gap: 6 }}>
      {focused && <View style={{ width: 24, height: 2, backgroundColor: colors.paper }} />}
      <Text style={{
        ...type.monoS,
        color: focused ? colors.paper : 'rgba(242,239,232,0.5)',
        fontFamily: 'BarlowCondensed_700Bold',
        fontSize: 11, letterSpacing: 1.2,
      }}>{label}</Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: colors.ink, borderTopWidth: 0, height: 72, paddingTop: space.s },
      tabBarShowLabel: false,
    }}>
      <Tab.Screen name="Feed" component={FeedScreen}
        options={{ tabBarIcon: ({ focused }) => <TabLabel focused={focused} label="ACCUEIL" /> }} />
      <Tab.Screen name="Map" component={MapScreen}
        options={{ tabBarIcon: ({ focused }) => <TabLabel focused={focused} label="RECHERCHE" /> }} />
      <Tab.Screen name="Publish" component={PublishScreen}
        options={{ tabBarIcon: ({ focused }) => <TabLabel focused={focused} label="PUBLIER" /> }} />
      <Tab.Screen name="Favorites" component={FavoritesScreen}
        options={{ tabBarIcon: ({ focused }) => <TabLabel focused={focused} label="FAVORIS" /> }} />
      <Tab.Screen name="Account" component={AccountScreen}
        options={{ tabBarIcon: ({ focused }) => <TabLabel focused={focused} label="COMPTE" /> }} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="Detail" component={DetailScreen} />
        <Stack.Screen name="Filters" component={FiltersScreen}
          options={{ presentation: 'modal' }} />
        <Stack.Screen name="Messages" component={MessagesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
