import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { CommonActions } from '@react-navigation/native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Ionicons } from '../../components/icons'
import { useTheme } from '../../context/ThemeContext'
import { useLanguage } from '../../context/LanguageContext'
import { submitVisitorAnswer } from '../../services/visitorSurvey'
import { uiStatusToApi } from '../../utils/surveyFormat'
import { ApiError } from '../../services/api/errors'
import { devLog } from '../../utils/devLog'
import type { SellerFeedStackParamList } from '../../navigation/sellerTypes'

type Props = NativeStackScreenProps<SellerFeedStackParamList, 'RecordActivity'>
type UiStatus = 'bought' | 'not_bought'

export default function RecordActivityScreen({ navigation, route }: Props) {
  const {
    visitorId,
    dateTime,
    displayId,
    visitorImage,
    comment: presetComment,
  } = route.params
  const { colors } = useTheme()
  const { t } = useLanguage()
  const [status, setStatus] = useState<UiStatus>('bought')
  const [comment, setComment] = useState(presetComment?.trim() ?? '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await submitVisitorAnswer(visitorId, uiStatusToApi(status), comment)
      devLog('[VisitorSurvey] Saqlandi:', { visitorId, status })

      navigation.reset({ index: 0, routes: [{ name: 'LiveFeed' }] })
      navigation.getParent()?.dispatch(
        CommonActions.navigate({
          name: 'History',
          params: { screen: 'MySales' },
        }),
      )
    } catch (e) {
      const message = e instanceof ApiError ? e.message : t.seller.saveError
      devLog('[VisitorSurvey] Saqlash xato:', e)
      Alert.alert(t.login.errorTitle, message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bgMain }]} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.white }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          disabled={saving}
        >
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>
          {t.seller.recordTitle}
        </Text>
        <View style={styles.backPlaceholder} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.card, { backgroundColor: colors.white }]}>
            {visitorImage ? (
              <Image
                source={{ uri: visitorImage }}
                style={styles.heroImage}
                resizeMode="cover"
              />
            ) : null}
            <Text style={[styles.idLabel, { color: colors.textPrimary }]}>
              {t.seller.idLabel}: {displayId}
            </Text>
            <Text style={[styles.dateTime, { color: colors.textSecondary }]}>{dateTime}</Text>

            <View style={[styles.toggle, { backgroundColor: colors.bgMain }]}>
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  status === 'bought' && { backgroundColor: colors.white },
                ]}
                onPress={() => setStatus('bought')}
                activeOpacity={0.8}
                disabled={saving}
              >
                <Text
                  style={[
                    styles.toggleText,
                    { color: status === 'bought' ? colors.green : colors.textSecondary },
                    status === 'bought' && styles.toggleTextActive,
                  ]}
                >
                  {t.seller.bought}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  status === 'not_bought' && { backgroundColor: colors.white },
                ]}
                onPress={() => setStatus('not_bought')}
                activeOpacity={0.8}
                disabled={saving}
              >
                <Text
                  style={[
                    styles.toggleText,
                    {
                      color:
                        status === 'not_bought' ? colors.textPrimary : colors.textSecondary,
                    },
                    status === 'not_bought' && styles.toggleTextActive,
                  ]}
                >
                  {t.seller.notBought}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.commentsLabel, { color: colors.textPrimary }]}>
              {t.seller.comments}
            </Text>
            <View style={[styles.inputWrap, { borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                placeholder={t.seller.commentPlaceholder}
                placeholderTextColor={colors.textSecondary}
                value={comment}
                onChangeText={(text) => setComment(text.slice(0, 200))}
                multiline
                textAlignVertical="top"
                editable={!saving}
              />
              <Text style={[styles.counter, { color: colors.textSecondary }]}>
                {comment.length}/200
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.primary }, saving && styles.saveDisabled]}
              onPress={handleSave}
              activeOpacity={0.85}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.saveText}>{t.seller.save}</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  backPlaceholder: { width: 40 },
  screenTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
  },
  scroll: { paddingHorizontal: 16, paddingBottom: 32 },
  card: { borderRadius: 24, padding: 24, gap: 16 },
  heroImage: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    alignSelf: 'center',
  },
  idLabel: { fontSize: 22, fontWeight: '700' },
  dateTime: { fontSize: 15, marginTop: -8 },
  toggle: {
    flexDirection: 'row',
    borderRadius: 50,
    padding: 4,
    marginTop: 8,
  },
  toggleBtn: {
    flex: 1,
    borderRadius: 50,
    paddingVertical: 12,
    alignItems: 'center',
  },
  toggleText: { fontSize: 15, fontWeight: '500' },
  toggleTextActive: { fontWeight: '600' },
  commentsLabel: { fontSize: 14, fontWeight: '500', marginTop: 8 },
  inputWrap: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    minHeight: 120,
  },
  input: { fontSize: 15, minHeight: 80, padding: 0 },
  counter: { fontSize: 12, textAlign: 'right', marginTop: 8 },
  saveBtn: {
    borderRadius: 50,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  saveDisabled: { opacity: 0.7 },
  saveText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
})
