import { useCallback, useState } from 'react';
import { StyleSheet, ScrollView, View, Text, Pressable, RefreshControl, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors from '@/constants/Colors';
import { Spacing, Typography, Radius, cardShadow } from '@/constants/Design';
import { useColorScheme } from '@/components/useColorScheme';
import { useFusionStore } from '@/hooks/useFusionStore';
import { FusionLexiconCard } from '@/components/FusionLexiconCard';
import { apiGetMe, UserProfile } from '@/lib/api';
import { ensureAuth, getStoredUser, StoredUser } from '@/lib/auth';

export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const shadow = cardShadow(colorScheme ?? 'light');
  const { discovered, favorites, loading, refresh, toggleFavorite } = useFusionStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useFocusEffect(
    useCallback(() => {
      refresh();
      (async () => {
        try {
          await ensureAuth();
          const p = await apiGetMe();
          setProfile(p);
        } catch {}
      })();
    }, [refresh])
  );

  const discoveredCount = profile?.stats.discoveryCount ?? discovered.length;
  const favoriteCount = profile?.stats.favoriteCount ?? favorites.length;
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
        <Text style={[styles.title, { color: c.text }]}>我的</Text>
        <Text style={[styles.subtitle, { color: c.textTertiary }]}>学习统计</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: c.card, borderColor: c.borderSubtle, ...shadow }]}>
          <Text style={styles.statEmoji}>{'✦'}</Text>
          <Text style={[styles.statValue, { color: c.text }]}>{discoveredCount}</Text>
          <Text style={[styles.statLabel, { color: c.textTertiary }]}>已发现</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: c.card, borderColor: c.borderSubtle, ...shadow }]}>
          <Text style={styles.statEmoji}>{'♡'}</Text>
          <Text style={[styles.statValue, { color: c.text }]}>{favoriteCount}</Text>
          <Text style={[styles.statLabel, { color: c.textTertiary }]}>收藏</Text>
        </View>
      </View>

      {/* Action */}
      <Pressable
        onPress={() => router.push('/(tabs)/lexicon')}
        style={({ pressed }) => [
          styles.actionCard,
          { backgroundColor: c.card, borderColor: c.borderSubtle, opacity: pressed ? 0.9 : 1, ...shadow },
        ]}
      >
        <View style={styles.actionContent}>
          <Text style={[styles.actionTitle, { color: c.text }]}>融合记忆库</Text>
          <Text style={[styles.actionDesc, { color: c.textTertiary }]}>查看所有发现</Text>
        </View>
        <FontAwesome name="chevron-right" size={14} color={c.textTertiary} />
      </Pressable>

      {/* Favorites */}
      <Text style={[styles.sectionTitle, { color: c.text }]}>收藏夹</Text>

      {favorites.length === 0 ? (
        <View style={[styles.emptyBox, { backgroundColor: c.cardInner, borderColor: c.borderSubtle }]}>
          <Text style={[styles.emptyText, { color: c.textTertiary }]}>在图鉴中点击 ♡ 即可收藏</Text>
        </View>
      ) : (
        <View style={styles.favList}>
          {favorites.map((item) => (
            <FusionLexiconCard
              key={item.discoveryId}
              fusion={item}
              isFavorite
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },

  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    gap: 4,
  },
  statEmoji: { fontSize: 18, color: '#22C55E' },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  statLabel: { fontSize: 12, fontWeight: '500' },

  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' as any } : {}),
  },
  actionContent: { flex: 1, gap: 2 },
  actionTitle: { fontSize: 15, fontWeight: '600' },
  actionDesc: { fontSize: 12 },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },

  emptyBox: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyText: { fontSize: 13 },
  favList: { gap: Spacing.sm },
});
