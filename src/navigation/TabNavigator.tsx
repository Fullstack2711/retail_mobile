import React, { useMemo } from 'react'
import { View } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '../components/icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '../context/ThemeContext'
import { buildFloatingTabOptions, floatingTabBarStyles } from './floatingTabBar'
import StatsScreen from '../screens/main/StatsScreen'
import TeamScreen from '../screens/main/TeamScreen'
import ProfileScreen from '../screens/main/ProfileScreen'

const Tab = createBottomTabNavigator()

const TabIcon = React.memo(function TabIcon({ routeName, focused }: { routeName: string; focused: boolean }) {
  const { colors } = useTheme()
  const iconColor = focused ? colors.white : colors.textSecondary

  const ioniconMap: Record<string, string> = {
    Stats: 'bar-chart',
    Team: 'people',
    Profile: 'person',
  }
  const base = ioniconMap[routeName]

  return (
    <View style={[floatingTabBarStyles.iconWrap, focused && { backgroundColor: colors.primary }]}>
      <Ionicons
        name={(focused ? base : `${base}-outline`) as any}
        size={22}
        color={iconColor}
      />
    </View>
  )
})

export default function TabNavigator() {
  const { theme, colors } = useTheme()
  const insets = useSafeAreaInsets()
  const marginBottom = insets.bottom + 12

  const screenOptions = useMemo(
    () => buildFloatingTabOptions(colors, marginBottom, theme === 'dark'),
    [colors, marginBottom, theme],
  )

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon routeName="Stats" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Team"
        component={TeamScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon routeName="Team" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon routeName="Profile" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  )
}
