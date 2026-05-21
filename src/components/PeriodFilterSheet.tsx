import React, { useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native'
import { useLanguage } from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'
import { STATS_PERIODS, StatsPeriod } from '../types/statsPeriod'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

interface PeriodFilterSheetProps {
  visible: boolean
  selected: StatsPeriod
  onSelect: (period: StatsPeriod) => void
  onClose: () => void
}

export default function PeriodFilterSheet({
  visible,
  selected,
  onSelect,
  onClose,
}: PeriodFilterSheetProps) {
  const { colors } = useTheme()
  const { t } = useLanguage()
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start()
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start()
    }
  }, [visible, slideAnim])

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.sheet,
          { backgroundColor: colors.bgMain, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={[styles.handle, { backgroundColor: colors.border }]} />
        <Text style={[styles.title, { color: colors.textPrimary }]}>{t.stats.periodFilterTitle}</Text>

        <View style={styles.list}>
          {STATS_PERIODS.map((period) => {
            const isSelected = selected === period
            const label =
              period === 'daily'
                ? t.stats.periodDaily
                : period === 'weekly'
                  ? t.stats.periodWeekly
                  : t.stats.periodMonthly
            return (
              <TouchableOpacity
                key={period}
                style={[styles.item, { backgroundColor: colors.white }]}
                onPress={() => onSelect(period)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.radio,
                    { borderColor: isSelected ? colors.primary : colors.border },
                  ]}
                >
                  {isSelected ? (
                    <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />
                  ) : null}
                </View>
                <Text style={[styles.itemLabel, { color: colors.textPrimary }]}>{label}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </Animated.View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 16 },
  list: { gap: 10 },
  item: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  itemLabel: { flex: 1, fontSize: 16, fontWeight: '500' },
})
