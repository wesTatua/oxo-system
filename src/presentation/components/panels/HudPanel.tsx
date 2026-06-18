import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Spacing, Fonts } from '../../theme';

interface Props {
  title: string;
  icon?: string;
  children: React.ReactNode;
  style?: ViewStyle;
  flex?: boolean;
}

export function HudPanel({ title, icon, children, style, flex }: Props) {
  return (
    <View style={[styles.wrap, flex && { flex: 1 }, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {icon && <Text style={styles.icon}>{icon}</Text>}
      </View>
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.bgPanel,
    borderWidth: 1,
    borderColor: Colors.border,
    borderTopRightRadius: 0,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,200,180,0.25)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 8,
    letterSpacing: 2.5,
    color: Colors.tealHi,
    fontWeight: '700',
  },
  icon: {
    fontSize: 11,
    opacity: 0.6,
  },
  body: {
    padding: Spacing.md,
  },
});
