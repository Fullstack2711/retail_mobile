import React, { useState } from 'react'
import {
  View, Text, StyleSheet,
  TouchableOpacity, ScrollView, Alert, Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { Ionicons } from '../../components/icons'
import ProfileItem from '../../components/ProfileItem'
import LanguageSheet from '../../components/LanguageSheet'
import ThemeSheet from '../../components/ThemeSheet'
import ConfirmModal from '../../components/ConfirmModal'
import EditProfileSheet, { EditProfileField } from '../../components/EditProfileSheet'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { useTheme } from '../../context/ThemeContext'
import { LANGUAGES } from '../../mock/data'
import { ApiError } from '../../services/api/errors'

export default function ProfileScreen() {
  const { logout, user, updateProfile } = useAuth()
  const { theme, colors } = useTheme()
  const { lang, setLang, t } = useLanguage()
  const [langVisible, setLangVisible] = useState(false)
  const [themeVisible, setThemeVisible] = useState(false)
  const [logoutVisible, setLogoutVisible] = useState(false)
  const [editField, setEditField] = useState<EditProfileField | null>(null)
  const [saving, setSaving] = useState(false)
  const tabBarHeight = useBottomTabBarHeight()

  const langLabel = LANGUAGES.find((l) => l.code === lang)?.label ?? ''

  const handleSelectLang = (code: string) => {
    setLang(code as typeof lang)
    setLangVisible(false)
  }

  const handleConfirmLogout = async () => {
    setLogoutVisible(false)
    await logout()
  }

  const handleSaveField = async (value: string) => {
    if (!editField) return
    setSaving(true)
    try {
      if (editField === 'name') {
        await updateProfile({ name: value })
      } else {
        await updateProfile({ phone: value })
      }
      setEditField(null)
    } catch (e) {
      const message = e instanceof ApiError ? e.message : t.profile.saveError
      Alert.alert(t.login.errorTitle, message)
    } finally {
      setSaving(false)
    }
  }

  const themeLabel = theme === 'dark' ? t.profile.themeDark : t.profile.themeLight

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgMain }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: tabBarHeight + 20 }}
      >
        <View style={styles.heroSection}>
          <View style={[styles.avatarWrap, { backgroundColor: colors.primaryLight, borderColor: colors.border }]}>
            {user?.image ? (
              <Image source={{ uri: user.image }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person" size={40} color={colors.primary} />
            )}
          </View>
          <Text style={[styles.heroName, { color: colors.textPrimary }]}>
            {user?.name ?? t.profile.title}
          </Text>
          <Text style={[styles.heroSub, { color: colors.textSecondary }]}>
            {user?.companyName ?? user?.roleName ?? t.profile.title}
          </Text>
        </View>

        <View style={styles.section}>
          <ProfileItem
            iconName="person-outline"
            value={user?.name ?? '—'}
            label={t.profile.name}
            rightType="edit"
            onPress={() => setEditField('name')}
          />
          <ProfileItem
            iconName="call-outline"
            value={user?.phone || '—'}
            label={t.profile.phone}
            rightType="edit"
            onPress={() => setEditField('phone')}
          />
          <ProfileItem
            iconName="globe-outline"
            value={langLabel}
            label={t.profile.language}
            rightType="chevron"
            onPress={() => setLangVisible(true)}
          />
          <ProfileItem
            iconName={theme === 'dark' ? 'moon-outline' : 'sunny-outline'}
            value={themeLabel}
            label={t.profile.appearance}
            rightType="chevron"
            onPress={() => setThemeVisible(true)}
          />
        </View>

        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: colors.redLight }]}
          onPress={() => setLogoutVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={[styles.logoutText, { color: colors.red }]}>{t.profile.logOut}</Text>
          <Ionicons name="log-out-outline" size={20} color={colors.red} />
        </TouchableOpacity>
      </ScrollView>

      <EditProfileSheet
        visible={editField != null}
        field={editField ?? 'name'}
        initialValue={editField === 'phone' ? (user?.phone ?? '') : (user?.name ?? '')}
        saving={saving}
        onSave={handleSaveField}
        onClose={() => !saving && setEditField(null)}
      />

      <LanguageSheet
        visible={langVisible}
        selectedLang={lang}
        onSelect={handleSelectLang}
        onClose={() => setLangVisible(false)}
      />
      <ThemeSheet
        visible={themeVisible}
        onClose={() => setThemeVisible(false)}
      />
      <ConfirmModal
        visible={logoutVisible}
        title={t.profile.logOut}
        message={t.profile.logOutConfirm}
        cancelLabel={t.profile.cancel}
        confirmLabel={t.profile.exit}
        onCancel={() => setLogoutVisible(false)}
        onConfirm={handleConfirmLogout}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  heroSection: { alignItems: 'center', paddingVertical: 32, gap: 6 },
  avatarWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: 8,
  },
  avatarImage: { width: '100%', height: '100%' },
  heroName: { fontSize: 24, fontWeight: '700' },
  heroSub: { fontSize: 14 },
  section: { paddingHorizontal: 16, gap: 10 },
  logoutBtn: {
    marginHorizontal: 16, marginTop: 24,
    borderRadius: 50, paddingVertical: 16,
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', gap: 8,
  },
  logoutText: { fontSize: 16, fontWeight: '600' },
})
