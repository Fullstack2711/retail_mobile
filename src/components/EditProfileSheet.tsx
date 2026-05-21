import React, { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  TouchableWithoutFeedback,
  Dimensions,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useLanguage } from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

export type EditProfileField = 'name' | 'phone'

interface EditProfileSheetProps {
  visible: boolean
  field: EditProfileField
  initialValue: string
  saving?: boolean
  onSave: (value: string) => void
  onClose: () => void
}

export default function EditProfileSheet({
  visible,
  field,
  initialValue,
  saving = false,
  onSave,
  onClose,
}: EditProfileSheetProps) {
  const { colors } = useTheme()
  const { t } = useLanguage()
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    if (visible) setValue(initialValue)
  }, [visible, initialValue])

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

  const title = field === 'name' ? t.profile.editNameTitle : t.profile.editPhoneTitle
  const placeholder =
    field === 'name' ? t.profile.namePlaceholder : t.profile.phonePlaceholder

  const handleSave = () => {
    const trimmed = value.trim()
    if (!trimmed) return
    onSave(trimmed)
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

      <KeyboardAvoidingView
        style={styles.keyboardWrap}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        pointerEvents="box-none"
      >
        <Animated.View
          style={[
            styles.sheet,
            { backgroundColor: colors.bgMain, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>

          <View style={[styles.inputWrap, { backgroundColor: colors.white, borderColor: colors.border }]}>
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              value={value}
              onChangeText={setValue}
              placeholder={placeholder}
              placeholderTextColor={colors.textSecondary}
              autoFocus
              editable={!saving}
              keyboardType={field === 'phone' ? 'phone-pad' : 'default'}
              autoCapitalize={field === 'name' ? 'words' : 'none'}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: colors.primary }, saving && styles.saveDisabled]}
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={saving || !value.trim()}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveText}>{t.profile.save}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={saving}>
            <Text style={[styles.cancelText, { color: colors.textSecondary }]}>{t.profile.cancel}</Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  keyboardWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  sheet: {
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
  inputWrap: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 16,
  },
  input: { fontSize: 16, paddingVertical: 12 },
  saveBtn: {
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  saveDisabled: { opacity: 0.7 },
  saveText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  cancelBtn: { paddingVertical: 12, alignItems: 'center' },
  cancelText: { fontSize: 15, fontWeight: '500' },
})
