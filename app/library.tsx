import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  FlatList,
} from 'react-native';
import IllustrationEmpty from '../assets/illustration-empty.svg';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconArrowLeft, IconMagnifier, IconShuffle } from '../components/icons';
import { Colors, Spacing, FontFamily, FontSize } from '../constants/theme';
import { LibraryWordItem } from '../components/LibraryWordItem';
import { CategoryCard } from '../components/CategoryCard';
import { WordModal } from '../components/WordModal';
import {
  getLibraryWords,
  getCategories,
  getUserWordMap,
  getRandomEligibleWord,
  addWordToUserList,
  removeWordFromUserList,
  markWordAsLearned,
  type Category,
  type LibraryWord,
  type UserWordWithWord,
  type UserWordInfo,
} from '../db/queries';
import { useAuth } from '../context/AuthContext';

export default function LibraryScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchResults, setSearchResults] = useState<LibraryWord[]>([]);
  const [userWordMap, setUserWordMap] = useState<Map<string, UserWordInfo>>(new Map());
  const [selectedWord, setSelectedWord] = useState<UserWordWithWord | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [hasEligibleWords, setHasEligibleWords] = useState(true);
  const [modalContext, setModalContext] = useState<'review' | 'library'>('review');

  const isSearching = search.trim().length > 0;

  const loadData = useCallback(async () => {
    if (!userId) return;
    const cats = getCategories();
    setCategories(cats);

    // Fetch user's word map from Supabase for variant computation
    const wordMap = await getUserWordMap(userId);
    setUserWordMap(wordMap);
    setHasEligibleWords(getRandomEligibleWord(wordMap) !== null);

    if (search.trim().length > 0) {
      const words = getLibraryWords(wordMap, search);
      setSearchResults(words);
    }
  }, [userId, search]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  function refreshSearchResults(map: Map<string, UserWordInfo>) {
    if (search.trim().length > 0) {
      setSearchResults(getLibraryWords(map, search));
    }
  }

  function handleStartLearning(wordId: string) {
    if (!userId) return;
    const updated = new Map(userWordMap);
    const existing = updated.get(wordId);
    updated.set(wordId, { level: existing?.level ?? 0, suspended: false, marked_as_learned: false });
    setUserWordMap(updated);
    setHasEligibleWords(getRandomEligibleWord(updated) !== null);
    refreshSearchResults(updated);

    addWordToUserList(userId, wordId).catch(() => {
      setUserWordMap(userWordMap);
      setHasEligibleWords(getRandomEligibleWord(userWordMap) !== null);
      refreshSearchResults(userWordMap);
    });
  }

  function handleMarkAsLearned(wordId: string) {
    if (!userId) return;
    const updated = new Map(userWordMap);
    const existing = updated.get(wordId);
    updated.set(wordId, { level: existing?.level ?? 0, suspended: false, marked_as_learned: true });
    setUserWordMap(updated);
    setHasEligibleWords(getRandomEligibleWord(updated) !== null);
    refreshSearchResults(updated);

    markWordAsLearned(userId, wordId).catch(() => {
      setUserWordMap(userWordMap);
      setHasEligibleWords(getRandomEligibleWord(userWordMap) !== null);
      refreshSearchResults(userWordMap);
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
    refreshSearchResults(updated);

    removeWordFromUserList(userId, wordId).catch(() => {
      setUserWordMap(userWordMap);
      refreshSearchResults(userWordMap);
    });
  }

  function handleSurpriseMe() {
    const word = getRandomEligibleWord(userWordMap);
    if (!word) { setHasEligibleWords(false); return; }
    setModalContext('library');
    handleWordPress(word);
  }

  function handleWordPress(word: LibraryWord) {
    const userWordInfo = userWordMap.get(word.id);
    const asUserWord: UserWordWithWord = {
      id: word.id,
      word_id: word.id,
      user_id: userId ?? '',
      level: userWordInfo?.level ?? 0,
      last_reviewed_at: null,
      next_review_at: '9999-12-31T00:00:00Z',
      suspended: userWordInfo?.suspended ?? false,
      marked_as_learned: userWordInfo?.marked_as_learned ?? false,
      successful_guesses: 0,
      failed_guesses: 0,
      created_at: '',
      spanish_word: word.spanish_word,
      english_translation: word.english_translation,
      type: word.type,
      category_id: word.category_id,
      sub_category_id: word.sub_category_id,
      example_sentence: word.example_sentence,
      is_active: word.is_active,
      category_name: word.category_name,
      sub_category_name: word.sub_category_name,
    };
    setSelectedWord(asUserWord);
    setModalVisible(true);
  }

  function handleCategoryPress(category: Category) {
    router.push({
      pathname: '/category/[id]',
      params: { id: category.id, name: category.name },
    });
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
          <IconArrowLeft size={22} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Add new words</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.divider} />

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <View style={{ marginRight: Spacing.xs }}>
            <IconMagnifier size={20} color={Colors.textSecondary} />
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Enter text here"
            placeholderTextColor={Colors.textDisabled}
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {isSearching ? (
        // Search results mode
        searchResults.length > 0 ? (
          <FlatList
            key="search-list"
            data={searchResults}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <LibraryWordItem
                word={item}
                onStartLearning={handleStartLearning}
                onMarkAsLearned={handleMarkAsLearned}
                onRemoveWord={handleRemoveWord}
                onPress={() => handleWordPress(item)}
              />
            )}
            contentContainerStyle={[styles.listContent, { paddingBottom: Spacing.xxl + insets.bottom }]}
            style={styles.list}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <IllustrationEmpty width={250} height={239} />
            <Text style={styles.emptyText}>Nothing found</Text>
            <Text style={styles.emptySubText}>Our operator found no matching words.</Text>
          </View>
        )
      ) : (
        // Category grid mode
        <FlatList
          key="category-grid"
          data={categories}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          renderItem={({ item }) => (
            <CategoryCard
              category={item}
              onPress={() => handleCategoryPress(item)}
            />
          )}
          ListHeaderComponent={() => (
            <View style={styles.surpriseHeader}>
              {hasEligibleWords ? (
                <>
                  <Pressable
                    style={({ pressed }) => [styles.surpriseCard, pressed && styles.surpriseCardPressed]}
                    onPress={handleSurpriseMe}
                  >
                    <IconShuffle size={28} color={Colors.textPrimary} />
                    <Text style={styles.surpriseCardText}>Suggest random word</Text>
                  </Pressable>
                  <Text style={styles.orSeparator}>Or browse by category</Text>
                </>
              ) : (
                <Text style={styles.noEligibleText}>You've added all available words!</Text>
              )}
            </View>
          )}
          contentContainerStyle={[styles.gridContent, { paddingBottom: Spacing.xxl + insets.bottom }]}
          style={styles.list}
        />
      )}
      <WordModal
        userWord={selectedWord}
        isDueForReview={false}
        visible={modalVisible}
        context={modalContext}
        onStartLearning={handleStartLearning}
        onMarkAsLearned={handleMarkAsLearned}
        onShowAnother={() => {
          const word = getRandomEligibleWord(userWordMap);
          if (!word) { setHasEligibleWords(false); setModalVisible(false); setSelectedWord(null); return; }
          handleWordPress(word);
        }}
        onClose={() => { setModalVisible(false); setSelectedWord(null); setModalContext('review'); }}
        onSubmitGuess={() => {}}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.l,
    paddingTop: Spacing.m,
    paddingBottom: Spacing.m,
  },
  backButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: FontFamily.playfairBold,
    fontSize: FontSize.heading3,
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: 1,
    lineHeight: 30,
  },
  headerRight: {
    width: 30,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.textSecondary,
    marginHorizontal: Spacing.l,
    opacity: 0.3,
  },
  searchContainer: {
    paddingHorizontal: Spacing.l,
    paddingTop: Spacing.l,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.outline,
    paddingHorizontal: Spacing.s,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamily.loraRegular,
    fontSize: FontSize.body,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  list: {
    flex: 1,
    marginTop: Spacing.l,
  },
  listContent: {
    paddingHorizontal: Spacing.l,
    paddingBottom: Spacing.xxl,
  },
  gridContent: {
    paddingHorizontal: Spacing.l,
    paddingBottom: Spacing.xxl,
    gap: Spacing.s,
  },
  gridRow: {
    gap: Spacing.s,
  },
  surpriseHeader: {
    gap: Spacing.m,
    paddingBottom: Spacing.m,
  },
  surpriseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.s,
    borderWidth: 2,
    borderColor: Colors.outline,
    backgroundColor: Colors.background,
    paddingVertical: Spacing.m,
    paddingHorizontal: Spacing.m,
  },
  surpriseCardPressed: {
    backgroundColor: Colors.backgroundSecondary,
  },
  surpriseCardText: {
    fontFamily: FontFamily.loraMedium,
    fontSize: FontSize.body,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  orSeparator: {
    fontFamily: FontFamily.loraRegular,
    fontSize: FontSize.small,
    color: '#605752',
    textAlign: 'center',
  },
  noEligibleText: {
    fontFamily: FontFamily.loraRegular,
    fontSize: FontSize.small,
    color: '#605752',
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.l,
    gap: Spacing.s,
  },
  emptyText: {
    fontFamily: FontFamily.playfairBold,
    fontSize: FontSize.heading3,
    color: Colors.textSecondary,
    textAlign: 'center',
    letterSpacing: 1,
    lineHeight: 30,
  },
  emptySubText: {
    fontFamily: FontFamily.loraRegular,
    fontSize: FontSize.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    width: 240,
    lineHeight: 24,
  },
});
