import { useCallback } from 'react';
import { StyleSheet, ScrollView, View, Text, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Colors from '@/constants/Colors';
import { Spacing, Typography } from '@/constants/Design';
import { useColorScheme } from '@/components/useColorScheme';
import { useFusionStore } from '@/hooks/useFusionStore';
import { FusionLexiconCard } from '@/components/FusionLexiconCard';

export default function LexiconScreen() {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const { discovered, favoriteIds, loading, refresh, toggleFavorite } = useFusionStore();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: c.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={c.primary} />
      }
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: c.primaryDark }]}>图鉴 Lexicon</Text>
      <Text style={[styles.subtitle, { color: c.textSecondary }]}>
        你发现的融合会出现在这里 / Your discovered fusions will appear here.
      </Text>

      {discovered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: c.textTertiary }]}>
            暂无发现 · 去实验室选两个气泡融合吧
          </Text>
          <Text style={[styles.emptyTextEn, { color: c.textTertiary }]}>
            No fusions yet. Go to the Lab and fuse two bubbles.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {discovered.map((fusion) => (
            <FusionLexiconCard
              key={fusion.id}
              fusion={fusion}
              isFavorite={favoriteIds.includes(fusion.id)}
              onToggleFavorite={() => toggleFavorite(fusion.id)}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  title: {
    ...Typography.largeTitle,
    letterSpacing: -0.5,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.subhead,
    marginBottom: Spacing.lg,
  },
  empty: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.subhead,
    marginBottom: 4,
  },
  emptyTextEn: {
    fontSize: 12,
    opacity: 0.85,
  },
  list: {
    paddingTop: Spacing.xs,
  },
});
