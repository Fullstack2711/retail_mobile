import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from './icons'
import { useTheme } from '../context/ThemeContext'

interface ProfileItemProps {
  iconName: string
  value: string
  label: string
  rightType?: 'edit' | 'chevron'
  onPress?: () => void
}

export default function ProfileItem({
  iconName, value, label, rightType = 'edit', onPress,
}: ProfileItemProps) {
  const { colors } = useTheme()
  return (
    <TouchableOpacity
      style={[styles.item, { backgroundColor: colors.white }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.bgMain }]}>
        <Ionicons name={iconName as any} size={18} color={colors.textSecondary} />
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.value, { color: colors.textPrimary }]}>{value}</Text>
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      </View>
      {rightType === 'edit' ? (
        <Ionicons name="create-outline" size={20} color={colors.textSecondary} />
      ) : (
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  item: {
    borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  iconWrap: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  textWrap: { flex: 1, gap: 2 },
  value: { fontSize: 15, fontWeight: '600' },
  label: { fontSize: 12 },
})
