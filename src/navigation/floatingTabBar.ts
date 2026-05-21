import { Platform, StyleSheet } from 'react-native'
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs'
import type { AppColors } from '../context/ThemeContext'

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
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 18 : 13,
    paddingBottom: 0,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
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
    tabBarStyle: [
      floatingTabBarStyles.tabBar,
      isAndroid && floatingTabBarStyles.tabBarAndroid,
      {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.border,
        shadowOpacity: isDark ? 0 : isAndroid ? 0 : 0.18,
        marginBottom,
      },
    ],
    tabBarItemStyle: floatingTabBarStyles.tabBarItem,
  }
}
