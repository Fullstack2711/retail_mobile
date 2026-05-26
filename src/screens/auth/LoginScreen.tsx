import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native'
import { Ionicons } from '../../components/icons'
import AppPressable from '../../components/AppPressable'
import { COLORS } from '../../constants/colors'
import { useAuth, UnsupportedRoleError } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { ApiError } from '../../services/api/errors'


export default function LoginScreen() {
  const { login, isLoading } = useAuth()
  const { t } = useLanguage()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({ username: '', password: '' })

  const validate = () => {
    const newErrors = { username: '', password: '' }
    let isValid = true

    if (!username.trim()) {
      newErrors.username = t.login.usernameRequired
      isValid = false
    }

    if (!password) {
      newErrors.password = t.login.passwordRequired
      isValid = false
    } else if (password.length < 6) {
      newErrors.password = t.login.passwordMin
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  // ─── Login handler ────────────────────────────────
  const handleLogin = async () => {
    if (!validate()) return

    try {
      await login(username, password)
    } catch (error) {
      if (error instanceof UnsupportedRoleError) {
        Alert.alert(t.login.errorTitle, t.login.errorUnsupportedRole)
        return
      }
      const message =
        error instanceof ApiError && error.message
          ? error.message
          : t.login.errorCredentials
      Alert.alert(t.login.errorTitle, message)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── LOGO ── */}
          <View style={styles.logoSection}>
            <Image
              source={require('../../../assets/login.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

         

          {/* ── LOGIN CARD ── */}
          <View style={styles.card}>

            <Text style={styles.cardTitle}>{t.login.welcome}</Text>
            {/* <Text style={styles.cardSub}>Sign in to your account</Text> */}

            {/* <View style={styles.divider} /> */}

            {/* Login */}
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>{t.login.login}</Text>
              <View style={[styles.inputWrap, errors.username && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  placeholder={t.login.usernamePlaceholder}
                  placeholderTextColor={COLORS.textSecondary}
                  value={username}
                  onChangeText={(text) => {
                    setUsername(text)
                    if (errors.username) setErrors((e) => ({ ...e, username: '' }))
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  underlineColorAndroid="transparent"
                />
              </View>
              {errors.username ? <Text style={styles.errorText}>{errors.username}</Text> : null}
            </View>

            {/* Password */}
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>{t.login.password}</Text>
              <View style={[styles.inputWrap, errors.password && styles.inputError]}>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••••"
                  placeholderTextColor={COLORS.textSecondary}
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t)
                    if (errors.password) setErrors((e) => ({ ...e, password: '' }))
                  }}
                  secureTextEntry={!showPassword}
                  underlineColorAndroid="transparent"
                />
                <AppPressable onPress={() => setShowPassword(!showPassword)} pressedOpacity={0.7}>
                  <Ionicons
                    name={showPassword ? 'eye' : 'eye-off'}
                    size={20}
                    color={COLORS.textSecondary}
                  />
                </AppPressable>
              </View>
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
            </View>

            <AppPressable
              style={[styles.loginBtn, isLoading && styles.loginBtnDisabled]}
              onPress={handleLogin}
              rippleColor="rgba(255, 255, 255, 0.2)"
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <>
                  <Text style={styles.loginBtnText}>{t.login.submit}</Text>
                  <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
                </>
              )}
            </AppPressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bgMain },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 32 },
  logoSection: { alignItems: 'center', marginTop: 80, marginBottom: 60 },
  logoImage: { width: 200, height: 80 },
  signUpChip: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#E8E8ED', borderRadius: 50,
    paddingHorizontal: 20, paddingVertical: 16, marginBottom: 12,
  },
  chipLeft: { color: COLORS.textSecondary, fontSize: 15 },
  chipRight: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '600' },
  card: { backgroundColor: COLORS.white, borderRadius: 24, padding: 24 },
  cardTitle: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 30 , textAlign: 'center' },
  cardSub: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 20, textAlign: 'center' },
  divider: { height: 1, backgroundColor: COLORS.border, marginBottom: 24 },
  fieldWrap: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: COLORS.textPrimary, marginBottom: 8 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 50, paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'android' ? 8 : 14,
    marginBottom: 4,
  },
  inputError: { borderColor: COLORS.red },
  input: {
    flex: 1, fontSize: 15, color: COLORS.textPrimary,
    paddingVertical: Platform.OS === 'android' ? 8 : 0,
    includeFontPadding: false,
  },
  errorText: { fontSize: 12, color: COLORS.red, marginBottom: 10, marginLeft: 4 },
  rememberRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 16 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: {
    width: 20, height: 20, borderRadius: 4,
    borderWidth: 1.5, borderColor: COLORS.border,
    justifyContent: 'center', alignItems: 'center',
  },
  checkboxActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  rememberText: { fontSize: 14, color: COLORS.textPrimary },
  forgotText: { fontSize: 14, color: COLORS.textSecondary },
  loginBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 50,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    overflow: 'hidden',
  },
  loginBtnDisabled: { opacity: 0.7 },
  loginBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
})