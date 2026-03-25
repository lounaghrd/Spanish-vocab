import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Dimensions,
} from 'react-native';
import { IconCycle, IconCheck } from './icons';
import {
  Colors,
  Spacing,
  FontFamily,
  FontSize,
} from '../constants/theme';

type Props = {
  visible: boolean;
  anchorPosition: { x: number; y: number; width: number; height: number };
  onStartLearning: () => void;
  onMarkAsLearned: () => void;
  onClose: () => void;
};

const MENU_WIDTH = 190;

export function WordSelectMenu({
  visible,
  anchorPosition,
  onStartLearning,
  onMarkAsLearned,
  onClose,
}: Props) {
  const screenHeight = Dimensions.get('window').height;

  // Position menu right-aligned below the anchor button
  const menuTop = anchorPosition.y + anchorPosition.height + 4;
  const menuRight = Dimensions.get('window').width - anchorPosition.x - anchorPosition.width;

  // If menu would go off-screen bottom, flip above
  const flipAbove = menuTop + 90 > screenHeight;
  const finalTop = flipAbove
    ? anchorPosition.y - 90 - 4
    : menuTop;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View
          style={[
            styles.menu,
            {
              top: finalTop,
              right: menuRight,
            },
          ]}
        >
          <Pressable
            style={({ pressed }) => [
              styles.menuRow,
              styles.menuRowFirst,
              pressed && styles.menuRowPressed,
            ]}
            onPress={() => {
              onStartLearning();
              onClose();
            }}
          >
            <IconCycle size={18} color={Colors.textPrimary} />
            <Text style={styles.menuText}>Learn word</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.menuRow,
              pressed && styles.menuRowPressed,
            ]}
            onPress={() => {
              onMarkAsLearned();
              onClose();
            }}
          >
            <IconCheck size={18} color={Colors.textPrimary} />
            <Text style={styles.menuText}>Mark as learned</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  menu: {
    position: 'absolute',
    width: MENU_WIDTH,
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.outline,
    // Hard drop shadow matching Figma "Modale shadow secondary"
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.s,
    gap: Spacing.s,
  },
  menuRowFirst: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.outline,
  },
  menuRowPressed: {
    backgroundColor: Colors.backgroundSecondary,
  },
  menuText: {
    fontFamily: FontFamily.loraMedium,
    fontSize: FontSize.body,
    color: Colors.textPrimary,
    lineHeight: 24,
    letterSpacing: 0.2,
  },
});
