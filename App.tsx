import React, { useEffect } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import RNBootSplash from 'react-native-bootsplash'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AuthProvider, useAuth } from './src/context/AuthContext'
import { LanguageProvider } from './src/context/LanguageContext'
import { ThemeProvider } from './src/context/ThemeContext'
import AppNavigator from './src/navigation/AppNavigator'
import { loadIconFonts } from './src/setup/fonts'

function AppBootstrap() {
  const { isBootstrapping } = useAuth()

  useEffect(() => {
    loadIconFonts().catch(() => {})
  }, [])

  useEffect(() => {
    if (!isBootstrapping) {
      RNBootSplash.hide({ fade: true }).catch(() => {})
    }
  }, [isBootstrapping])

  if (isBootstrapping) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    )
  }

  return <AppNavigator />
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <LanguageProvider>
          <ThemeProvider>
            <AuthProvider>
              <AppBootstrap />
            </AuthProvider>
          </ThemeProvider>
        </LanguageProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  boot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
})
