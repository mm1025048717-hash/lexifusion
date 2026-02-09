import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={20} style={{ marginBottom: -2 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.tabIconDefault,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: c.surface,
          borderTopColor: c.separator,
          borderTopWidth: 1,
          paddingTop: 6,
          height: Platform.OS === 'web' ? 52 : 56,
          ...(Platform.OS === 'web'
            ? { backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' } as any
            : {}),
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 0.2,
        },
        tabBarItemStyle: { minWidth: 72 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '融合',
          tabBarIcon: ({ color }) => <TabBarIcon name="flask" color={color} />,
        }}
      />
      <Tabs.Screen
        name="lexicon"
        options={{
          title: '图鉴',
          tabBarIcon: ({ color }) => <TabBarIcon name="book" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
      <Tabs.Screen name="two" options={{ href: null }} />
    </Tabs>
  );
}
