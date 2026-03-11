import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  SectionList,
} from 'react-native';
import IllustrationEmpty from '../assets/illustration-empty.svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconArrowLeft, IconMagnifier } from '../components/icons';
import { Colors, Spacing, FontFamily, FontSize } from '../constants/theme';
import { LibraryWordItem } from '../components/LibraryWordItem';
import {
  getLibraryWords,
  getCategories,
  addWordToUserList,
  removeWordFromUserList,
  type Category,
  type LibraryWord,
} from '../db/queries';
import { useAuth } from '../context/AuthContext';

type SectionData = {
  title: string;
  key?: string;
  data: LibraryWord[];
};

export default function LibraryScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sections, setSections] = useState<SectionData[]>([]);

  const loadData = useCallback(
    (searchText: string, catId: string | null) => {
      if (!userId) return;
      const cats = getCategories();
      setCategories(cats);

      const words = getLibraryWords(userId, searchText, catId ?? undefined);

      // Group by sub_category_name, then category_name
      const grouped: Record<string, LibraryWord[]> = {};
      for (const word of words) {
        const key = word.sub_category_name ?? word.category_name ?? 'Other';
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(word);
      }

      const newSections: SectionData[] = Object.entries(grouped).map(
        ([title, data], i) => ({ title, key: `section-${i}-${title}`, data })
      );
      setSections(newSections);
    },
    [userId]
  );

  // Load on mount and when filters or user change
  React.useEffect(() => {
    loadData(search, selectedCategoryId);
  }, [search, selectedCategoryId, loadData]);

  function handleToggleWord(wordId: string, currentlyInList: boolean) {
    if (!userId) return;
    if (currentlyInList) {
      removeWordFromUserList(userId, wordId);
    } else {
      addWordToUserList(userId, wordId);
    }
    loadData(search, selectedCategoryId);
  }

  function handleCategoryPress(catId: string | null) {
    setSelectedCategoryId(catId === selectedCategoryId ? null : catId);
  }

  const hasResults = sections.length > 0;

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

      {/* Search + Category filters */}
      <View style={styles.filtersContainer}>
        {/* Search bar */}
        <View style={styles.searchBar}>
          <View style={{ marginRight: Spacing.xs }}>
            <IconMagnifier size={20} color={Colors.textSecondary} />
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Search words..."
            placeholderTextColor={Colors.textDisabled}
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
        </View>

        {/* Category filter pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryPills}
        >
          {categories.map((cat) => {
            const isSelected = cat.id === selectedCategoryId;
            return (
              <Pressable
                key={cat.id}
                onPress={() => handleCategoryPress(cat.id)}
                style={[
                  styles.pill,
                  isSelected && styles.pillSelected,
                ]}
              >
                <Text
                  style={[
                    styles.pillText,
                    isSelected && styles.pillTextSelected,
                  ]}
                >
                  {cat.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Word list */}
      {!hasResults ? (
        <View style={styles.emptyContainer}>
          <IllustrationEmpty width={250} height={239} />
          <Text style={styles.emptyText}>Nothing found</Text>
          <Text style={styles.emptySubText}>Our operator found no matching words.</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={({ item }) => (
            <LibraryWordItem
              word={item}
              onToggle={handleToggleWord}
            />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>{title}</Text>
              <View style={styles.sectionHeaderDivider} />
            </View>
          )}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={styles.listContent}
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
  filtersContainer: {
    paddingHorizontal: Spacing.l,
    paddingTop: Spacing.xl,
    gap: Spacing.s,
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
  categoryPills: {
    flexDirection: 'row',
    gap: Spacing.s,
    paddingVertical: Spacing.xs,
  },
  pill: {
    borderWidth: 2,
    borderColor: Colors.outline,
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.xs,
    flexShrink: 0,
  },
  pillSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  pillText: {
    fontFamily: FontFamily.loraRegular,
    fontSize: FontSize.body,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  pillTextSelected: {
    color: Colors.textInverted,
  },
  list: {
    flex: 1,
    marginTop: Spacing.xl,
  },
  listContent: {
    paddingHorizontal: Spacing.l,
    paddingBottom: Spacing.xxl,
  },
  sectionHeader: {
    gap: Spacing.m,
    paddingBottom: Spacing.s,
    marginTop: Spacing.m,
  },
  sectionHeaderText: {
    fontFamily: FontFamily.loraMedium,
    fontSize: FontSize.bodyLarge,
    color: Colors.accent,
    lineHeight: 28,
  },
  sectionHeaderDivider: {
    height: 1,
    backgroundColor: Colors.accent,
    opacity: 0.5,
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
