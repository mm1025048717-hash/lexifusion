import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { Platform, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

// Web 端使用 emoji 作为备用图标，解决字体加载问题
const webIconMap: Record<string, string> = {
  flask: '🧪',
  book: '📖',
  user: '👤',
};

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  // Web 端使用 emoji 备用方案
  if (Platform.OS === 'web') {
    const emoji = webIconMap[props.name as string] || '•';
    return (
      <Text style={{ fontSize: 18, marginRight: 6 }}>
        {emoji}
      </Text>
    );
  }
  
  return <FontAwesome size={20} style={{ marginBottom: 4 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  // Web 端底部白条遮挡严重，大幅增加 padding 让菜单文字完全上移
  const bottomPad = Platform.OS === 'web' ? 28 : Math.max(insets.bottom, 4);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.tabIconDefault,
        headerShown: false,
        // Web 端：标签放图标旁，避免底部白条遮挡
        ...(Platform.OS === 'web' ? { tabBarLabelPosition: 'beside-icon' as const } : {}),
        tabBarStyle: {
          backgroundColor: c.surface,
          borderTopColor: c.separator,
          borderTopWidth: 1,
          paddingTop: 10,
          paddingBottom: bottomPad,
          height: (Platform.OS === 'web' ? 52 : 56) + bottomPad,
          minHeight: 68,
          overflow: 'visible' as any,
          ...(Platform.OS === 'web'
            ? { backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' } as any
            : {}),
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          letterSpacing: 0.2,
          marginTop: 0,
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
