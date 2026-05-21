import React, { memo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from './icons'
import { useTheme } from '../context/ThemeContext'

interface StatCardProps {
  title: string
  value: string
  percent: string
  isPositive: boolean
  iconName: string
}

function StatCard({ title, value, percent, isPositive, iconName }: StatCardProps) {
  const { colors } = useTheme()
  return (
    <View style={[styles.card, { backgroundColor: colors.white }]}>
      <Text style={[styles.title, { color: colors.textSecondary }]}>{title}</Text>
      <Text style={[styles.value, { color: colors.textPrimary }]}>{value}</Text>
      <View style={styles.bottom}>
        <View style={styles.percentRow}>
          <Ionicons
            name={isPositive ? 'arrow-up' : 'arrow-down'}
            size={12}
            color={isPositive ? colors.green : colors.red}
          />
          <Text style={[styles.percent, { color: isPositive ? colors.green : colors.red }]}>
            {percent}
          </Text>
        </View>
        <Ionicons name={iconName as any} size={24} color={colors.border} />
      </View>
    </View>
  )
}

export default memo(StatCard)

const styles = StyleSheet.create({
  card: { flex: 1, borderRadius: 20, padding: 16, gap: 8 },
  title: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  value: { fontSize: 28, fontWeight: '700' },
  bottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  percentRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  percent: { fontSize: 13, fontWeight: '500' },
})
