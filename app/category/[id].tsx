import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  FlatList,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { IconArrowLeft } from '../../components/icons';
import { SubCategoryPill } from '../../components/SubCategoryPill';
import { LibraryWordItem } from '../../components/LibraryWordItem';
import { getCategoryIcon } from '../../constants/categoryIcons';
import {
  Colors,
  Spacing,
  FontFamily,
  FontSize,
  LineHeight,
} from '../../constants/theme';
import {
  getLibraryWords,
  getSubCategories,
  getUserWordMap,
  addWordToUserList,
  removeWordFromUserList,
  markWordAsLearned,
  type LibraryWord,
  type SubCategory,
  type UserWordInfo,
} from '../../db/queries';
import { useAuth } from '../../context/AuthContext';

export default function CategoryPage() {
  const router = useRouter();
  const { userId } = useAuth();
  const insets = useSafeAreaInsets();
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string | null>(null);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [words, setWords] = useState<LibraryWord[]>([]);
  const [userWordMap, setUserWordMap] = useState<Map<string, UserWordInfo>>(new Map());

  const IconComponent = getCategoryIcon(name ?? '', 'emphasized');

  const loadData = useCallback(async () => {
    if (!userId || !id) return;
    const subs = getSubCategories(id);
    setSubCategories(subs);
    setSelectedSubCategoryId(prev => prev === null && subs.length > 0 ? subs[0].id : prev);

    // Fetch user's word map from Supabase for variant computation
    const wordMap = await getUserWordMap(userId);
    setUserWordMap(wordMap);

    const allWords = getLibraryWords(wordMap, undefined, id);
    setWords(allWords);
  }, [userId, id]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredWords = useMemo(() => {
    if (!selectedSubCategoryId) return words;
    return words.filter((w) => w.sub_category_id === selectedSubCategoryId);
  }, [words, selectedSubCategoryId]);

  function refreshWords(map: Map<string, UserWordInfo>) {
    if (id) {
      setWords(getLibraryWords(map, undefined, id));
    }
  }

  function handleStartLearning(wordId: string) {
    if (!userId) return;
    const updated = new Map(userWordMap);
    const existing = updated.get(wordId);
    updated.set(wordId, { level: existing?.level ?? 0, suspended: false, marked_as_learned: false });
    setUserWordMap(updated);
    refreshWords(updated);

    addWordToUserList(userId, wordId).catch(() => {
      setUserWordMap(userWordMap);
      refreshWords(userWordMap);
    });
  }

  function handleMarkAsLearned(wordId: string) {
    if (!userId) return;
    const updated = new Map(userWordMap);
    const existing = updated.get(wordId);
    updated.set(wordId, { level: existing?.level ?? 0, suspended: false, marked_as_learned: true });
    setUserWordMap(updated);
    refreshWords(updated);

    markWordAsLearned(userId, wordId).catch(() => {
      setUserWordMap(userWordMap);
      refreshWords(userWordMap);
    });
  }

  function handleRemoveWord(wordId: string) {
    if (!userId) return;
    const updated = new Map(userWordMap);
    const existing = updated.get(wordId);
    if (existing) {
      updated.set(wordId, { ...existing, suspended: true, marked_as_learned: false });
    }
    setUserWordMap(updated);
    refreshWords(updated);

    removeWordFromUserList(userId, wordId).catch(() => {
      setUserWordMap(userWordMap);
      refreshWords(userWordMap);
    });
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header: back arrow absolutely positioned, icon+title centered */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
          <IconArrowLeft size={22} color={Colors.textPrimary} />
        </Pressable>
        <View style={styles.headerCenter}>
          {IconComponent && (
            <View style={styles.headerIcon}>
              <IconComponent width={32} height={32} />
            </View>
          )}
          <Text style={styles.headerTitle} numberOfLines={2}>
            {name}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Sub-category pills */}
      {subCategories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsContainer}
          style={styles.pillsScroll}
        >
          {subCategories.map((sub) => (
            <SubCategoryPill
              key={sub.id}
              label={sub.name}
              selected={selectedSubCategoryId === sub.id}
              onPress={() => setSelectedSubCategoryId(sub.id)}
            />
          ))}
        </ScrollView>
      )}

      {/* Word list */}
      <FlatList
        data={filteredWords}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <LibraryWordItem
            word={item}
            onStartLearning={handleStartLearning}
            onMarkAsLearned={handleMarkAsLearned}
            onRemoveWord={handleRemoveWord}
          />
        )}
        contentContainerStyle={[styles.listContent, { paddingBottom: Spacing.xxl + insets.bottom }]}
        style={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.m,
    paddingBottom: Spacing.m,
    paddingHorizontal: Spacing.l,
    minHeight: 48,
  },
  backButton: {
    position: 'absolute',
    left: Spacing.l,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.m,
  },
  headerIcon: {
    width: 32,
    height: 32,
    flexShrink: 0,
  },
  headerTitle: {
    fontFamily: FontFamily.playfairBold,
    fontSize: FontSize.heading4,
    color: Colors.textPrimary,
    letterSpacing: 1,
    lineHeight: LineHeight.heading4,
    flexShrink: 1,
    textAlign: 'center',
    maxWidth: 196,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.textSecondary,
    marginHorizontal: Spacing.l,
    opacity: 0.3,
  },
  pillsScroll: {
    flexGrow: 0,
    marginTop: Spacing.l,
  },
  pillsContainer: {
    flexDirection: 'row',
    gap: Spacing.s,
    paddingHorizontal: Spacing.l,
  },
  list: {
    flex: 1,
    marginTop: Spacing.m,
  },
  listContent: {
    paddingHorizontal: Spacing.l,
    paddingBottom: Spacing.xxl,
  },
});
