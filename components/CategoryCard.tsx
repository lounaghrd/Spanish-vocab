import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors, Spacing, FontFamily, FontSize } from '../constants/theme';
import { getCategoryIcon } from '../constants/categoryIcons';
import type { Category } from '../db/queries';

type Props = {
  category: Category;
  onPress: () => void;
};

export function CategoryCard({ category, onPress }: Props) {
  const IconComponent = getCategoryIcon(category.name, 'normal');

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      {IconComponent && (
        <View style={styles.iconWrapper}>
          <IconComponent width={28} height={28} />
        </View>
      )}
      <Text style={styles.name} numberOfLines={3}>
        {category.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.s,
    borderWidth: 2,
    borderColor: Colors.outline,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.m,
    height: 90,
  },
  cardPressed: {
    backgroundColor: Colors.backgroundSecondary,
  },
  iconWrapper: {
    width: 28,
    height: 28,
    flexShrink: 0,
    overflow: 'hidden',
  },
  name: {
    fontFamily: FontFamily.loraRegular,
    fontSize: FontSize.small,
    color: Colors.textPrimary,
    lineHeight: 16,
    textAlign: 'center',
    maxWidth: 100,
  },
});
