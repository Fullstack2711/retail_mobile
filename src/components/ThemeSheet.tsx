import React, { useEffect, useRef } from 'react'
import {
  View, Text, StyleSheet,
  Modal, Animated, TouchableWithoutFeedback, Dimensions,
} from 'react-native'
import { Ionicons } from './icons'
import AppPressable from './AppPressable'
import { useLanguage } from '../context/LanguageContext'
import { useTheme, Theme } from '../context/ThemeContext'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

interface ThemeSheetProps {
  visible: boolean
  onClose: () => void
}

export default function ThemeSheet({ visible, onClose }: ThemeSheetProps) {
  const { theme, setTheme, colors } = useTheme()
  const { t } = useLanguage()

  const THEMES: { code: Theme; label: string; icon: string }[] = [
    { code: 'light', label: t.profile.themeLight, icon: 'sunny-outline' },
    { code: 'dark', label: t.profile.themeDark, icon: 'moon-outline' },
  ]
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
  }, [visible])

  const handleSelect = (code: Theme) => {
    setTheme(code)
    onClose()
  }

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
        <Text style={[styles.title, { color: colors.textPrimary }]}>{t.profile.themeSheetTitle}</Text>

        <View style={styles.list}>
          {THEMES.map((t) => {
            const isSelected = theme === t.code
            return (
              <AppPressable
                key={t.code}
                style={[styles.item, { backgroundColor: colors.white }]}
                onPress={() => handleSelect(t.code)}
              >
                <View style={[styles.radio, { borderColor: isSelected ? colors.primary : colors.border }]}>
                  {isSelected && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
                </View>
                <Ionicons name={t.icon as any} size={20} color={colors.textSecondary} />
                <Text style={[styles.label, { color: colors.textPrimary }]}>{t.label}</Text>
              </AppPressable>
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
    position: 'absolute', bottom: 0, left: 0, right: 0,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 16, paddingBottom: 40, paddingTop: 12,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    alignSelf: 'center', marginBottom: 16,
  },
  title: {
    fontSize: 18, fontWeight: '700',
    textAlign: 'center', marginBottom: 16,
  },
  list: { gap: 10 },
  item: {
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, justifyContent: 'center', alignItems: 'center',
  },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  label: { flex: 1, fontSize: 16, fontWeight: '500' },
})
