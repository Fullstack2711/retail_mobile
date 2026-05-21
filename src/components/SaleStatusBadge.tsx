import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from './icons'
import { useTheme } from '../context/ThemeContext'
import { useLanguage } from '../context/LanguageContext'
import type { SaleListItem } from '../types/visitorSurvey'

export default function SaleStatusBadge({ status }: { status: SaleListItem['status'] }) {
  const { colors } = useTheme()
  const { t } = useLanguage()

  if (status === 'pending') {
    return (
      <View style={[styles.badge, { backgroundColor: colors.primaryLight }]}>
        <Ionicons name="time-outline" size={16} color={colors.primary} />
        <Text style={[styles.badgeText, { color: colors.primary }]}>
          {t.seller.statusPending}
        </Text>
      </View>
    )
  }

  const isBought = status === 'bought'

  return (
    <View
      style={[styles.badge, { backgroundColor: isBought ? '#E8F8ED' : colors.redLight }]}
    >
      <Ionicons
        name={isBought ? 'checkmark-circle' : 'close-circle'}
        size={16}
        color={isBought ? colors.green : colors.red}
      />
      <Text style={[styles.badgeText, { color: isBought ? colors.green : colors.red }]}>
        {isBought ? t.seller.bought : t.seller.notBought}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 50,
    flexShrink: 0,
  },
  badgeText: { fontSize: 12, fontWeight: '600' },
})
