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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconArrowLeft, IconMagnifier } from '../components/icons';
import { Colors, Spacing, FontFamily, FontSize } from '../constants/theme';
import { LibraryWordItem } from '../components/LibraryWordItem';
import { CategoryCard } from '../components/CategoryCard';
import {
  getLibraryWords,
  getCategories,
  getUserWordIds,
  addWordToUserList,
  removeWordFromUserList,
  type Category,
  type LibraryWord,
} from '../db/queries';
import { useAuth } from '../context/AuthContext';

export default function LibraryScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchResults, setSearchResults] = useState<LibraryWord[]>([]);
  const [userWordIds, setUserWordIds] = useState<Set<string>>(new Set());

  const isSearching = search.trim().length > 0;

  const loadData = useCallback(async () => {
    if (!userId) return;
    const cats = getCategories();
    setCategories(cats);

    // Fetch user's word IDs from Supabase for is_in_list flag
    const wordIds = await getUserWordIds(userId);
    setUserWordIds(wordIds);

    if (search.trim().length > 0) {
      const words = getLibraryWords(wordIds, search);
      setSearchResults(words);
    }
  }, [userId, search]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  function handleToggleWord(wordId: string, currentlyInList: boolean) {
    if (!userId) return;

    // Optimistic update — flip the UI instantly
    const updatedWordIds = new Set(userWordIds);
    if (currentlyInList) {
      updatedWordIds.delete(wordId);
    } else {
      updatedWordIds.add(wordId);
    }
    setUserWordIds(updatedWordIds);
    if (search.trim().length > 0) {
      setSearchResults(getLibraryWords(updatedWordIds, search));
    }

    // Sync with Supabase in the background; revert on failure
    const syncPromise = currentlyInList
      ? removeWordFromUserList(userId, wordId)
      : addWordToUserList(userId, wordId);

    syncPromise.catch(() => {
      setUserWordIds(userWordIds); // revert
      if (search.trim().length > 0) {
        setSearchResults(getLibraryWords(userWordIds, search));
      }
    });
  }

  function handleCategoryPress(category: Category) {
    router.push({
      pathname: '/category/[id]',
      params: { id: category.id, name: category.name },
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
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
                onToggle={handleToggleWord}
              />
            )}
            contentContainerStyle={styles.listContent}
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
          contentContainerStyle={styles.gridContent}
          style={styles.list}
        />
      )}
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
    lineHeight: 24,
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
