import React from 'react'
import { Platform, Pressable, StyleSheet, View } from 'react-native'
import type {
  BottomTabBarButtonProps,
  BottomTabNavigationOptions,
} from '@react-navigation/bottom-tabs'
import type { AppColors } from '../context/ThemeContext'

/** RN default borderless ripple icon ustida qora doira qoldiradi */
function FloatingTabBarButton({
  children,
  style,
  isDark,
  ...rest
}: BottomTabBarButtonProps & { isDark: boolean }) {
  const rippleColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)'
  const flat = StyleSheet.flatten(style)

  return (
    <View
      style={[
        { flex: flat?.flex ?? 1 },
        floatingTabBarStyles.tabButtonOuter,
      ]}
    >
      <Pressable
        {...rest}
        style={({ pressed }) => [
          floatingTabBarStyles.tabButtonHit,
          Platform.OS === 'ios' && pressed && { opacity: 0.82 },
        ]}
        android_ripple={
          Platform.OS === 'android'
            ? { color: rippleColor, borderless: false, radius: 24 }
            : undefined
        }
      >
        {children}
      </Pressable>
    </View>
  )
}

export const floatingTabBarStyles = StyleSheet.create({
  tabBarAndroid: {
    elevation: 4,
  },
  tabBar: {
    borderTopWidth: 0,
    elevation: 12,
    height: 65,
    borderRadius: 50,
    marginHorizontal: 72,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    position: 'absolute',
  },
  tabBarItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabButtonOuter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabButtonHit: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
})

export function buildFloatingTabOptions(
  colors: AppColors,
  marginBottom: number,
  isDark: boolean,
): BottomTabNavigationOptions {
  const isAndroid = Platform.OS === 'android'
  return {
    headerShown: false,
    lazy: true,
    freezeOnBlur: true,
    tabBarShowLabel: false,
    tabBarLabelPosition: 'beside-icon',
    tabBarStyle: [
      floatingTabBarStyles.tabBar,
      isAndroid && floatingTabBarStyles.tabBarAndroid,
      {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        shadowOpacity: isDark ? 0 : isAndroid ? 0 : 0.18,
        marginBottom,
        // marginBottom allaqachon safe area; ichki padding ikonlarni tepaga suradi
        paddingTop: 0,
        paddingBottom: 0,
      },
    ],
    tabBarItemStyle: floatingTabBarStyles.tabBarItem,
    tabBarActiveBackgroundColor: 'transparent',
    tabBarInactiveBackgroundColor: 'transparent',
    tabBarButton: (props) => <FloatingTabBarButton {...props} isDark={isDark} />,
  }
}
