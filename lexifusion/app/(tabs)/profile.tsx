import { useCallback } from 'react';
import { StyleSheet, ScrollView, View, Text, Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors from '@/constants/Colors';
import { Spacing, Typography, Radius } from '@/constants/Design';
import { useColorScheme } from '@/components/useColorScheme';
import { useFusionStore } from '@/hooks/useFusionStore';
import { FusionLexiconCard } from '@/components/FusionLexiconCard';

export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const { discovered, favorites, loading, refresh, toggleFavorite } = useFusionStore();

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
      <Text style={[styles.title, { color: c.primaryDark }]}>我的 Profile</Text>
      <Text style={[styles.subtitle, { color: c.textSecondary }]}>
        融合记忆库 · 学习数据 · 收藏夹 / Fusion memory · Progress · Favorites
      </Text>

      {/* 融合记忆库 */}
      <View style={[styles.section, { backgroundColor: c.card, borderColor: c.borderSubtle }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>
            融合记忆库 Fusion memory
          </Text>
          <Text style={[styles.sectionCount, { color: c.textSecondary }]}>
            {discovered.length} 个
          </Text>
        </View>
        <Text style={[styles.sectionDesc, { color: c.textTertiary }]}>
          你在实验室发现的融合会保存在这里
        </Text>
        <Text style={[styles.sectionDescEn, { color: c.textTertiary }]}>
          Fusions you discover in the Lab are saved here.
        </Text>
        <Pressable
          onPress={() => router.push('/lexicon')}
          style={({ pressed }) => [styles.btn, { backgroundColor: c.primary, opacity: pressed ? 0.9 : 1 }]}
        >
          <Text style={styles.btnText}>查看全部 View all</Text>
          <FontAwesome name="chevron-right" size={12} color="#fff" />
        </Pressable>
      </View>

      {/* 学习数据 */}
      <View style={[styles.section, { backgroundColor: c.card, borderColor: c.borderSubtle }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>
            学习数据 Progress
          </Text>
        </View>
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: c.bubbleBg, borderColor: c.borderSubtle }]}>
            <Text style={[styles.statValue, { color: c.primary }]}>{discovered.length}</Text>
            <Text style={[styles.statLabel, { color: c.textSecondary }]}>
              已发现融合 Discovered
            </Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: c.bubbleBg, borderColor: c.borderSubtle }]}>
            <Text style={[styles.statValue, { color: c.primary }]}>{favorites.length}</Text>
            <Text style={[styles.statLabel, { color: c.textSecondary }]}>
              收藏 Favorites
            </Text>
          </View>
        </View>
      </View>

      {/* 收藏夹 */}
      <View style={[styles.section, { backgroundColor: c.card, borderColor: c.borderSubtle }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>
            收藏夹 Favorites
          </Text>
          <Text style={[styles.sectionCount, { color: c.textSecondary }]}>
            {favorites.length} 个
          </Text>
        </View>
        {favorites.length === 0 ? (
          <Text style={[styles.emptyHint, { color: c.textTertiary }]}>
            在图鉴或实验室中点击 ♡ 即可收藏 / Tap ♡ in Lexicon or Lab to add favorites.
          </Text>
        ) : (
          <View style={styles.favList}>
            {favorites.map((fusion) => (
              <FusionLexiconCard
                key={fusion.id}
                fusion={fusion}
                isFavorite
                onToggleFavorite={() => toggleFavorite(fusion.id)}
              />
            ))}
          </View>
        )}
      </View>
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
  section: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    ...Typography.headline,
  },
  sectionCount: {
    ...Typography.footnote,
  },
  sectionDesc: {
    ...Typography.footnote,
    marginBottom: 2,
  },
  sectionDescEn: {
    fontSize: 11,
    marginBottom: Spacing.sm,
    opacity: 0.85,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.sm,
    gap: 6,
  },
  btnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statBox: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
  },
  emptyHint: {
    ...Typography.footnote,
    fontStyle: 'italic',
  },
  favList: {
    marginTop: Spacing.xs,
  },
});
