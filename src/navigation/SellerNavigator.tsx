import React, { useMemo } from 'react'
import { View } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { getFocusedRouteNameFromRoute } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '../components/icons'
import { useTheme } from '../context/ThemeContext'
import { buildFloatingTabOptions, floatingTabBarStyles } from './floatingTabBar'
import LiveFeedScreen from '../screens/seller/LiveFeedScreen'
import RecordActivityScreen from '../screens/seller/RecordActivityScreen'
import MySalesScreen from '../screens/seller/MySalesScreen'
import EditSavedSurveyScreen from '../screens/seller/EditSavedSurveyScreen'
import ProfileScreen from '../screens/main/ProfileScreen'

import type { SellerFeedStackParamList, SellerHistoryStackParamList } from './sellerTypes'

export type { SellerFeedStackParamList, SellerHistoryStackParamList } from './sellerTypes'

const FeedStack = createNativeStackNavigator<SellerFeedStackParamList>()
const HistoryStack = createNativeStackNavigator<SellerHistoryStackParamList>()
const Tab = createBottomTabNavigator()

function HistoryStackNavigator() {
  return (
    <HistoryStack.Navigator screenOptions={{ headerShown: false }}>
      <HistoryStack.Screen name="MySales" component={MySalesScreen} />
      <HistoryStack.Screen name="EditSavedSurvey" component={EditSavedSurveyScreen} />
    </HistoryStack.Navigator>
  )
}

function FeedStackNavigator() {
  return (
    <FeedStack.Navigator screenOptions={{ headerShown: false }}>
      <FeedStack.Screen name="LiveFeed" component={LiveFeedScreen} />
      <FeedStack.Screen name="RecordActivity" component={RecordActivityScreen} />
    </FeedStack.Navigator>
  )
}

const TabIcon = React.memo(function TabIcon({
  icon,
  focused,
}: {
  icon: string
  focused: boolean
}) {
  const { colors } = useTheme()
  return (
    <View style={[floatingTabBarStyles.iconWrap, focused && { backgroundColor: colors.primary }]}>
      <Ionicons
        name={icon as any}
        size={22}
        color={focused ? colors.white : colors.textSecondary}
      />
    </View>
  )
})

export default function SellerNavigator() {
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
        name="Feed"
        component={FeedStackNavigator}
        options={({ route }) => {
          const nestedRoute = getFocusedRouteNameFromRoute(route) ?? 'LiveFeed'
          const hideTabBar = nestedRoute === 'RecordActivity'
          return {
            tabBarStyle: hideTabBar
              ? { display: 'none' }
              : screenOptions.tabBarStyle,
            tabBarIcon: ({ focused }) => (
              <TabIcon icon={focused ? 'scan' : 'scan-outline'} focused={focused} />
            ),
          }
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryStackNavigator}
        options={({ route }) => {
          const nestedRoute = getFocusedRouteNameFromRoute(route) ?? 'MySales'
          const hideTabBar = nestedRoute === 'EditSavedSurvey'
          return {
            tabBarStyle: hideTabBar
              ? { display: 'none' }
              : screenOptions.tabBarStyle,
            tabBarIcon: ({ focused }) => (
              <TabIcon icon={focused ? 'time' : 'time-outline'} focused={focused} />
            ),
          }
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={focused ? 'settings' : 'settings-outline'} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  )
}
