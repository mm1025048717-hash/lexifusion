import { Stack } from 'expo-router';
import Colors from '@/constants/Colors';
import { Typography } from '@/constants/Design';
import { useColorScheme } from '@/components/useColorScheme';

export default function LabLayout() {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: c.background,
        } as any,
        headerTintColor: c.primary,
        headerTitleStyle: { ...Typography.headline, color: c.text },
        headerShadowVisible: false,
        headerBackTitle: '返回 Back',
        contentStyle: { flex: 1 },
      }}
    >
      <Stack.Screen name="[themeId]" options={{ title: '主题实验室 Theme Lab' }} />
    </Stack>
  );
}
