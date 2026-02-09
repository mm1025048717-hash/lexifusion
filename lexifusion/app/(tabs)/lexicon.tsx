import { useCallback } from 'react';
import { StyleSheet, ScrollView, View, Text, RefreshControl, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import { Spacing, Typography, Radius } from '@/constants/Design';
import { useColorScheme } from '@/components/useColorScheme';
import { useFusionStore } from '@/hooks/useFusionStore';
import { FusionLexiconCard } from '@/components/FusionLexiconCard';

export default function LexiconScreen() {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { discovered, loading, refresh, toggleFavorite } = useFusionStore();

  useFocusEffect(
    useCallback(() => { refresh(); }, [refresh])
  );

  const topPad = Platform.OS === 'web' ? Spacing.lg : insets.top + Spacing.xs;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: c.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad }]}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={c.primary} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: c.text }]}>图鉴</Text>
          {discovered.length > 0 && (
            <View style={[styles.badge, { backgroundColor: c.tagBg }]}>
              <Text style={[styles.badgeText, { color: c.tagText }]}>{discovered.length}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.subtitle, { color: c.textTertiary }]}>
          你发现的融合词汇
        </Text>
      </View>

      {discovered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>{'📖'}</Text>
          <Text style={[styles.emptyTitle, { color: c.textSecondary }]}>暂无发现</Text>
          <Text style={[styles.emptyHint, { color: c.textTertiary }]}>去融合页选两个词开始吧</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {discovered.map((item) => (
            <FusionLexiconCard
              key={item.discoveryId}
              fusion={item}
              isFavorite={item.isFavorite}
              onToggleFavorite={() => toggleFavorite(item.discoveryId)}
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
    paddingHorizontal: Spacing.md,
    paddingBottom: 100,
  },
  header: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xxs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 80,
    gap: 6,
  },
  emptyIcon: { fontSize: 36, opacity: 0.3 },
  emptyTitle: { fontSize: 15, fontWeight: '500' },
  emptyHint: { fontSize: 12 },
  list: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
});
