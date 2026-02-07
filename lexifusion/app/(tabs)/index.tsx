import { useRouter } from 'expo-router';
import { StyleSheet, ScrollView, View, Text } from 'react-native';

import { ThemeCard } from '@/components/ThemeCard';
import { themes } from '@/data/themes';
import Colors from '@/constants/Colors';
import { Spacing, Typography } from '@/constants/Design';
import { BRAND_NAME } from '@/constants/Brand';
import { useColorScheme } from '@/components/useColorScheme';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: c.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: c.primaryDark }]}>{BRAND_NAME}</Text>
        <Text style={[styles.subtitle, { color: c.textSecondary }]}>
          选一个主题，用气泡融合发现新词
        </Text>
        <Text style={[styles.subtitleEn, { color: c.textTertiary }]}>
          Pick a theme and fuse bubbles to discover new words.
        </Text>
      </View>
      {themes.map((theme) => (
        <ThemeCard
          key={theme.id}
          theme={theme}
          onPress={() => router.push(`/lab/${theme.id}`)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl + Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  header: { marginBottom: Spacing.xl },
  title: {
    ...Typography.largeTitle,
  },
  subtitle: {
    ...Typography.subhead,
    marginTop: Spacing.xs,
  },
  subtitleEn: {
    fontSize: 13,
    marginTop: 2,
    opacity: 0.85,
  },
});
